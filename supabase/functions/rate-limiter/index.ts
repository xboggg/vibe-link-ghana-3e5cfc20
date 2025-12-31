import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-client-ip",
};

interface RateLimitRequest {
  action: string;
  clientIp?: string;
  userId?: string;
}

// Rate limit configurations per action
const rateLimits: Record<string, { maxRequests: number; windowSeconds: number }> = {
  "submit_order": { maxRequests: 5, windowSeconds: 3600 },        // 5 orders per hour
  "contact_form": { maxRequests: 10, windowSeconds: 3600 },       // 10 contacts per hour
  "newsletter_subscribe": { maxRequests: 3, windowSeconds: 86400 }, // 3 subscriptions per day
  "password_reset": { maxRequests: 5, windowSeconds: 3600 },      // 5 resets per hour
  "login_attempt": { maxRequests: 10, windowSeconds: 900 },       // 10 attempts per 15 min
  "api_general": { maxRequests: 100, windowSeconds: 60 },         // 100 requests per minute
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, clientIp, userId }: RateLimitRequest = await req.json();

    // Get client identifier (prefer IP, fallback to userId or anonymous)
    const clientId = clientIp || userId || "anonymous";
    const identifier = `${action}:${clientId}`;

    // Get rate limit config for this action
    const config = rateLimits[action] || rateLimits["api_general"];
    const windowStart = new Date(Date.now() - config.windowSeconds * 1000).toISOString();

    // Check existing requests in window
    const { data: existingRequests, error: fetchError } = await supabase
      .from("rate_limit_logs")
      .select("id")
      .eq("identifier", identifier)
      .gte("created_at", windowStart);

    if (fetchError) {
      console.error("Error fetching rate limit data:", fetchError);
      // On error, allow the request (fail open)
      return new Response(
        JSON.stringify({ allowed: true, remaining: config.maxRequests }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const currentCount = existingRequests?.length || 0;
    const remaining = Math.max(0, config.maxRequests - currentCount - 1);
    const allowed = currentCount < config.maxRequests;

    if (allowed) {
      // Log this request
      await supabase.from("rate_limit_logs").insert({
        identifier,
        action,
        client_ip: clientIp,
        user_id: userId,
      });
    }

    const response = {
      allowed,
      remaining,
      resetIn: config.windowSeconds,
      limit: config.maxRequests,
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: allowed ? 200 : 429, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "X-RateLimit-Limit": config.maxRequests.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": new Date(Date.now() + config.windowSeconds * 1000).toISOString(),
        } 
      }
    );
  } catch (error) {
    console.error("Rate limiter error:", error);
    // Fail open on errors
    return new Response(
      JSON.stringify({ allowed: true, error: "Rate limiter error" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
