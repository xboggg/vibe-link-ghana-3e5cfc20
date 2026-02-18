import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
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
  pending: "Pending Review",
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

const statusEmojis: Record<string, string> = {
  pending: "⏳",
  in_progress: "🎨",
  draft_ready: "👀",
  revision: "✏️",
  completed: "🎉",
  cancelled: "❌",
};

const statusColors: Record<string, string> = {
  pending: "#f59e0b",
  in_progress: "#3b82f6",
  draft_ready: "#8b5cf6",
  revision: "#f97316",
  completed: "#22c55e",
  cancelled: "#ef4444",
};

const getStatusMessage = (status: string): string => {
  switch (status) {
    case "pending":
      return "We have received your order and our team is reviewing the details. We'll start working on your design soon!";
    case "in_progress":
      return "Great news! Our talented design team has started creating your beautiful invitation. We're putting extra care into every detail to make it perfect for your special occasion.";
    case "draft_ready":
      return "Exciting update! Your draft design is ready for you to review. Please take a look and let us know if you'd like any changes. We want to make sure it's exactly what you envisioned!";
    case "revision":
      return "Thank you for your feedback! Our team is now working on the revisions you requested. We'll have an updated version for you soon.";
    case "completed":
      return "Congratulations! Your invitation design is complete and has been delivered. Thank you for choosing VibeLink Event for your special occasion. We hope you love it!";
    case "cancelled":
      return "Your order has been cancelled. If you have any questions or would like to place a new order, please don't hesitate to contact us.";
    default:
      return "Your order status has been updated. Please contact us if you have any questions.";
  }
};

const getNextSteps = (status: string): string => {
  switch (status) {
    case "pending":
      return `
        <li>We'll review your order details</li>
        <li>Our design team will be assigned to your project</li>
        <li>You'll receive an update when we start designing</li>
      `;
    case "in_progress":
      return `
        <li>Our designers are creating your invitation</li>
        <li>We'll send a draft for your review within 3-5 business days</li>
        <li>Ensure your deposit payment is complete if not already done</li>
      `;
    case "draft_ready":
      return `
        <li>Review your draft design carefully</li>
        <li>Reply with any changes or feedback you'd like</li>
        <li>Approve the design when you're satisfied</li>
      `;
    case "revision":
      return `
        <li>We're implementing your requested changes</li>
        <li>A revised draft will be sent to you soon</li>
        <li>Additional revisions are available as needed</li>
      `;
    case "completed":
      return `
        <li>Download and save your final design files</li>
        <li>Complete any remaining balance payment</li>
        <li>Share with your guests and enjoy your event!</li>
      `;
    default:
      return `<li>Contact us if you have any questions</li>`;
  }
};

// Rate limiting constants
const RATE_LIMIT_MAX_REQUESTS = 20;
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
  console.log("send-status-email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check rate limit
    const clientIp = getClientIp(req);
    const isAllowed = await checkRateLimit(supabase, "send-status-email", clientIp);
    
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
    const statusEmoji = statusEmojis[orderStatus] || "📋";
    const statusColor = statusColors[orderStatus] || "#667eea";
    const paymentLabel = paymentStatus ? paymentLabels[paymentStatus] : null;
    const nextSteps = getNextSteps(orderStatus);

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
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #6B46C1 0%, #D4AF37 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                      ✨ VibeLink Event
                    </h1>
                    <p style="margin: 12px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                      Your Event. Our Vibe.
                    </p>
                  </td>
                </tr>
                
                <!-- Status Banner -->
                <tr>
                  <td style="background-color: ${statusColor}; padding: 20px; text-align: center;">
                    <span style="font-size: 40px;">${statusEmoji}</span>
                    <h2 style="margin: 10px 0 0 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                      ${statusLabel}
                    </h2>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 22px;">
                      Hi ${clientName}! 👋
                    </h2>
                    
                    <p style="margin: 0 0 15px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                      We have an update on your order for <strong style="color: #6B46C1;">${eventTitle}</strong>.
                    </p>
                    
                    <p style="margin: 0 0 25px 0; color: #555555; font-size: 16px; line-height: 1.7;">
                      ${statusMessage}
                    </p>
                    
                    <!-- Order Details Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 25px 0; background-color: #f8f5ff; border-radius: 12px; overflow: hidden;">
                      <tr>
                        <td style="padding: 20px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding: 8px 0;">
                                <span style="color: #888888; font-size: 13px;">Order ID</span><br>
                                <span style="color: #333333; font-size: 15px; font-family: monospace; font-weight: 600;">#${orderId.substring(0, 8).toUpperCase()}</span>
                              </td>
                              <td style="padding: 8px 0; text-align: right;">
                                <span style="color: #888888; font-size: 13px;">Order Status</span><br>
                                <span style="color: ${statusColor}; font-size: 15px; font-weight: 600;">${statusLabel}</span>
                              </td>
                            </tr>
                            ${paymentLabel ? `
                            <tr>
                              <td colspan="2" style="padding: 12px 0 0 0; border-top: 1px solid #e0d9f0; margin-top: 12px;">
                                <span style="color: #888888; font-size: 13px;">Payment Status</span><br>
                                <span style="color: #D4AF37; font-size: 15px; font-weight: 600;">${paymentLabel}</span>
                              </td>
                            </tr>
                            ` : ''}
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Next Steps -->
                    <div style="margin: 30px 0; background-color: #fff9e6; border-radius: 12px; padding: 20px; border-left: 4px solid #D4AF37;">
                      <h3 style="margin: 0 0 15px 0; color: #856404; font-size: 16px; font-weight: 600;">
                        📋 What's Next?
                      </h3>
                      <ol style="margin: 0; padding-left: 20px; color: #856404; font-size: 14px; line-height: 1.8;">
                        ${nextSteps}
                      </ol>
                    </div>
                    
                    <!-- CTA Buttons -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center">
                          <a href="https://vibelinkevent.com/track-order" 
                             style="display: inline-block; background: linear-gradient(135deg, #6B46C1 0%, #D4AF37 100%); color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 10px; font-weight: 600; font-size: 16px; margin-right: 10px;">
                            Track Your Order
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding-top: 15px;">
                          <a href="https://wa.me/233245817973" 
                             style="display: inline-block; background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 14px;">
                            💬 Chat with Us on WhatsApp
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 30px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6; text-align: center;">
                      Questions? Reply to this email or call us at <a href="tel:+233245817973" style="color: #6B46C1; text-decoration: none;">+233 24 581 7973</a>
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #1a1a2e; padding: 35px 30px; text-align: center;">
                    <p style="margin: 0 0 10px 0; color: #D4AF37; font-size: 18px; font-weight: bold;">
                      VibeLink Event
                    </p>
                    <p style="margin: 0 0 15px 0; color: rgba(255,255,255,0.7); font-size: 13px;">
                      Premium Event Stationery & Digital Invitations
                    </p>
                    <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 12px;">
                      Made with ❤️ in Ghana
                    </p>
                    <p style="margin: 15px 0 0 0; color: rgba(255,255,255,0.4); font-size: 11px;">
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

    const subjectEmoji = statusEmoji;
    const emailSubject = `${subjectEmoji} Order Update: ${statusLabel} - ${eventTitle}`;

    const emailResponse = await resend.emails.send({
      from: "VibeLink Event <orders@vibelinkevent.com>",
      to: [clientEmail],
      subject: emailSubject,
      html: emailHtml,
    });

    console.log("Status email sent successfully:", emailResponse);

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
