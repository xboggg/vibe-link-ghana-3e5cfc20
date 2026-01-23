import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface VerifyCaptchaRequest {
  token: string;
  action?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, action = "submit_order" }: VerifyCaptchaRequest = await req.json();

    if (!token) {
      console.error("No captcha token provided");
      return new Response(
        JSON.stringify({ success: false, error: "No captcha token provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const secretKey = Deno.env.get("RECAPTCHA_SECRET_KEY");

    if (!secretKey) {
      console.error("reCAPTCHA secret key not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Verifying reCAPTCHA v3 token for action:", action);

    // Verify with Google reCAPTCHA v3 API
    const verifyResponse = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
        }),
      }
    );

    const verifyResult = await verifyResponse.json();
    console.log("reCAPTCHA verification result:", JSON.stringify(verifyResult));

    // Check if verification was successful
    if (!verifyResult.success) {
      console.error("Verification failed:", verifyResult["error-codes"]);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Captcha verification failed",
          codes: verifyResult["error-codes"]
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if action matches (reCAPTCHA v3)
    if (verifyResult.action && verifyResult.action !== action) {
      console.error("Action mismatch:", verifyResult.action, "vs", action);
      return new Response(
        JSON.stringify({ success: false, error: "Action mismatch" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check score (0.0 = bot, 1.0 = human)
    const score = verifyResult.score ?? 0;
    console.log("reCAPTCHA score:", score);

    // Accept scores above 0.5 (adjust threshold as needed)
    if (score < 0.5) {
      console.error("Low score, likely bot:", score);
      return new Response(
        JSON.stringify({ success: false, error: "Suspicious activity detected" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, score }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in verify-captcha:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
