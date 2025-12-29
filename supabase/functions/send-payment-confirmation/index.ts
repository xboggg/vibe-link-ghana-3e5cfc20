import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentConfirmationRequest {
  orderId: string;
  clientName: string;
  clientEmail: string;
  eventTitle: string;
  paymentType: "deposit" | "balance";
  amountPaid: number;
  totalPrice: number;
  reference?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: PaymentConfirmationRequest = await req.json();
    console.log("Sending payment confirmation email:", data);

    const isDeposit = data.paymentType === "deposit";
    const remainingBalance = isDeposit ? data.amountPaid : 0;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Confirmation</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, ${isDeposit ? '#667eea 0%, #764ba2' : '#22c55e 0%, #16a34a'} 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
              ${isDeposit ? '💳 Deposit Received!' : '🎉 Payment Complete!'}
            </h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
              ${isDeposit ? 'We\'ve received your 50% deposit' : 'Your order is now fully paid'}
            </p>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">
              Hi <strong>${data.clientName}</strong>,
            </p>
            
            <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
              ${isDeposit 
                ? 'Thank you for your deposit! We\'ve received your payment and our team is now starting work on your beautiful event stationery.'
                : 'Congratulations! Your order is now fully paid. Thank you for choosing VibeLink Ghana for your special event!'}
            </p>

            <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
              <h2 style="color: #333; font-size: 18px; margin: 0 0 15px 0; border-bottom: 2px solid ${isDeposit ? '#667eea' : '#22c55e'}; padding-bottom: 10px;">
                💰 Payment Details
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
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Amount Paid:</td>
                  <td style="color: ${isDeposit ? '#667eea' : '#22c55e'}; padding: 8px 0; font-size: 18px; font-weight: 700; text-align: right;">GHS ${data.amountPaid.toLocaleString()}</td>
                </tr>
                ${data.reference ? `
                <tr>
                  <td style="color: #666; padding: 8px 0; font-size: 14px;">Reference:</td>
                  <td style="color: #333; padding: 8px 0; font-size: 14px; text-align: right;">${data.reference}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            ${isDeposit ? `
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #f59e0b;">
              <h3 style="color: #92400e; font-size: 16px; margin: 0 0 10px 0;">📊 Payment Summary</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: #92400e; padding: 5px 0; font-size: 14px;">Total Order Value:</td>
                  <td style="color: #92400e; padding: 5px 0; font-size: 14px; text-align: right;">GHS ${data.totalPrice.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="color: #92400e; padding: 5px 0; font-size: 14px;">Deposit Paid (50%):</td>
                  <td style="color: #16a34a; padding: 5px 0; font-size: 14px; font-weight: 600; text-align: right;">- GHS ${data.amountPaid.toLocaleString()}</td>
                </tr>
                <tr style="border-top: 2px dashed #d97706;">
                  <td style="color: #92400e; padding: 10px 0 5px 0; font-size: 14px; font-weight: 600;">Balance Due:</td>
                  <td style="color: #92400e; padding: 10px 0 5px 0; font-size: 16px; font-weight: 700; text-align: right;">GHS ${remainingBalance.toLocaleString()}</td>
                </tr>
              </table>
              <p style="color: #92400e; font-size: 13px; margin: 15px 0 0 0; font-style: italic;">
                💡 The remaining balance will be due upon completion of your design.
              </p>
            </div>
            ` : `
            <div style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #22c55e;">
              <h3 style="color: #166534; font-size: 16px; margin: 0 0 10px 0;">✅ Order Fully Paid</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: #166534; padding: 5px 0; font-size: 14px;">Total Paid:</td>
                  <td style="color: #166534; padding: 5px 0; font-size: 18px; font-weight: 700; text-align: right;">GHS ${data.totalPrice.toLocaleString()}</td>
                </tr>
              </table>
              <p style="color: #166534; font-size: 13px; margin: 15px 0 0 0;">
                🎊 No further payments required. Enjoy your beautiful invitation!
              </p>
            </div>
            `}

            <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
              <h3 style="color: #333; font-size: 16px; margin: 0 0 10px 0;">⏰ What's Next?</h3>
              <ol style="color: #555; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.8;">
                ${isDeposit ? `
                <li>Our design team is now working on your invitation</li>
                <li>You'll receive a draft preview within 24-48 hours</li>
                <li>Review the design and request any revisions</li>
                <li>Pay the remaining balance after you approve the final design</li>
                ` : `
                <li>Your final design files are ready or being prepared</li>
                <li>You'll receive download links via email/WhatsApp</li>
                <li>Share your beautiful invitation with your guests!</li>
                `}
              </ol>
            </div>

            <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
              Questions? We're always here to help. Reach out via WhatsApp or email!
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
      from: "VibeLink Ghana <payments@vibelinkgh.com>",
      to: [data.clientEmail],
      subject: isDeposit 
        ? `💳 Deposit Received - ${data.eventTitle} | VibeLink Ghana`
        : `🎉 Payment Complete - ${data.eventTitle} | VibeLink Ghana`,
      html: emailHtml,
    });

    console.log("Payment confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-payment-confirmation function:", error);
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
