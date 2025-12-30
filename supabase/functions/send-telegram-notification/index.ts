import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TelegramNotificationRequest {
  type: 'deposit' | 'balance';
  orderId: string;
  clientName: string;
  clientEmail: string;
  eventTitle: string;
  amount: number;
  paymentMethod: 'paystack' | 'bank_transfer' | 'cash' | 'mobile_money' | 'other';
  reference?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: TelegramNotificationRequest = await req.json();
    console.log("Sending Telegram notification:", data);

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error("Telegram credentials not configured");
      return new Response(
        JSON.stringify({ error: "Telegram not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const paymentTypeEmoji = data.type === 'deposit' ? '💰' : '✅';
    const paymentMethodLabel = {
      'paystack': 'Paystack',
      'bank_transfer': 'Bank Transfer',
      'cash': 'Cash',
      'mobile_money': 'Mobile Money',
      'other': 'Other'
    }[data.paymentMethod];

    const message = `
${paymentTypeEmoji} *${data.type === 'deposit' ? 'DEPOSIT' : 'BALANCE'} PAYMENT RECEIVED*

📋 *Order Details:*
• Event: ${data.eventTitle}
• Client: ${data.clientName}
• Email: ${data.clientEmail}

💳 *Payment Info:*
• Amount: GH₵${data.amount.toLocaleString()}
• Method: ${paymentMethodLabel}
${data.reference ? `• Reference: \`${data.reference}\`` : ''}

🔗 [View Order in Admin](https://jccreativestudios.lovable.app/admin)
    `.trim();

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      })
    });

    const result = await response.json();
    console.log("Telegram API response:", result);

    if (!result.ok) {
      console.error("Telegram API error:", result);
      return new Response(
        JSON.stringify({ error: result.description || "Telegram API error" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message_id: result.result?.message_id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error sending Telegram notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
