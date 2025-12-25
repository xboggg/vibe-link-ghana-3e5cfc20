import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminNotificationRequest {
  orderId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientWhatsapp?: string;
  eventType: string;
  eventTitle: string;
  eventDate: string | null;
  eventTime?: string;
  venueName?: string;
  venueAddress?: string;
  packageName: string;
  packagePrice: number;
  totalPrice: number;
  addOns: { name: string; price: number }[];
  colorPalette?: string;
  stylePreference?: string;
  deliveryType: string;
  specialRequests?: string;
}

// Rate limiting constants
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MINUTES = 60;

async function checkRateLimit(supabase: any, functionName: string, clientIp: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_function_name: functionName,
      p_client_ip: clientIp,
      p_max_requests: RATE_LIMIT_MAX_REQUESTS,
      p_window_minutes: RATE_LIMIT_WINDOW_MINUTES
    });
    
    if (error) {
      console.error("Rate limit check error:", error);
      return true;
    }
    
    return data === true;
  } catch (err) {
    console.error("Rate limit check exception:", err);
    return true;
  }
}

function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
         req.headers.get("x-real-ip") || 
         "unknown";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check rate limit
    const clientIp = getClientIp(req);
    const isAllowed = await checkRateLimit(supabase, "send-admin-notification", clientIp);
    
    if (!isAllowed) {
      console.log(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const data: AdminNotificationRequest = await req.json();
    console.log("Sending admin notification for new order:", data.orderId);

    const addOnsList = data.addOns && data.addOns.length > 0
      ? data.addOns.map(a => `<li>${a.name} - GHS ${a.price.toLocaleString()}</li>`).join("")
      : "<li>None selected</li>";

    const eventDateFormatted = data.eventDate 
      ? new Date(data.eventDate).toLocaleDateString("en-GB", { 
          day: "numeric", 
          month: "long", 
          year: "numeric" 
        })
      : "To be confirmed";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order Alert</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🔔 NEW ORDER ALERT!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">A new order has been placed on VibeLink Ghana</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <div style="background-color: #fff3cd; border-radius: 12px; padding: 15px; margin-bottom: 25px; border-left: 4px solid #ffc107;">
              <p style="color: #856404; font-size: 14px; margin: 0; font-weight: 600;">
                ⚡ Action Required: Review and process this order ASAP!
              </p>
            </div>

            <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
              <h2 style="color: #333; font-size: 18px; margin: 0 0 15px 0; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">
                👤 Client Information
              </h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Name:</td>
                  <td style="color: #333; padding: 8px 0; font-size: 14px; font-weight: 600; text-align: right;">${data.clientName}</td>
                </tr>
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Email:</td>
                  <td style="color: #333; padding: 8px 0; font-size: 14px; text-align: right;">
                    <a href="mailto:${data.clientEmail}" style="color: #667eea;">${data.clientEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Phone:</td>
                  <td style="color: #333; padding: 8px 0; font-size: 14px; text-align: right;">
                    <a href="tel:${data.clientPhone}" style="color: #667eea;">${data.clientPhone}</a>
                  </td>
                </tr>
                ${data.clientWhatsapp ? `
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">WhatsApp:</td>
                  <td style="color: #333; padding: 8px 0; font-size: 14px; text-align: right;">
                    <a href="https://wa.me/${data.clientWhatsapp.replace(/\D/g, '')}" style="color: #25D366;">${data.clientWhatsapp}</a>
                  </td>
                </tr>
                ` : ''}
              </table>
            </div>

            <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
              <h2 style="color: #333; font-size: 18px; margin: 0 0 15px 0; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">
                📋 Order Details
              </h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Order ID:</td>
                  <td style="color: #333; padding: 8px 0; font-size: 14px; font-weight: 600; text-align: right;">#${data.orderId.substring(0, 8).toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Event Type:</td>
                  <td style="color: #333; padding: 8px 0; font-size: 14px; text-align: right;">${data.eventType.charAt(0).toUpperCase() + data.eventType.slice(1)}</td>
                </tr>
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Event Title:</td>
                  <td style="color: #333; padding: 8px 0; font-size: 14px; text-align: right;">${data.eventTitle}</td>
                </tr>
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Event Date:</td>
                  <td style="color: #333; padding: 8px 0; font-size: 14px; text-align: right;">${eventDateFormatted}</td>
                </tr>
                ${data.eventTime ? `
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Event Time:</td>
                  <td style="color: #333; padding: 8px 0; font-size: 14px; text-align: right;">${data.eventTime}</td>
                </tr>
                ` : ''}
                ${data.venueName ? `
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Venue:</td>
                  <td style="color: #333; padding: 8px 0; font-size: 14px; text-align: right;">${data.venueName}</td>
                </tr>
                ` : ''}
                ${data.venueAddress ? `
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Address:</td>
                  <td style="color: #333; padding: 8px 0; font-size: 14px; text-align: right;">${data.venueAddress}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
              <h2 style="color: #333; font-size: 18px; margin: 0 0 15px 0; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">
                🎨 Design Preferences
              </h2>
              <table style="width: 100%; border-collapse: collapse;">
                ${data.colorPalette ? `
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Color Palette:</td>
                  <td style="color: #333; padding: 8px 0; font-size: 14px; text-align: right;">${data.colorPalette}</td>
                </tr>
                ` : ''}
                ${data.stylePreference ? `
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Style:</td>
                  <td style="color: #333; padding: 8px 0; font-size: 14px; text-align: right;">${data.stylePreference}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Delivery:</td>
                  <td style="color: #333; padding: 8px 0; font-size: 14px; text-align: right;">${data.deliveryType === 'rush' ? '⚡ Rush (48h)' : 'Standard'}</td>
                </tr>
              </table>
              ${data.specialRequests ? `
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
                <p style="color: #666; font-size: 14px; margin: 0 0 8px 0;">Special Requests:</p>
                <p style="color: #333; font-size: 14px; margin: 0; background: #fff; padding: 12px; border-radius: 8px; border: 1px solid #eee;">${data.specialRequests}</p>
              </div>
              ` : ''}
            </div>

            <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
              <h2 style="color: #333; font-size: 18px; margin: 0 0 15px 0; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">
                💰 Package & Pricing
              </h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Package:</td>
                  <td style="color: #333; padding: 8px 0; font-size: 14px; font-weight: 600; text-align: right;">${data.packageName}</td>
                </tr>
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Package Price:</td>
                  <td style="color: #333; padding: 8px 0; font-size: 14px; text-align: right;">GHS ${data.packagePrice.toLocaleString()}</td>
                </tr>
              </table>
              
              <div style="margin-top: 15px;">
                <p style="color: #666; font-size: 14px; margin: 0 0 8px 0;">Add-ons:</p>
                <ul style="color: #333; font-size: 14px; margin: 0; padding-left: 20px;">
                  ${addOnsList}
                </ul>
              </div>
              
              <div style="margin-top: 20px; padding-top: 15px; border-top: 2px dashed #ddd;">
                <table style="width: 100%;">
                  <tr>
                    <td style="color: #333; font-size: 20px; font-weight: 700;">TOTAL:</td>
                    <td style="color: #e74c3c; font-size: 20px; font-weight: 700; text-align: right;">GHS ${data.totalPrice.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="color: #666; font-size: 14px;">Deposit (50%):</td>
                    <td style="color: #333; font-size: 14px; font-weight: 600; text-align: right;">GHS ${(data.totalPrice / 2).toLocaleString()}</td>
                  </tr>
                </table>
              </div>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="https://wa.me/${data.clientPhone.replace(/\D/g, '')}" style="display: inline-block; background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-right: 10px;">
                💬 Contact Client
              </a>
            </div>
          </div>

          <div style="text-align: center; padding: 25px 20px;">
            <p style="color: #888; font-size: 13px; margin: 0;">
              This is an automated notification from VibeLink Ghana
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send to admin email
    const adminEmail = "info@vibelinkgh.com";
    
    const emailResponse = await resend.emails.send({
      from: "VibeLink Ghana <orders@itdeshop.com>",
      to: [adminEmail],
      subject: `🔔 NEW ORDER: ${data.eventTitle} - GHS ${data.totalPrice.toLocaleString()} | ${data.clientName}`,
      html: emailHtml,
    });

    console.log("Admin notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-admin-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
