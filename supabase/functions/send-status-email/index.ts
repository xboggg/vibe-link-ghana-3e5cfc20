import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StatusEmailRequest {
  clientName: string;
  clientEmail: string;
  eventTitle: string;
  orderId: string;
  orderStatus: string;
  paymentStatus?: string;
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  draft_ready: "Draft Ready for Review",
  revision: "Revision in Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const paymentLabels: Record<string, string> = {
  pending: "Payment Pending",
  deposit_paid: "Deposit Paid",
  fully_paid: "Fully Paid",
};

const getStatusMessage = (status: string): string => {
  switch (status) {
    case "pending":
      return "We have received your order and it is being processed.";
    case "in_progress":
      return "Great news! Our design team has started working on your invitation.";
    case "draft_ready":
      return "Your draft is ready for review! Please check your email or contact us to view and approve your design.";
    case "revision":
      return "We are working on the revisions you requested. You'll receive an update soon.";
    case "completed":
      return "Congratulations! Your invitation design is complete and ready for delivery.";
    case "cancelled":
      return "Your order has been cancelled. If you have any questions, please contact us.";
    default:
      return "Your order status has been updated.";
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-status-email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      clientName, 
      clientEmail, 
      eventTitle, 
      orderId, 
      orderStatus,
      paymentStatus 
    }: StatusEmailRequest = await req.json();

    console.log(`Sending status email to ${clientEmail} for order ${orderId}`);
    console.log(`Status: ${orderStatus}, Payment: ${paymentStatus || 'N/A'}`);

    const statusLabel = statusLabels[orderStatus] || orderStatus;
    const statusMessage = getStatusMessage(orderStatus);
    const paymentLabel = paymentStatus ? paymentLabels[paymentStatus] : null;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Status Update</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #6B46C1 0%, #D4AF37 100%); padding: 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                      ✨ VibeLink Ghana
                    </h1>
                    <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                      Your Event. Our Vibe.
                    </p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">
                      Hi ${clientName}! 👋
                    </h2>
                    
                    <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                      We have an update on your order for <strong style="color: #6B46C1;">${eventTitle}</strong>.
                    </p>
                    
                    <!-- Status Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td style="background-color: #f8f5ff; border-left: 4px solid #6B46C1; padding: 20px; border-radius: 0 8px 8px 0;">
                          <p style="margin: 0 0 8px 0; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                            Order Status
                          </p>
                          <p style="margin: 0; color: #6B46C1; font-size: 20px; font-weight: bold;">
                            ${statusLabel}
                          </p>
                          ${paymentLabel ? `
                          <p style="margin: 12px 0 0 0; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                            Payment Status
                          </p>
                          <p style="margin: 4px 0 0 0; color: #D4AF37; font-size: 16px; font-weight: 600;">
                            ${paymentLabel}
                          </p>
                          ` : ''}
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                      ${statusMessage}
                    </p>
                    
                    <!-- Order ID -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0; background-color: #f9f9f9; border-radius: 8px;">
                      <tr>
                        <td style="padding: 15px 20px;">
                          <p style="margin: 0; color: #888888; font-size: 12px;">Order ID</p>
                          <p style="margin: 4px 0 0 0; color: #333333; font-size: 14px; font-family: monospace;">${orderId}</p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="https://vibelinkgh.com/track-order" 
                             style="display: inline-block; background: linear-gradient(135deg, #6B46C1 0%, #D4AF37 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            Track Your Order
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 30px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                      Have questions? Reply to this email or reach us on WhatsApp at <a href="https://wa.me/233245817973" style="color: #6B46C1;">+233 24 581 7973</a>.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #1a1a2e; padding: 30px; text-align: center;">
                    <p style="margin: 0 0 10px 0; color: #D4AF37; font-size: 16px; font-weight: bold;">
                      VibeLink Ghana
                    </p>
                    <p style="margin: 0; color: rgba(255,255,255,0.6); font-size: 12px;">
                      Made with ❤️ in Ghana
                    </p>
                    <p style="margin: 15px 0 0 0; color: rgba(255,255,255,0.4); font-size: 11px;">
                      © ${new Date().getFullYear()} VibeLink Ghana. All rights reserved.
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

    const emailResponse = await resend.emails.send({
      from: "VibeLink Ghana <onboarding@resend.dev>",
      to: [clientEmail],
      subject: `Order Update: ${statusLabel} - ${eventTitle}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-status-email function:", error);
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