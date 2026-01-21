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

// Function to determine topic from user message
function detectTopic(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("package") || lowerMessage.includes("ghs") || lowerMessage.includes("how much")) {
    return "pricing";
  }
  if (lowerMessage.includes("track") || lowerMessage.includes("order") || lowerMessage.includes("status")) {
    return "order_tracking";
  }
  if (lowerMessage.includes("wedding") || lowerMessage.includes("marry") || lowerMessage.includes("bride") || lowerMessage.includes("groom") || lowerMessage.includes("kente")) {
    return "wedding";
  }
  if (lowerMessage.includes("funeral") || lowerMessage.includes("burial") || lowerMessage.includes("memorial") || lowerMessage.includes("tribute")) {
    return "funeral";
  }
  if (lowerMessage.includes("naming") || lowerMessage.includes("outdooring") || lowerMessage.includes("baby")) {
    return "naming_ceremony";
  }
  if (lowerMessage.includes("birthday") || lowerMessage.includes("party")) {
    return "birthday";
  }
  if (lowerMessage.includes("church") || lowerMessage.includes("harvest") || lowerMessage.includes("confirmation") || lowerMessage.includes("baptism")) {
    return "church_event";
  }
  if (lowerMessage.includes("corporate") || lowerMessage.includes("conference") || lowerMessage.includes("meeting") || lowerMessage.includes("business")) {
    return "corporate";
  }
  if (lowerMessage.includes("consult") || lowerMessage.includes("book") || lowerMessage.includes("whatsapp") || lowerMessage.includes("contact")) {
    return "consultation";
  }
  if (lowerMessage.includes("how") && (lowerMessage.includes("work") || lowerMessage.includes("process") || lowerMessage.includes("start"))) {
    return "how_it_works";
  }
  if (lowerMessage.includes("adinkra") || lowerMessage.includes("symbol")) {
    return "adinkra";
  }
  if (lowerMessage.includes("festival") || lowerMessage.includes("homowo") || lowerMessage.includes("akwasidae")) {
    return "festivals";
  }
  return "general";
}

// Function to generate contextual suggestions based on topic
function generateSuggestions(topic: string, lastUserMessage: string): string[] {
  const suggestionSets: Record<string, string[]> = {
    pricing: [
      "What's included in each package?",
      "Do you offer rush delivery?",
      "Can I add printing to my order?",
      "I'd like to place an order"
    ],
    order_tracking: [
      "When will my order be ready?",
      "How do I request revisions?",
      "I'd like to speak to someone",
      "What are your packages?"
    ],
    wedding: [
      "Tell me about Kente colors",
      "What Adinkra symbols are good for weddings?",
      "What about traditional wedding invitations?",
      "How much are wedding packages?"
    ],
    funeral: [
      "What should a funeral program include?",
      "How quickly can you deliver?",
      "Do you do printed programs?",
      "I'd like to place an order"
    ],
    naming_ceremony: [
      "What are outdooring traditions?",
      "How soon should I order invitations?",
      "What packages do you recommend?",
      "Book a consultation"
    ],
    birthday: [
      "What themes are popular?",
      "Can I see examples?",
      "What are your prices?",
      "I'd like to order"
    ],
    church_event: [
      "What about harvest thanksgiving?",
      "Do you do church programs?",
      "What's included in the packages?",
      "Place an order"
    ],
    corporate: [
      "Do you do corporate branding?",
      "What's the turnaround time?",
      "Can I get a custom quote?",
      "Book a consultation"
    ],
    consultation: [
      "What are your prices?",
      "How does the process work?",
      "I have an upcoming event",
      "Track my order"
    ],
    how_it_works: [
      "What packages do you offer?",
      "How long does it take?",
      "Can I track my order?",
      "Book a consultation"
    ],
    adinkra: [
      "Tell me about Gye Nyame",
      "What about Sankofa?",
      "Symbols for weddings?",
      "View pricing"
    ],
    festivals: [
      "When is Homowo?",
      "Tell me about Akwasidae",
      "Festival invitation designs?",
      "Place an order"
    ],
    general: [
      "What services do you offer?",
      "View pricing packages",
      "Track my order",
      "Book a consultation"
    ]
  };

  return suggestionSets[topic] || suggestionSets.general;
}

// Log conversation to analytics
async function logConversation(
  supabase: any,
  sessionId: string,
  userMessage: string,
  assistantMessage: string,
  topic: string,
  suggestions: string[],
  responseTimeMs: number
) {
  try {
    // Create or get conversation
    let { data: conversation } = await supabase
      .from("chat_conversations")
      .select("id, message_count")
      .eq("session_id", sessionId)
      .order("started_at", { ascending: false })
      .limit(1)
      .single();

    let conversationId: string;

    if (!conversation) {
      // Create new conversation
      const { data: newConv } = await supabase
        .from("chat_conversations")
        .insert({ session_id: sessionId, message_count: 0 })
        .select()
        .single();
      conversationId = newConv?.id;
    } else {
      conversationId = conversation.id;
    }

    if (conversationId) {
      // Insert user message
      await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        role: "user",
        content: userMessage,
      });

      // Insert assistant message
      await supabase.from("chat_messages").insert({
        conversation_id: conversationId,
        role: "assistant",
        content: assistantMessage,
        response_time_ms: responseTimeMs,
        suggestions: suggestions,
      });

      // Update message count
      await supabase
        .from("chat_conversations")
        .update({ message_count: (conversation?.message_count || 0) + 2 })
        .eq("id", conversationId);

      // Update topic analytics
      const { data: existingTopic } = await supabase
        .from("chat_analytics")
        .select("id, count")
        .eq("topic", topic)
        .single();

      if (existingTopic) {
        await supabase
          .from("chat_analytics")
          .update({ count: existingTopic.count + 1, last_asked_at: new Date().toISOString() })
          .eq("id", existingTopic.id);
      } else {
        await supabase.from("chat_analytics").insert({
          topic: topic,
          question_pattern: userMessage.substring(0, 200),
        });
      }
    }
  } catch (error) {
    console.error("Error logging conversation:", error);
    // Don't throw - logging should not break the chat
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, action, orderId, customerEmail, sessionId } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle order tracking action
    if (action === "track_order" && orderId) {
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
            message: "I couldn't find an order with that ID. Please double-check your Order ID and try again, or contact us on WhatsApp for assistance: https://wa.me/233245817973",
            suggestions: ["Try again with correct ID", "Contact via WhatsApp", "View pricing", "Place new order"]
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

      // Generate suggestions based on order status
      let suggestions: string[];
      if (order.order_status === "completed") {
        suggestions = ["Place a new order", "Book consultation", "View pricing", "Contact support"];
      } else if (order.order_status === "draft_ready") {
        suggestions = ["How do I request revisions?", "Contact support", "Place another order", "View other services"];
      } else {
        suggestions = ["When will it be ready?", "Contact support", "View pricing", "Place another order"];
      }

      return new Response(
        JSON.stringify({ message, suggestions }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the last user message for topic detection
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const topic = detectTopic(lastUserMessage);
    const startTime = Date.now();

    // Convert messages to Gemini format
    const geminiContents = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // Stream chat response using Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: geminiContents,
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "We're experiencing high traffic. Please try again in a moment.",
            suggestions: ["Try again in a minute", "Contact via WhatsApp", "Visit our website"]
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "Service temporarily unavailable. Please contact us on WhatsApp.",
            suggestions: ["Contact via WhatsApp", "Visit website", "Try again later"]
          }),
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

    // Generate suggestions for this topic
    const suggestions = generateSuggestions(topic, lastUserMessage);

    // Create a transform stream to append suggestions at the end
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const reader = response.body!.getReader();

    // Process in background - convert Gemini SSE to OpenAI-compatible format
    (async () => {
      let fullResponse = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Decode Gemini's response
          const text = new TextDecoder().decode(value);
          const lines = text.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const json = JSON.parse(line.slice(6));
                // Gemini format: candidates[0].content.parts[0].text
                const content = json.candidates?.[0]?.content?.parts?.[0]?.text;
                if (content) {
                  fullResponse += content;
                  // Convert to OpenAI-compatible SSE format for the frontend
                  const openAIFormat = {
                    choices: [{ delta: { content } }],
                  };
                  await writer.write(
                    new TextEncoder().encode(`data: ${JSON.stringify(openAIFormat)}\n\n`)
                  );
                }
              } catch {}
            }
          }
        }

        // Send suggestions as final SSE event
        const suggestionsEvent = `data: ${JSON.stringify({ suggestions })}\n\n`;
        await writer.write(new TextEncoder().encode(suggestionsEvent));
        await writer.write(new TextEncoder().encode("data: [DONE]\n\n"));

        // Log conversation in background (don't block response)
        const responseTime = Date.now() - startTime;
        if (sessionId && fullResponse) {
          logConversation(supabase, sessionId, lastUserMessage, fullResponse, topic, suggestions, responseTime);
        }
      } catch (error) {
        console.error("Stream processing error:", error);
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
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
