import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewsletterRequest {
  subject: string;
  content: string;
  campaignId?: string;
  topic?: string; // Filter by topic: announcements, promotions, events, showcase
}

// Function to wrap links with tracking
function wrapLinksWithTracking(content: string, campaignId: string, email: string, baseUrl: string): string {
  const linkRegex = /<a\s+([^>]*href=["'])([^"']+)(["'][^>]*)>/gi;
  
  return content.replace(linkRegex, (match, prefix, url, suffix) => {
    // Don't wrap unsubscribe or tracking links
    if (url.includes('unsubscribe') || url.includes('track-')) {
      return match;
    }
    
    const trackingUrl = `${baseUrl}/functions/v1/track-newsletter?type=click&campaign=${campaignId}&email=${encodeURIComponent(email)}&url=${encodeURIComponent(url)}`;
    return `<a ${prefix}${trackingUrl}${suffix}>`;
  });
}

// Function to add tracking pixel
function addTrackingPixel(html: string, campaignId: string, email: string, baseUrl: string): string {
  const trackingPixelUrl = `${baseUrl}/functions/v1/track-newsletter?type=open&campaign=${campaignId}&email=${encodeURIComponent(email)}`;
  const trackingPixel = `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" />`;
  
  // Add before closing body tag
  return html.replace('</body>', `${trackingPixel}</body>`);
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting newsletter send...");

    // Verify admin authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is admin
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleData, error: roleError } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (roleError || !roleData) {
      console.error("Not an admin:", roleError);
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { subject, content, campaignId, topic }: NewsletterRequest = await req.json();

    if (!subject || !content) {
      return new Response(JSON.stringify({ error: "Subject and content are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Fetching active subscribers${topic ? ` for topic: ${topic}` : ''}...`);

    console.log("Fetching active subscribers...");

    // Use service role to fetch subscribers and update campaign
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const baseUrl = Deno.env.get("SUPABASE_URL") ?? "";

    // Create or use existing campaign
    let activeCampaignId = campaignId;
    if (!activeCampaignId) {
      const { data: campaign, error: campaignError } = await supabaseAdmin
        .from("newsletter_campaigns")
        .insert({
          subject,
          content,
          status: 'sending',
          created_by: user.id
        })
        .select()
        .single();

      if (campaignError) {
        console.error("Error creating campaign:", campaignError);
      } else {
        activeCampaignId = campaign.id;
      }
    } else {
      // Update existing campaign status
      await supabaseAdmin
        .from("newsletter_campaigns")
        .update({ status: 'sending' })
        .eq("id", activeCampaignId);
    }

    // Build query for subscribers
    let subscriberQuery = supabaseAdmin
      .from("newsletter_subscribers")
      .select("email, frequency, topics")
      .eq("is_active", true);

    const { data: allSubscribers, error: subError } = await subscriberQuery;

    if (subError) {
      console.error("Error fetching subscribers:", subError);
      throw new Error("Failed to fetch subscribers");
    }

    // Filter subscribers based on topic preference (if topic is specified)
    let subscribers = allSubscribers || [];
    if (topic && subscribers.length > 0) {
      subscribers = subscribers.filter(sub => {
        // If subscriber has no topics set, include them for all
        if (!sub.topics || sub.topics.length === 0) return true;
        return sub.topics.includes(topic);
      });
      console.log(`Filtered to ${subscribers.length} subscribers interested in "${topic}"`);
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No active subscribers found",
        sent: 0 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Sending newsletter to ${subscribers.length} subscribers...`);

    // Update campaign with total recipients
    if (activeCampaignId) {
      await supabaseAdmin
        .from("newsletter_campaigns")
        .update({ total_recipients: subscribers.length })
        .eq("id", activeCampaignId);
    }
    
    // Send individually for tracking (instead of BCC)
    let sentCount = 0;
    let failedCount = 0;

    for (const subscriber of subscribers) {
      try {
        // Generate tokens and URLs
        const subscriberToken = btoa(subscriber.email).replace(/=/g, "");
        const unsubscribeUrl = `${baseUrl}/functions/v1/unsubscribe-newsletter?email=${encodeURIComponent(subscriber.email)}&token=${subscriberToken}`;
        const preferencesUrl = `${baseUrl}/functions/v1/newsletter-preferences?email=${encodeURIComponent(subscriber.email)}&token=${subscriberToken}`;

        // Create HTML email with tracking
        let emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="background: linear-gradient(135deg, #7C3AED 0%, #F59E0B 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">✨ VibeLink Ghana</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Your Event. Our Vibe.</p>
              </div>
              
              <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #1E293B; margin: 0 0 20px 0; font-size: 22px;">${subject}</h2>
                <div style="color: #475569; font-size: 16px; line-height: 1.6;">
                  ${content}
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
                  <a href="https://vibelinkevent.com/get-started" style="display: inline-block; background: linear-gradient(135deg, #7C3AED 0%, #F59E0B 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">Create Your Invitation</a>
                </div>
              </div>
              
              <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
                <p style="margin: 0;">© ${new Date().getFullYear()} VibeLink Ghana. All rights reserved.</p>
                <p style="margin: 8px 0 0 0;">Accra, Ghana | <a href="mailto:info@vibelinkevent.com" style="color: #7C3AED;">info@vibelinkevent.com</a></p>
                <p style="margin: 12px 0 0 0;">
                  <a href="${preferencesUrl}" style="color: #94a3b8; text-decoration: underline;">Manage preferences</a>
                  &nbsp;|&nbsp;
                  <a href="${unsubscribeUrl}" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a>
                </p>
              </div>
            </div>
          </body>
          </html>
        `;

        // Add tracking if campaign exists
        if (activeCampaignId) {
          emailHtml = wrapLinksWithTracking(emailHtml, activeCampaignId, subscriber.email, baseUrl);
          emailHtml = addTrackingPixel(emailHtml, activeCampaignId, subscriber.email, baseUrl);
        }

        const { error: sendError } = await resend.emails.send({
          from: "VibeLink Ghana <orders@vibelinkevent.com>",
          to: subscriber.email,
          subject: subject,
          html: emailHtml,
        });

        if (sendError) {
          console.error(`Failed to send to ${subscriber.email}:`, sendError);
          failedCount++;
        } else {
          sentCount++;
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (emailError) {
        console.error(`Error sending to ${subscriber.email}:`, emailError);
        failedCount++;
      }
    }

    // Update campaign with final counts
    if (activeCampaignId) {
      await supabaseAdmin
        .from("newsletter_campaigns")
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString(),
          sent_count: sentCount,
          failed_count: failedCount
        })
        .eq("id", activeCampaignId);
    }

    console.log(`Newsletter complete: ${sentCount} sent, ${failedCount} failed`);

    return new Response(JSON.stringify({ 
      success: true,
      sent: sentCount,
      failed: failedCount,
      total: subscribers.length,
      campaignId: activeCampaignId,
      message: `Newsletter sent to ${sentCount} subscribers${failedCount > 0 ? ` (${failedCount} failed)` : ''}`
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Newsletter send error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
