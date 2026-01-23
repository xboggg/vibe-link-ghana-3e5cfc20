import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface OrderConfirmationRequest {
  orderId: string;
  clientName: string;
  clientEmail: string;
  eventType: string;
  eventTitle: string;
  eventDate: string | null;
  packageName: string;
  packagePrice: number;
  totalPrice: number;
  addOns: { name: string; price: number }[];
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
      // Allow request if rate limit check fails
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
    const isAllowed = await checkRateLimit(supabase, "send-order-confirmation", clientIp);
    
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

    const data: OrderConfirmationRequest = await req.json();
    console.log("Sending order confirmation email:", data);

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
        <title>Order Confirmation</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🎉 Order Confirmed!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Thank you for choosing VibeLink Ghana</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">
              Hi <strong>${data.clientName}</strong>,
            </p>
            
            <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
              We're excited to confirm your order! Our team will start working on your beautiful event stationery soon.
            </p>

            <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
              <h2 style="color: #333; font-size: 18px; margin: 0 0 15px 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
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
              </table>
            </div>

            <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
              <h2 style="color: #333; font-size: 18px; margin: 0 0 15px 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
                📦 Package & Pricing
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
                    <td style="color: #333; font-size: 18px; font-weight: 700;">Total:</td>
                    <td style="color: #667eea; font-size: 18px; font-weight: 700; text-align: right;">GHS ${data.totalPrice.toLocaleString()}</td>
                  </tr>
                </table>
              </div>
            </div>

            <div style="background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%); border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #ffc107;">
              <h3 style="color: #856404; font-size: 16px; margin: 0 0 10px 0;">⏰ What's Next?</h3>
              <ol style="color: #856404; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li>Our team will review your order details</li>
                <li>We'll contact you to confirm payment (50% deposit required)</li>
                <li>Design work begins after deposit confirmation</li>
                <li>You'll receive a draft for review within 3-5 business days</li>
              </ol>
            </div>

            <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
              If you have any questions, feel free to reach out to us via WhatsApp or email. We're here to make your event unforgettable!
            </p>

            <div style="text-align: center; margin-top: 30px;">
              <a href="https://wa.me/233245817973" style="display: inline-block; background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                💬 Chat with Us on WhatsApp
              </a>
            </div>
          </div>

          <div style="text-align: center; padding: 25px 20px;">
            <p style="color: #888; font-size: 13px; margin: 0 0 10px 0;">
              © ${new Date().getFullYear()} VibeLink Ghana. All rights reserved.
            </p>
            <p style="color: #aaa; font-size: 12px; margin: 0;">
              Event Stationery & Décor Design
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "VibeLink Ghana <orders@vibelinkgh.com>",
      to: [data.clientEmail],
      subject: `🎉 Order Confirmed - ${data.eventTitle} | VibeLink Ghana`,
      html: emailHtml,
    });

    console.log("Order confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-order-confirmation function:", error);
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
