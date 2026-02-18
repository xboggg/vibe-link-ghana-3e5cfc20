import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Order {
  id: string;
  client_name: string;
  client_email: string;
  event_title: string;
  event_type: string;
  event_date: string | null;
  package_name: string;
  total_price: number;
  order_status: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
}

interface FollowUpSetting {
  id: string;
  follow_up_type: string;
  enabled: boolean;
  days_after: number;
  email_subject: string;
  email_template: string;
}

type FollowUpType = 
  | "payment_reminder_3_days"
  | "payment_reminder_7_days"
  | "draft_review_reminder"
  | "completion_thank_you";

// Replace template variables with actual order data
const replaceTemplateVariables = (template: string, order: Order): string => {
  return template
    .replace(/\{\{client_name\}\}/g, order.client_name)
    .replace(/\{\{order_id\}\}/g, order.id.substring(0, 8).toUpperCase())
    .replace(/\{\{event_title\}\}/g, order.event_title)
    .replace(/\{\{total_price\}\}/g, order.total_price.toLocaleString())
    .replace(/\{\{event_date\}\}/g, order.event_date || 'TBD')
    .replace(/\{\{package_name\}\}/g, order.package_name);
};

// Wrap template content in email HTML structure
const wrapInEmailTemplate = (content: string, subject: string, order: Order): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #6B46C1 0%, #D4AF37 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                    ✨ VibeLink Event
                  </h1>
                  <p style="margin: 12px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                    Your Event. Our Creativity.
                  </p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  ${content}
                  
                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                      <td align="center">
                        <a href="https://wa.me/233245817973" style="display: inline-block; background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 10px; font-weight: 600; font-size: 16px;">💬 Contact Us on WhatsApp</a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 30px 0 0 0; color: #888888; font-size: 13px; line-height: 1.6; text-align: center;">
                    Order ID: #${order.id.substring(0, 8).toUpperCase()}
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #1a1a2e; padding: 30px; text-align: center;">
                  <p style="margin: 0 0 10px 0; color: #D4AF37; font-size: 18px; font-weight: bold;">
                    VibeLink Event
                  </p>
                  <p style="margin: 0 0 10px 0; color: rgba(255,255,255,0.7); font-size: 13px;">
                    Accra, Ghana | info@vibelinkevent.com
                  </p>
                  <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 12px;">
                    © ${new Date().getFullYear()} VibeLink Event. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-follow-up-emails function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch settings from database
    const { data: settingsData, error: settingsError } = await supabase
      .from("follow_up_settings")
      .select("*");

    if (settingsError) {
      console.error("Error fetching settings:", settingsError);
      throw new Error("Failed to fetch follow-up settings");
    }

    const settings: Record<string, FollowUpSetting> = {};
    for (const s of settingsData || []) {
      settings[s.follow_up_type] = s;
    }

    console.log("Loaded settings:", Object.keys(settings));

    const now = new Date();
    const results: { type: string; sent: number; errors: number }[] = [];

    // Process each follow-up type
    const followUpTypes: FollowUpType[] = [
      "payment_reminder_3_days",
      "payment_reminder_7_days",
      "draft_review_reminder",
      "completion_thank_you"
    ];

    for (const followUpType of followUpTypes) {
      const setting = settings[followUpType];
      
      // Skip if setting doesn't exist or is disabled
      if (!setting || !setting.enabled) {
        console.log(`Skipping ${followUpType}: ${!setting ? 'no setting found' : 'disabled'}`);
        results.push({ type: followUpType, sent: 0, errors: 0 });
        continue;
      }

      const daysAgo = new Date(now.getTime() - setting.days_after * 24 * 60 * 60 * 1000);
      let orders: Order[] = [];

      // Get orders based on follow-up type
      if (followUpType === "payment_reminder_3_days" || followUpType === "payment_reminder_7_days") {
        const { data } = await supabase
          .from("orders")
          .select("*")
          .eq("payment_status", "pending")
          .neq("order_status", "cancelled")
          .lt("created_at", daysAgo.toISOString());
        orders = data || [];
      } else if (followUpType === "draft_review_reminder") {
        const { data } = await supabase
          .from("orders")
          .select("*")
          .eq("order_status", "draft_ready")
          .lt("updated_at", daysAgo.toISOString());
        orders = data || [];
      } else if (followUpType === "completion_thank_you") {
        const { data } = await supabase
          .from("orders")
          .select("*")
          .eq("order_status", "completed")
          .lt("updated_at", daysAgo.toISOString());
        orders = data || [];
      }

      console.log(`Found ${orders.length} orders for ${followUpType}`);

      let sent = 0, errors = 0;
      for (const order of orders) {
        // Check if already sent this type of follow-up
        const { data: existingLog } = await supabase
          .from("follow_up_logs")
          .select("id")
          .eq("order_id", order.id)
          .eq("follow_up_type", followUpType)
          .single();

        if (!existingLog) {
          try {
            // Replace variables in template and subject
            const emailContent = replaceTemplateVariables(setting.email_template, order);
            const emailSubject = replaceTemplateVariables(setting.email_subject, order);
            const fullHtml = wrapInEmailTemplate(emailContent, emailSubject, order);

            await resend.emails.send({
              from: "VibeLink Event <orders@vibelinkevent.com>",
              to: [order.client_email],
              subject: emailSubject,
              html: fullHtml,
            });

            await supabase.from("follow_up_logs").insert({
              order_id: order.id,
              follow_up_type: followUpType,
              success: true,
            });
            sent++;
            console.log(`Sent ${followUpType} to ${order.client_email}`);
          } catch (error: any) {
            console.error(`Error sending ${followUpType} to ${order.client_email}:`, error.message);
            await supabase.from("follow_up_logs").insert({
              order_id: order.id,
              follow_up_type: followUpType,
              success: false,
              error_message: error.message,
            });
            errors++;
          }
        }
      }
      results.push({ type: followUpType, sent, errors });
    }

    console.log("Follow-up emails processing complete:", results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        totalSent: results.reduce((sum, r) => sum + r.sent, 0),
        totalErrors: results.reduce((sum, r) => sum + r.errors, 0),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-follow-up-emails function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
