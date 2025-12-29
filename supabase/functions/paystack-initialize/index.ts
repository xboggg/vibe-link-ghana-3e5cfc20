import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaystackInitRequest {
  orderId: string;
  email: string;
  amount: number; // Amount in GHS (cedis)
  paymentType: "deposit" | "balance";
  callbackUrl: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!PAYSTACK_SECRET_KEY) {
      console.error("PAYSTACK_SECRET_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Payment configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { orderId, email, amount, paymentType, callbackUrl }: PaystackInitRequest = await req.json();
    console.log(`Initializing ${paymentType} payment for order ${orderId}, amount: GHS ${amount}`);

    // Generate unique reference
    const reference = `VL-${orderId.substring(0, 8).toUpperCase()}-${paymentType.toUpperCase()}-${Date.now()}`;

    // Initialize transaction with Paystack
    const initResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100), // Paystack expects amount in pesewas
        reference,
        callback_url: callbackUrl,
        currency: "GHS",
        metadata: {
          orderId,
          paymentType,
          custom_fields: [
            {
              display_name: "Order ID",
              variable_name: "order_id",
              value: orderId.substring(0, 8).toUpperCase(),
            },
            {
              display_name: "Payment Type",
              variable_name: "payment_type",
              value: paymentType === "deposit" ? "50% Deposit" : "Balance Payment",
            },
          ],
        },
      }),
    });

    const initData = await initResponse.json();
    console.log("Paystack initialization response:", JSON.stringify(initData));

    if (!initData.status) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to initialize payment",
          details: initData.message 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        authorization_url: initData.data.authorization_url,
        access_code: initData.data.access_code,
        reference: initData.data.reference,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error initializing payment:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
