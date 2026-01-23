import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface PaystackVerifyRequest {
  reference: string;
  orderId: string;
  paymentType: "deposit" | "balance" | "full";
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

    const { reference, orderId, paymentType }: PaystackVerifyRequest = await req.json();
    console.log(`Verifying payment: ${reference} for order ${orderId}, type: ${paymentType}`);

    // Verify transaction with Paystack
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const verifyData = await verifyResponse.json();
    console.log("Paystack verification response:", JSON.stringify(verifyData));

    if (!verifyData.status || verifyData.data.status !== "success") {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Payment verification failed",
          details: verifyData.message 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Payment verified - update order in database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const amountPaid = verifyData.data.amount / 100; // Paystack returns amount in kobo/pesewas
    const now = new Date().toISOString();

    let updateData: Record<string, unknown>;

    if (paymentType === "full") {
      // Full payment - mark both deposit and balance as paid
      updateData = {
        deposit_paid: true,
        deposit_reference: reference,
        deposit_paid_at: now,
        deposit_amount: amountPaid,
        balance_paid: true,
        balance_reference: reference,
        balance_paid_at: now,
        balance_amount: 0,
        payment_status: "paid",
      };
    } else if (paymentType === "deposit") {
      updateData = {
        deposit_paid: true,
        deposit_reference: reference,
        deposit_paid_at: now,
        deposit_amount: amountPaid,
        payment_status: "partial",
      };
    } else {
      updateData = {
        balance_paid: true,
        balance_reference: reference,
        balance_paid_at: now,
        balance_amount: amountPaid,
        payment_status: "paid",
      };
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId);

    if (updateError) {
      console.error("Error updating order:", updateError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to update order status" 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log payment to payment_history table
    const { error: historyError } = await supabase
      .from("payment_history")
      .insert({
        order_id: orderId,
        payment_type: paymentType,
        payment_method: "paystack",
        amount: amountPaid,
        reference: reference,
        recorded_by: "system",
      });

    if (historyError) {
      console.error("Error logging payment history:", historyError);
      // Don't fail the request, just log the error
    }

    console.log(`Order ${orderId} updated successfully with ${paymentType} payment`);

    const paymentLabel = paymentType === "full" ? "Full" : paymentType === "deposit" ? "Deposit" : "Balance";
    return new Response(
      JSON.stringify({
        success: true,
        message: `${paymentLabel} payment verified`,
        amountPaid,
        reference,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error processing payment verification:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
