import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    const { token, action = "SUBMIT_ORDER" }: VerifyCaptchaRequest = await req.json();

    if (!token) {
      console.error("No captcha token provided");
      return new Response(
        JSON.stringify({ success: false, error: "No captcha token provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const siteKey = Deno.env.get("RECAPTCHA_SITE_KEY");
    const apiKey = Deno.env.get("RECAPTCHA_API_KEY");
    const projectId = Deno.env.get("RECAPTCHA_PROJECT_ID");

    if (!siteKey || !apiKey || !projectId) {
      console.error("reCAPTCHA Enterprise configuration missing");
      return new Response(
        JSON.stringify({ success: false, error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Verifying reCAPTCHA Enterprise token for action:", action);

    // Verify with Google reCAPTCHA Enterprise API
    const verifyResponse = await fetch(
      `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: {
            token: token,
            siteKey: siteKey,
            expectedAction: action,
          },
        }),
      }
    );

    const verifyResult = await verifyResponse.json();
    console.log("reCAPTCHA Enterprise assessment result:", JSON.stringify(verifyResult));

    // Check if token is valid
    if (!verifyResult.tokenProperties?.valid) {
      console.error("Invalid token:", verifyResult.tokenProperties?.invalidReason);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid captcha token",
          reason: verifyResult.tokenProperties?.invalidReason 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if action matches
    if (verifyResult.tokenProperties?.action !== action) {
      console.error("Action mismatch:", verifyResult.tokenProperties?.action, "vs", action);
      return new Response(
        JSON.stringify({ success: false, error: "Action mismatch" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check risk score (0.0 = bot, 1.0 = human)
    const riskScore = verifyResult.riskAnalysis?.score ?? 0;
    console.log("Risk score:", riskScore);

    // Accept scores above 0.5 (adjust threshold as needed)
    if (riskScore < 0.5) {
      console.error("Low risk score, likely bot:", riskScore);
      return new Response(
        JSON.stringify({ success: false, error: "Suspicious activity detected" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, score: riskScore }),
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