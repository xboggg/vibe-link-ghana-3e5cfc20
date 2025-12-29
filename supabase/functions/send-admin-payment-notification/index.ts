import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminPaymentNotificationRequest {
  orderId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  eventTitle: string;
  paymentType: "deposit" | "balance";
  amountPaid: number;
  totalPrice: number;
  reference?: string;
  paymentMethod?: string;
}

const ADMIN_EMAIL = "hello@vibelinkgh.com";

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: AdminPaymentNotificationRequest = await req.json();
    console.log("Sending admin payment notification:", data);

    const isDeposit = data.paymentType === "deposit";
    const remainingBalance = isDeposit ? data.amountPaid : 0;
    const paymentMethod = data.paymentMethod || "Paystack";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Received</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, ${isDeposit ? '#3b82f6 0%, #1d4ed8' : '#22c55e 0%, #16a34a'} 100%); border-radius: 16px 16px 0 0; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
              💰 ${isDeposit ? 'Deposit' : 'Balance'} Payment Received!
            </h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 28px; font-weight: bold;">
              GHS ${data.amountPaid.toLocaleString()}
            </p>
          </div>
          
          <div style="background-color: #ffffff; padding: 25px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #f0fdf4; border-radius: 8px; padding: 15px; margin-bottom: 20px; border-left: 4px solid #22c55e;">
              <p style="color: #166534; font-size: 14px; margin: 0; font-weight: 600;">
                ✅ A customer has just made a ${isDeposit ? '50% deposit' : 'balance'} payment via ${paymentMethod}!
              </p>
            </div>

            <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
              <h2 style="color: #333; font-size: 16px; margin: 0 0 15px 0; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
                📋 Order Details
              </h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Order ID:</td>
                  <td style="color: #333; padding: 8px 0; font-size: 14px; font-weight: 600; text-align: right;">#${data.orderId.substring(0, 8).toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Event:</td>
                  <td style="color: #333; padding: 8px 0; font-size: 14px; text-align: right;">${data.eventTitle}</td>
                </tr>
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Payment Type:</td>
                  <td style="color: #333; padding: 8px 0; font-size: 14px; text-align: right;">${isDeposit ? '50% Deposit' : '50% Balance'}</td>
                </tr>
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Amount:</td>
                  <td style="color: #22c55e; padding: 8px 0; font-size: 16px; font-weight: 700; text-align: right;">GHS ${data.amountPaid.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Payment Method:</td>
                  <td style="color: #333; padding: 8px 0; font-size: 14px; text-align: right;">${paymentMethod}</td>
                </tr>
                ${data.reference ? `
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Reference:</td>
                  <td style="color: #333; padding: 8px 0; font-size: 14px; text-align: right;">${data.reference}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
              <h2 style="color: #333; font-size: 16px; margin: 0 0 15px 0; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
                👤 Customer Details
              </h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Name:</td>
                  <td style="color: #333; padding: 8px 0; font-size: 14px; font-weight: 600; text-align: right;">${data.clientName}</td>
                </tr>
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Email:</td>
                  <td style="color: #333; padding: 8px 0; font-size: 14px; text-align: right;">${data.clientEmail}</td>
                </tr>
                ${data.clientPhone ? `
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Phone:</td>
                  <td style="color: #333; padding: 8px 0; font-size: 14px; text-align: right;">${data.clientPhone}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            ${isDeposit ? `
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 15px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
              <p style="color: #92400e; font-size: 14px; margin: 0;">
                <strong>📊 Payment Status:</strong><br>
                Total Order: GHS ${data.totalPrice.toLocaleString()}<br>
                Paid: GHS ${data.amountPaid.toLocaleString()}<br>
                <strong>Balance Due: GHS ${remainingBalance.toLocaleString()}</strong> (upon completion)
              </p>
            </div>
            ` : `
            <div style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-radius: 12px; padding: 15px; margin-bottom: 20px; border-left: 4px solid #22c55e;">
              <p style="color: #166534; font-size: 14px; margin: 0;">
                <strong>🎉 Order Fully Paid!</strong><br>
                Total Collected: GHS ${data.totalPrice.toLocaleString()}
              </p>
            </div>
            `}

            <div style="text-align: center; margin-top: 25px;">
              <a href="https://vibelinkgh.com/admin" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                View in Admin Dashboard
              </a>
            </div>
          </div>

          <div style="text-align: center; padding: 20px;">
            <p style="color: #888; font-size: 12px; margin: 0;">
              This is an automated notification from VibeLink Ghana
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "VibeLink Notifications <notifications@vibelinkgh.com>",
      to: [ADMIN_EMAIL],
      subject: `💰 ${isDeposit ? 'Deposit' : 'Balance'} Received: GHS ${data.amountPaid.toLocaleString()} - ${data.eventTitle}`,
      html: emailHtml,
    });

    console.log("Admin payment notification sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-admin-payment-notification function:", error);
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
