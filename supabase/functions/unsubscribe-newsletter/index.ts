import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    const token = url.searchParams.get("token");

    console.log(`Unsubscribe request for: ${email}`);

    if (!email) {
      return generateHtmlResponse("error", null, null, "Invalid unsubscribe link. Email address is missing.");
    }

    // Simple token validation (base64 of email)
    const expectedToken = btoa(email).replace(/=/g, "");
    if (token !== expectedToken) {
      console.error("Token mismatch for unsubscribe");
      return generateHtmlResponse("error", null, null, "Invalid unsubscribe link. Please use the link from your email.");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if subscriber exists
    const { data: subscriber, error: fetchError } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("id, is_active")
      .eq("email", email)
      .single();

    if (fetchError || !subscriber) {
      console.log("Subscriber not found:", email);
      return generateHtmlResponse("not_found", null, null, "This email address is not subscribed to our newsletter.");
    }

    if (!subscriber.is_active) {
      return generateHtmlResponse("already_unsubscribed", email, token, "You have already been unsubscribed from our newsletter.");
    }

    // Deactivate subscriber
    const { error: updateError } = await supabaseAdmin
      .from("newsletter_subscribers")
      .update({ is_active: false })
      .eq("id", subscriber.id);

    if (updateError) {
      console.error("Error deactivating subscriber:", updateError);
      return generateHtmlResponse("error", email, token, "Something went wrong. Please try again later.");
    }

    console.log(`Successfully unsubscribed: ${email}`);
    return generateHtmlResponse("success", email, token, "You have been successfully unsubscribed from our newsletter.");

  } catch (error: any) {
    console.error("Unsubscribe error:", error);
    return generateHtmlResponse("error", null, null, "Something went wrong. Please try again later.");
  }
};

function generateHtmlResponse(status: string, email: string | null, token: string | null, message: string): Response {
  const isSuccess = status === "success" || status === "already_unsubscribed";
  const iconColor = isSuccess ? "#22c55e" : status === "not_found" ? "#f59e0b" : "#ef4444";
  const icon = isSuccess ? "✓" : status === "not_found" ? "?" : "✕";
  
  const baseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const preferencesUrl = email && token ? `${baseUrl}/functions/v1/newsletter-preferences?email=${encodeURIComponent(email)}&token=${token}` : null;
  
  let extraContent = "";
  if (status === "success" && preferencesUrl) {
    extraContent = `
      <p style="color: #64748b; font-size: 14px; margin-bottom: 16px;">Changed your mind? You can re-subscribe or manage your preferences.</p>
      <a href="${preferencesUrl}" class="button secondary">Manage Preferences</a>
    `;
  } else if (status === "already_unsubscribed" && preferencesUrl) {
    extraContent = `
      <p style="color: #64748b; font-size: 14px; margin-bottom: 16px;">Want to receive our newsletters again?</p>
      <a href="${preferencesUrl}" class="button">Re-subscribe</a>
    `;
  }
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Newsletter Unsubscribe - VibeLink Ghana</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          max-width: 480px;
          width: 100%;
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #7C3AED 0%, #F59E0B 100%);
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          color: white;
          font-size: 24px;
          margin: 0;
        }
        .header p {
          color: rgba(255,255,255,0.9);
          font-size: 14px;
          margin-top: 8px;
        }
        .content {
          padding: 40px 30px;
          text-align: center;
        }
        .icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: ${iconColor}15;
          color: ${iconColor};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          margin: 0 auto 24px;
        }
        .message {
          color: #1e293b;
          font-size: 18px;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #7C3AED 0%, #F59E0B 100%);
          color: white;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          transition: transform 0.2s, box-shadow 0.2s;
          margin-bottom: 12px;
        }
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }
        .button.secondary {
          background: #f1f5f9;
          color: #475569;
        }
        .button.secondary:hover {
          background: #e2e8f0;
          box-shadow: none;
        }
        .footer {
          padding: 20px 30px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
          color: #94a3b8;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✨ VibeLink Ghana</h1>
          <p>Your Event. Our Vibe.</p>
        </div>
        <div class="content">
          <div class="icon">${icon}</div>
          <p class="message">${message}</p>
          ${extraContent}
          <a href="https://vibelinkevent.com" class="button${extraContent ? ' secondary' : ''}">Visit Our Website</a>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} VibeLink Ghana. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return new Response(html, {
    status: 200,
    headers: { 
      "Content-Type": "text/html; charset=utf-8",
      ...corsHeaders 
    },
  });
}

serve(handler);
