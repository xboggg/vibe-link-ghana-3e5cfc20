import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentReminderRequest {
  clientName: string;
  clientEmail: string;
  orderId: string;
  eventTitle: string;
  eventType: string;
  eventDate: string | null;
  packageName: string;
  totalPrice: number;
  paymentStatus: string;
}

// Rate limiting constants
const RATE_LIMIT_MAX_REQUESTS = 10;
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
  console.log("Payment reminder function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check rate limit
    const clientIp = getClientIp(req);
    const isAllowed = await checkRateLimit(supabase, "send-payment-reminder", clientIp);
    
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

    const data: PaymentReminderRequest = await req.json();
    console.log("Payment reminder data:", data);

    const {
      clientName,
      clientEmail,
      orderId,
      eventTitle,
      eventType,
      eventDate,
      packageName,
      totalPrice,
      paymentStatus,
    } = data;

    const formattedDate = eventDate 
      ? new Date(eventDate).toLocaleDateString('en-GB', { 
          day: 'numeric',
          month: 'long', 
          year: 'numeric' 
        })
      : 'Date to be confirmed';

    const paymentMessage = paymentStatus === 'pending' 
      ? `We noticed that the payment for your order is still pending. To proceed with your ${eventType} invitation design, please complete your payment at your earliest convenience.`
      : `We noticed that only the deposit has been paid for your order. To ensure timely delivery of your ${eventType} invitation design, please complete the remaining balance.`;

    const amountDue = paymentStatus === 'pending' 
      ? `GHS ${totalPrice.toLocaleString()}`
      : `GHS ${(totalPrice * 0.5).toLocaleString()}`;

    const amountLabel = paymentStatus === 'pending' 
      ? 'Full Amount Due'
      : 'Remaining Balance';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Reminder</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">💳 Payment Reminder</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Order #${orderId.slice(0, 8).toUpperCase()}</p>
          </div>

          <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">
              Hi <strong>${clientName}</strong>,
            </p>

            <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
              ${paymentMessage}
            </p>

            <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
              <h2 style="color: #333; font-size: 18px; margin: 0 0 15px 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
                📋 Order Summary
              </h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Event:</td>
                  <td style="color: #333; padding: 8px 0; font-size: 14px; font-weight: 600; text-align: right;">${eventTitle}</td>
                </tr>
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Event Type:</td>
                  <td style="color: #333; padding: 8px 0; font-size: 14px; text-align: right;">${eventType.charAt(0).toUpperCase() + eventType.slice(1)}</td>
                </tr>
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Event Date:</td>
                  <td style="color: #333; padding: 8px 0; font-size: 14px; text-align: right;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Package:</td>
                  <td style="color: #333; padding: 8px 0; font-size: 14px; text-align: right;">${packageName}</td>
                </tr>
              </table>
            </div>

            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0;">
              <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">${amountLabel}</p>
              <p style="color: #ffffff; font-size: 32px; margin: 0; font-weight: 700;">${amountDue}</p>
            </div>

            <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 25px 0;">
              Once payment is received, we will begin working on your beautiful invitation design right away!
            </p>

            <div style="background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%); border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #ffc107;">
              <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.6;">
                <strong>Need assistance?</strong><br>
                Reply to this email or reach us on WhatsApp for payment options and any questions.
              </p>
            </div>

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

    console.log("Sending payment reminder email to:", clientEmail);

    const emailResponse = await resend.emails.send({
      from: "VibeLink Ghana <orders@itdeshop.com>",
      to: [clientEmail],
      subject: `💳 Payment Reminder - ${eventTitle} | VibeLink Ghana`,
      html: emailHtml,
    });

    console.log("Payment reminder email sent successfully:", emailResponse);

    // Log the manual reminder
    await supabase.from("payment_reminder_logs").insert({
      order_id: orderId,
      reminder_type: "manual",
      recipient_email: clientEmail,
      success: true,
    });

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending payment reminder:", error);
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
