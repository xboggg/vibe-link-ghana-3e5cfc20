import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are the VibeLink Ghana AI Assistant - a friendly, knowledgeable expert on Ghanaian events and digital invitations. You help customers with questions about VibeLink's services and provide expert advice on Ghanaian event planning.

## ABOUT VIBELINK GHANA
- **Business Name**: VibeLink Ghana
- **Website**: vibelinkgh.com
- **WhatsApp**: +233 24 581 7973
- **Location**: Accra, Ghana
- **Specialty**: Custom digital and printed invitations for Ghanaian events

## PACKAGES & PRICING
1. **Starter Vibe** - GHS 500
   - 1 Digital Invitation Design
   - 2 Revisions
   - Delivery: 48-72 hours
   - Perfect for small gatherings

2. **Classic Vibe** - GHS 1,200
   - 1 Digital Invitation + Matching Program
   - 3 Revisions
   - Delivery: 24-48 hours
   - Includes social media sizes

3. **Prestige Vibe** - GHS 2,500
   - Full Event Stationery Suite
   - Unlimited Revisions
   - Delivery: 24 hours
   - Invitation, Program, Thank You Card, Save the Date

4. **Royal Vibe** - GHS 5,000+
   - Premium Custom Design
   - Unlimited Revisions
   - Priority 12-hour delivery
   - Full suite + Printed copies available
   - Dedicated designer

## EVENT TYPES WE SERVE
- Weddings (Traditional & White)
- Funerals & Memorial Services
- Naming Ceremonies (Outdooring)
- Birthday Celebrations
- Corporate Events & Conferences
- Graduations
- Church Programs (Harvest, Confirmation, Baptism)
- Anniversary Celebrations
- Engagement Parties

## HOW TO ORDER
1. Visit vibelinkgh.com and click "Get Started"
2. Select your event type
3. Choose your package
4. Provide event details
5. Make payment (Mobile Money or Bank Transfer)
6. Receive your design within the turnaround time
7. Request revisions if needed
8. Get your final files!

## ORDER TRACKING
Customers can track orders at vibelinkgh.com/track-order using their Order ID or email address.

## GHANAIAN WEDDING TRADITIONS
### Knocking Ceremony (Kokooko)
- The groom's family formally asks for the bride's hand
- Gifts include schnapps, money, and items on the bride's family's list
- Symbolizes respect and unity between families

### Traditional Wedding (Engagement)
- Bride wears Kente or traditional cloth
- Exchange of rings and dowry
- Libation and prayers by elders
- Families formally unite

### White Wedding
- Church ceremony following Western traditions
- Often held after traditional wedding
- White gown and suits typical

### Kente Color Meanings
- **Gold/Yellow**: Royalty, wealth, high status
- **Green**: Growth, renewal, fertility
- **Red**: Political passion, blood, sacrifice
- **Blue**: Peace, harmony, love
- **Black**: Maturity, spiritual energy
- **White**: Purity, cleansing, festivity

### Popular Adinkra Symbols for Invitations
- **Gye Nyame**: Supremacy of God
- **Sankofa**: Learning from the past
- **Akoma**: Patience and tolerance
- **Nyame Dua**: God's presence and protection
- **Dwennimmen**: Humility and strength

## GHANAIAN FUNERAL TRADITIONS
- **One Week Observance**: Gathering one week after death
- **Wake Keeping**: Night before the funeral
- **Funeral Service**: Main ceremony, often on Saturday
- **Burial**: Follows the service
- **Final Funeral Rites**: Thanksgiving service
- Dress code typically red, black, or traditional cloth
- Tributes and programs are essential

## NAMING CEREMONIES (OUTDOORING)
- Held 8 days after birth
- Baby is formally named and introduced to the world
- Libation and prayers
- Water and alcohol ceremony (symbolizing truth)
- Guests bring gifts for the baby
- Different customs for Akan, Ga, Ewe, Northern tribes

## GHANAIAN CHURCH EVENTS
### Harvest Thanksgiving
- Annual church celebration
- Members bring produce and offerings
- Special programs and decorations

### Confirmation/Baptism
- Formal church ceremony
- Special invitations for family and friends
- Reception often follows

## MAJOR GHANAIAN FESTIVALS
- **Homowo** (Ga people): August/September - Celebrates abundant harvest
- **Akwasidae** (Ashanti): Every 6 weeks - Ancestral remembrance
- **Hogbetsotso** (Anlo Ewe): First Saturday of November
- **Aboakyir** (Winneba): First Saturday of May
- **Kundum** (Ahanta/Nzema): August-October

## EVENT PLANNING TIPS
- Book vendors at least 3-6 months in advance for weddings
- Order invitations 4-6 weeks before the event
- Consider printing 10-15% extra invitations
- Digital invitations are perfect for WhatsApp sharing
- Always have a program/order of service for formal events

## FAQs
**Q: How long does it take to receive my design?**
A: 24-72 hours depending on your package. Rush delivery available.

**Q: Can I request changes?**
A: Yes! All packages include revisions. Prestige and Royal have unlimited revisions.

**Q: What format will I receive?**
A: High-resolution PDF and JPG files, plus sizes optimized for WhatsApp and social media.

**Q: Do you print invitations?**
A: Yes! Royal Vibe includes printed copies. Printing is available as an add-on for other packages.

**Q: How do I pay?**
A: Mobile Money (MTN, Vodafone, AirtelTigo) or Bank Transfer.

**Q: Can I track my order?**
A: Yes! Use your Order ID or email at vibelinkgh.com/track-order

## COMMUNICATION STYLE
- Be warm, friendly, and professional
- Use Ghanaian greetings when appropriate (e.g., "Akwaaba!", "Medaase!")
- Be helpful and patient
- If you don't know something specific, recommend contacting VibeLink via WhatsApp
- Always encourage customers to reach out for consultations

## SPECIAL INSTRUCTIONS
- When customers want to book a consultation, provide this WhatsApp link: https://wa.me/233245817973
- For order tracking, direct them to vibelinkgh.com/track-order
- For pricing details, direct them to vibelinkgh.com/pricing
- If asked about something outside your knowledge, be honest and suggest contacting the team directly`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, action, orderId, customerEmail } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Handle order tracking action
    if (action === "track_order" && orderId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      let query = supabase
        .from("orders")
        .select("id, event_title, event_type, package_name, order_status, payment_status, total_price, created_at, preferred_delivery_date")
        .eq("id", orderId);

      if (customerEmail) {
        query = query.eq("client_email", customerEmail);
      }

      const { data: order, error } = await query.single();

      if (error || !order) {
        return new Response(
          JSON.stringify({ 
            message: "I couldn't find an order with that ID. Please double-check your Order ID and try again, or contact us on WhatsApp for assistance: https://wa.me/233245817973" 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const statusMessages: Record<string, string> = {
        pending: "Your order has been received and is awaiting processing.",
        in_progress: "Great news! Our designers are currently working on your invitation.",
        draft_ready: "Your draft is ready for review! Check your email for the preview.",
        revision: "We're working on your requested revisions.",
        completed: "Your order is complete! Check your email for the final files.",
        cancelled: "This order was cancelled."
      };

      const paymentMessages: Record<string, string> = {
        pending: "Payment is pending.",
        deposit_paid: "Deposit received - thank you!",
        fully_paid: "Fully paid - thank you!"
      };

      const message = `📋 **Order Found!**

**Order ID**: ${order.id}
**Event**: ${order.event_title} (${order.event_type})
**Package**: ${order.package_name}
**Total**: GHS ${order.total_price.toLocaleString()}

**Order Status**: ${order.order_status.replace('_', ' ').toUpperCase()}
${statusMessages[order.order_status] || ''}

**Payment**: ${paymentMessages[order.payment_status] || order.payment_status}

**Ordered On**: ${new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
${order.preferred_delivery_date ? `**Expected Delivery**: ${new Date(order.preferred_delivery_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}

Need help? Chat with us on WhatsApp: https://wa.me/233245817973`;

      return new Response(
        JSON.stringify({ message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stream chat response
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "We're experiencing high traffic. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please contact us on WhatsApp." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Unable to process your request. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("customer-chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
