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

    const { subject, content }: NewsletterRequest = await req.json();

    if (!subject || !content) {
      return new Response(JSON.stringify({ error: "Subject and content are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Fetching active subscribers...");

    // Use service role to fetch subscribers
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: subscribers, error: subError } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("email")
      .eq("is_active", true);

    if (subError) {
      console.error("Error fetching subscribers:", subError);
      throw new Error("Failed to fetch subscribers");
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

    const emails = subscribers.map((s) => s.email);
    
    // Send in batches of 50 to avoid rate limits
    const batchSize = 50;
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      
      try {
        const { error: sendError } = await resend.emails.send({
          from: "VibeLink Ghana <orders@vibelinkgh.com>",
          to: "orders@vibelinkgh.com", // Required field - use self as recipient
          bcc: batch, // Actual recipients via BCC for privacy
          subject: subject,
          html: `
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
                    <a href="https://vibelinkgh.com/get-started" style="display: inline-block; background: linear-gradient(135deg, #7C3AED 0%, #F59E0B 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">Create Your Invitation</a>
                  </div>
                </div>
                
                <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
                  <p style="margin: 0;">© ${new Date().getFullYear()} VibeLink Ghana. All rights reserved.</p>
                  <p style="margin: 8px 0 0 0;">Accra, Ghana | <a href="mailto:info@vibelinkgh.com" style="color: #7C3AED;">info@vibelinkgh.com</a></p>
                </div>
              </div>
            </body>
            </html>
          `,
        });

        if (sendError) {
          console.error(`Batch ${i / batchSize + 1} failed:`, sendError);
          failedCount += batch.length;
        } else {
          sentCount += batch.length;
          console.log(`Batch ${i / batchSize + 1} sent successfully (${batch.length} emails)`);
        }
      } catch (batchError) {
        console.error(`Batch ${i / batchSize + 1} error:`, batchError);
        failedCount += batch.length;
      }
    }

    console.log(`Newsletter complete: ${sentCount} sent, ${failedCount} failed`);

    return new Response(JSON.stringify({ 
      success: true,
      sent: sentCount,
      failed: failedCount,
      total: emails.length,
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