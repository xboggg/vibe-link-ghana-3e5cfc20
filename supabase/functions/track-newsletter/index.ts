import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 1x1 transparent GIF for tracking pixel
const TRACKING_PIXEL = new Uint8Array([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00,
  0x80, 0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21,
  0xf9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00,
  0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
  0x01, 0x00, 0x3b
]);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type"); // 'open' or 'click'
    const campaignId = url.searchParams.get("campaign");
    const email = url.searchParams.get("email");
    const redirectUrl = url.searchParams.get("url");

    console.log(`Tracking event: type=${type}, campaign=${campaignId}, email=${email}`);

    if (!type || !campaignId || !email) {
      console.error("Missing required parameters");
      // Still return something valid so email clients don't show errors
      if (type === "open") {
        return new Response(TRACKING_PIXEL, {
          status: 200,
          headers: { 
            "Content-Type": "image/gif",
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            ...corsHeaders
          },
        });
      }
      return new Response("Invalid request", { status: 400, headers: corsHeaders });
    }

    // Use service role for tracking inserts
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get client info for tracking
    const userAgent = req.headers.get("user-agent") || null;
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : null;

    // Record the tracking event
    const { error: trackingError } = await supabaseAdmin
      .from("newsletter_tracking")
      .insert({
        campaign_id: campaignId,
        subscriber_email: email,
        event_type: type,
        link_url: redirectUrl,
        user_agent: userAgent,
        ip_address: ipAddress
      });

    if (trackingError) {
      console.error("Error recording tracking event:", trackingError);
    } else {
      console.log(`Tracking event recorded: ${type} for ${email}`);

      // Update campaign counts
      if (type === "open") {
        await supabaseAdmin.rpc("increment_campaign_open_count", { campaign_uuid: campaignId });
      } else if (type === "click") {
        await supabaseAdmin.rpc("increment_campaign_click_count", { campaign_uuid: campaignId });
      }
    }

    // Return appropriate response
    if (type === "open") {
      // Return tracking pixel for open events
      return new Response(TRACKING_PIXEL, {
        status: 200,
        headers: { 
          "Content-Type": "image/gif",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          ...corsHeaders
        },
      });
    } else if (type === "click" && redirectUrl) {
      // Redirect to original URL for click events
      return new Response(null, {
        status: 302,
        headers: {
          "Location": redirectUrl,
          ...corsHeaders
        },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Tracking error:", error);
    
    // Return tracking pixel anyway to avoid email client errors
    return new Response(TRACKING_PIXEL, {
      status: 200,
      headers: { 
        "Content-Type": "image/gif",
        ...corsHeaders
      },
    });
  }
};

serve(handler);
