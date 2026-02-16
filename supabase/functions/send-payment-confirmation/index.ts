import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentConfirmationRequest {
  orderId: string;
  clientName: string;
  clientEmail: string;
  eventTitle: string;
  paymentType: "deposit" | "balance";
  amountPaid: number;
  totalPrice: number;
  reference?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: PaymentConfirmationRequest = await req.json();
    
    // SECURITY: Validate the payment actually exists in the database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Check if order exists and payment status matches
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, client_email, deposit_paid, balance_paid, payment_status")
      .eq("id", data.orderId)
      .single();
    
    if (orderError || !order) {
      console.error("Order not found:", data.orderId);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Verify email matches
    if (order.client_email.toLowerCase() !== data.clientEmail.toLowerCase()) {
      console.error("Email mismatch for order:", data.orderId);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Verify payment was actually made
    if (data.paymentType === "deposit" && !order.deposit_paid) {
      console.error("Deposit not paid for order:", data.orderId);
      return new Response(
        JSON.stringify({ error: "Payment not verified" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (data.paymentType === "balance" && !order.balance_paid) {
      console.error("Balance not paid for order:", data.orderId);
      return new Response(
        JSON.stringify({ error: "Payment not verified" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Sending payment confirmation email:", data);

    const isDeposit = data.paymentType === "deposit";
    const remainingBalance = isDeposit ? data.amountPaid : 0;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Confirmation</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, ${isDeposit ? '#667eea 0%, #764ba2' : '#22c55e 0%, #16a34a'} 100%); border-radius: 16px 16px 0 0; padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
              ${isDeposit ? '💳 Deposit Received!' : '🎉 Payment Complete!'}
            </h1>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 16px 16px;">
            <p style="color: #333; font-size: 16px;">Hi <strong>${data.clientName}</strong>,</p>
            <p>Thank you for your payment of <strong>GHS ${data.amountPaid.toLocaleString()}</strong></p>
            <p>Order ID: #${data.orderId.substring(0, 8).toUpperCase()}</p>
            <p>Event: ${data.eventTitle}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "VibeLink Ghana <payments@vibelinkevent.com>",
      to: [data.clientEmail],
      subject: isDeposit 
        ? `💳 Deposit Received - ${data.eventTitle} | VibeLink Ghana`
        : `🎉 Payment Complete - ${data.eventTitle} | VibeLink Ghana`,
      html: emailHtml,
    });

    console.log("Payment confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-payment-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
