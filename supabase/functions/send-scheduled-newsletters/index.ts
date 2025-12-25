import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Function to wrap links with tracking
function wrapLinksWithTracking(content: string, campaignId: string, email: string, baseUrl: string): string {
  const linkRegex = /<a\s+([^>]*href=["'])([^"']+)(["'][^>]*)>/gi;
  
  return content.replace(linkRegex, (match, prefix, url, suffix) => {
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
  return html.replace('</body>', `${trackingPixel}</body>`);
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Checking for scheduled newsletters to send...");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const baseUrl = Deno.env.get("SUPABASE_URL") ?? "";

    // Find scheduled campaigns that are due
    const now = new Date().toISOString();
    const { data: campaigns, error: campaignError } = await supabaseAdmin
      .from("newsletter_campaigns")
      .select("*")
      .eq("status", "scheduled")
      .lte("scheduled_at", now);

    if (campaignError) {
      console.error("Error fetching campaigns:", campaignError);
      throw new Error("Failed to fetch scheduled campaigns");
    }

    if (!campaigns || campaigns.length === 0) {
      console.log("No scheduled newsletters to send");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No scheduled newsletters found",
        processed: 0 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${campaigns.length} scheduled campaign(s) to send`);

    // Fetch active subscribers once
    const { data: subscribers, error: subError } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("email")
      .eq("is_active", true);

    if (subError || !subscribers || subscribers.length === 0) {
      console.log("No active subscribers found");
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No active subscribers",
        processed: 0 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let totalSent = 0;
    let totalFailed = 0;

    for (const campaign of campaigns) {
      console.log(`Processing campaign: ${campaign.id} - ${campaign.subject}`);

      // Update status to sending
      await supabaseAdmin
        .from("newsletter_campaigns")
        .update({ 
          status: 'sending',
          total_recipients: subscribers.length
        })
        .eq("id", campaign.id);

      let sentCount = 0;
      let failedCount = 0;

      for (const subscriber of subscribers) {
        try {
          // Generate unsubscribe token and URL
          const unsubscribeToken = btoa(subscriber.email).replace(/=/g, "");
          const unsubscribeUrl = `${baseUrl}/functions/v1/unsubscribe-newsletter?email=${encodeURIComponent(subscriber.email)}&token=${unsubscribeToken}`;

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
                  <h2 style="color: #1E293B; margin: 0 0 20px 0; font-size: 22px;">${campaign.subject}</h2>
                  <div style="color: #475569; font-size: 16px; line-height: 1.6;">
                    ${campaign.content}
                  </div>
                  
                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
                    <a href="https://vibelinkgh.com/get-started" style="display: inline-block; background: linear-gradient(135deg, #7C3AED 0%, #F59E0B 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">Create Your Invitation</a>
                  </div>
                </div>
                
                <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
                  <p style="margin: 0;">© ${new Date().getFullYear()} VibeLink Ghana. All rights reserved.</p>
                  <p style="margin: 8px 0 0 0;">Accra, Ghana | <a href="mailto:info@vibelinkgh.com" style="color: #7C3AED;">info@vibelinkgh.com</a></p>
                  <p style="margin: 12px 0 0 0;">
                    <a href="${unsubscribeUrl}" style="color: #94a3b8; text-decoration: underline;">Unsubscribe from this newsletter</a>
                  </p>
                </div>
              </div>
            </body>
            </html>
          `;

          // Add tracking
          emailHtml = wrapLinksWithTracking(emailHtml, campaign.id, subscriber.email, baseUrl);
          emailHtml = addTrackingPixel(emailHtml, campaign.id, subscriber.email, baseUrl);

          const { error: sendError } = await resend.emails.send({
            from: "VibeLink Ghana <orders@vibelinkgh.com>",
            to: subscriber.email,
            subject: campaign.subject,
            html: emailHtml,
          });

          if (sendError) {
            console.error(`Failed to send to ${subscriber.email}:`, sendError);
            failedCount++;
          } else {
            sentCount++;
          }

          // Rate limiting delay
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (emailError) {
          console.error(`Error sending to ${subscriber.email}:`, emailError);
          failedCount++;
        }
      }

      // Update campaign with final counts
      await supabaseAdmin
        .from("newsletter_campaigns")
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString(),
          sent_count: sentCount,
          failed_count: failedCount
        })
        .eq("id", campaign.id);

      console.log(`Campaign ${campaign.id} complete: ${sentCount} sent, ${failedCount} failed`);
      totalSent += sentCount;
      totalFailed += failedCount;
    }

    return new Response(JSON.stringify({ 
      success: true,
      processed: campaigns.length,
      totalSent,
      totalFailed,
      message: `Processed ${campaigns.length} campaign(s), sent ${totalSent} emails`
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Scheduled newsletter error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
