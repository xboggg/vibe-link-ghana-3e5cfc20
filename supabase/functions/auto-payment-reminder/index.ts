import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Auto payment reminder cron job started");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate the date 3 days from now
    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);
    const targetDate = threeDaysFromNow.toISOString().split('T')[0];
    const reminderType = "auto_3_days_before";

    console.log("Checking for orders with event date:", targetDate);

    // Find orders with event date 3 days from now and pending/deposit_paid payment
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .eq("event_date", targetDate)
      .in("payment_status", ["pending", "deposit_paid"]);

    if (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }

    console.log(`Found ${orders?.length || 0} orders with upcoming events`);

    const results = [];

    for (const order of orders || []) {
      // Check if reminder was already sent for this order
      const { data: existingReminder } = await supabase
        .from("payment_reminder_logs")
        .select("id")
        .eq("order_id", order.id)
        .eq("reminder_type", reminderType)
        .eq("success", true)
        .maybeSingle();

      if (existingReminder) {
        console.log(`Reminder already sent for order ${order.id}, skipping`);
        results.push({ orderId: order.id, skipped: true, reason: "already_sent" });
        continue;
      }

      try {
        const formattedDate = order.event_date 
          ? new Date(order.event_date).toLocaleDateString('en-GB', { 
              day: 'numeric',
              month: 'long', 
              year: 'numeric' 
            })
          : 'Date to be confirmed';

        const paymentMessage = order.payment_status === 'pending' 
          ? `Your event is coming up in just 3 days! We noticed that the payment for your order is still pending. To ensure we deliver your ${order.event_type} invitation on time, please complete your payment as soon as possible.`
          : `Your event is coming up in just 3 days! We noticed that only the deposit has been paid for your order. To ensure timely delivery of your ${order.event_type} invitation design, please complete the remaining balance.`;

        const amountDue = order.payment_status === 'pending' 
          ? `GHS ${Number(order.total_price).toLocaleString()}`
          : `GHS ${(Number(order.total_price) * 0.5).toLocaleString()}`;

        const amountLabel = order.payment_status === 'pending' 
          ? 'Full Amount Due'
          : 'Remaining Balance';

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Urgent Payment Reminder</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">⏰ Urgent: Event in 3 Days!</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Order #${order.id.slice(0, 8).toUpperCase()}</p>
              </div>

              <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">
                  Hi <strong>${order.client_name}</strong>,
                </p>

                <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
                  ${paymentMessage}
                </p>

                <div style="background-color: #fff5f5; border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #e53e3e;">
                  <p style="color: #c53030; font-size: 14px; margin: 0; font-weight: 600;">
                    ⚠️ Your event "${order.event_title}" is scheduled for ${formattedDate}
                  </p>
                </div>

                <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
                  <h2 style="color: #333; font-size: 18px; margin: 0 0 15px 0; border-bottom: 2px solid #e53e3e; padding-bottom: 10px;">
                    📋 Order Summary
                  </h2>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="color: #666; padding: 8px 0; font-size: 14px;">Event:</td>
                      <td style="color: #333; padding: 8px 0; font-size: 14px; font-weight: 600; text-align: right;">${order.event_title}</td>
                    </tr>
                    <tr>
                      <td style="color: #666; padding: 8px 0; font-size: 14px;">Event Type:</td>
                      <td style="color: #333; padding: 8px 0; font-size: 14px; text-align: right;">${order.event_type.charAt(0).toUpperCase() + order.event_type.slice(1)}</td>
                    </tr>
                    <tr>
                      <td style="color: #666; padding: 8px 0; font-size: 14px;">Event Date:</td>
                      <td style="color: #333; padding: 8px 0; font-size: 14px; text-align: right;">${formattedDate}</td>
                    </tr>
                    <tr>
                      <td style="color: #666; padding: 8px 0; font-size: 14px;">Package:</td>
                      <td style="color: #333; padding: 8px 0; font-size: 14px; text-align: right;">${order.package_name}</td>
                    </tr>
                  </table>
                </div>

                <div style="background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%); border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0;">
                  <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">${amountLabel}</p>
                  <p style="color: #ffffff; font-size: 32px; margin: 0; font-weight: 700;">${amountDue}</p>
                </div>

                <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 25px 0;">
                  Please complete your payment immediately to avoid any delays with your invitation design. We want to ensure everything is perfect for your special day!
                </p>

                <div style="text-align: center; margin-top: 30px;">
                  <a href="https://wa.me/233245817973" style="display: inline-block; background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                    💬 Pay Now via WhatsApp
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

        console.log("Sending auto payment reminder to:", order.client_email);

        const emailResponse = await resend.emails.send({
          from: "VibeLink Ghana <orders@vibelinkgh.com>",
          to: [order.client_email],
          subject: `⏰ URGENT: Payment Reminder - ${order.event_title} in 3 Days! | VibeLink Ghana`,
          html: emailHtml,
        });

        console.log("Auto reminder sent for order:", order.id, emailResponse);

        // Log successful reminder
        await supabase.from("payment_reminder_logs").insert({
          order_id: order.id,
          reminder_type: reminderType,
          recipient_email: order.client_email,
          success: true,
        });

        results.push({ orderId: order.id, success: true, email: order.client_email });
      } catch (emailError: any) {
        console.error("Error sending reminder for order:", order.id, emailError);

        // Log failed reminder
        await supabase.from("payment_reminder_logs").insert({
          order_id: order.id,
          reminder_type: reminderType,
          recipient_email: order.client_email,
          success: false,
          error_message: emailError.message,
        });

        results.push({ orderId: order.id, success: false, error: emailError.message });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${results.length} orders`,
        results 
      }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in auto payment reminder:", error);
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
