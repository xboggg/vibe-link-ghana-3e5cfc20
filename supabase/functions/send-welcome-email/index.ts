import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  preferencesToken?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, preferencesToken }: WelcomeEmailRequest = await req.json();
    
    console.log("Sending welcome email to:", email);

    if (!email) {
      throw new Error("Email is required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const preferencesUrl = `${supabaseUrl}/functions/v1/newsletter-preferences?email=${encodeURIComponent(email)}${preferencesToken ? `&token=${preferencesToken}` : ''}`;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to VibeLink Ghana!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4; padding: 40px 0;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                ✨ Welcome to <span style="color: #f5a623;">VibeLink</span> Ghana!
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #333; font-size: 16px; line-height: 1.6;">
                Thank you for subscribing to our newsletter! 🎉
              </p>
              
              <p style="margin: 0 0 20px; color: #333; font-size: 16px; line-height: 1.6;">
                You're now part of our community of people who appreciate beautiful, custom digital invitations for life's special moments.
              </p>
              
              <h2 style="margin: 30px 0 15px; color: #1a1a2e; font-size: 20px;">What to Expect</h2>
              <ul style="margin: 0 0 25px; padding-left: 20px; color: #555; font-size: 15px; line-height: 1.8;">
                <li><strong>Exclusive offers</strong> and early access to new designs</li>
                <li><strong>Event inspiration</strong> and planning tips</li>
                <li><strong>Behind-the-scenes</strong> looks at our creative process</li>
                <li><strong>Special announcements</strong> and promotions</li>
              </ul>
              
              <h2 style="margin: 30px 0 15px; color: #1a1a2e; font-size: 20px;">Customize Your Experience</h2>
              <p style="margin: 0 0 25px; color: #333; font-size: 16px; line-height: 1.6;">
                Want to receive only the content that interests you? Visit your preference center to choose your topics and frequency.
              </p>
              
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${preferencesUrl}" style="display: inline-block; background: linear-gradient(135deg, #f5a623 0%, #e6951f 100%); color: #1a1a2e; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      Manage Preferences
                    </a>
                  </td>
                </tr>
              </table>
              
              <div style="margin-top: 35px; padding-top: 25px; border-top: 1px solid #eee;">
                <h3 style="margin: 0 0 15px; color: #1a1a2e; font-size: 18px;">Ready to Create Something Amazing?</h3>
                <p style="margin: 0 0 20px; color: #555; font-size: 15px; line-height: 1.6;">
                  Browse our services and start designing your perfect digital invitation today!
                </p>
                <a href="https://vibelinkgh.com/services" style="color: #f5a623; text-decoration: none; font-weight: 600;">
                  Explore Our Services →
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0 0 10px; color: #666; font-size: 14px;">
                Follow us on social media for daily inspiration!
              </p>
              <p style="margin: 0 0 15px; color: #888; font-size: 13px;">
                Instagram | Facebook | Twitter | TikTok
              </p>
              <p style="margin: 0; color: #999; font-size: 12px;">
                © ${new Date().getFullYear()} VibeLink Ghana. Made with ❤️ in Ghana
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
      to: [email],
      subject: "Welcome to VibeLink Ghana! 🎉",
      html: emailHtml,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
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
