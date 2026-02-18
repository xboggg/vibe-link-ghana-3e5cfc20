import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FREQUENCIES = [
  { value: 'all', label: 'All emails', description: 'Receive every newsletter we send' },
  { value: 'weekly', label: 'Weekly digest', description: 'Get a summary once a week' },
  { value: 'monthly', label: 'Monthly digest', description: 'Get a summary once a month' },
];

const TOPICS = [
  { value: 'announcements', label: 'Announcements', description: 'New services, features, and company updates' },
  { value: 'promotions', label: 'Promotions & Offers', description: 'Special deals and discount codes' },
  { value: 'events', label: 'Event Tips', description: 'Ideas and inspiration for your events' },
  { value: 'showcase', label: 'Work Showcase', description: 'See our latest invitation designs' },
];

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    const token = url.searchParams.get("token");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Validate email and token
    if (!email || !token) {
      return generateHtmlResponse("error", null, "Invalid preference link. Please use the link from your email.");
    }

    const expectedToken = btoa(email).replace(/=/g, "");
    if (token !== expectedToken) {
      return generateHtmlResponse("error", null, "Invalid preference link. Please use the link from your email.");
    }

    // Handle form submissions (POST)
    if (req.method === "POST") {
      const formData = await req.formData();
      const action = formData.get("action");

      if (action === "resubscribe") {
        // Re-subscribe the user
        const { error } = await supabaseAdmin
          .from("newsletter_subscribers")
          .update({ is_active: true })
          .eq("email", email);

        if (error) {
          console.error("Error resubscribing:", error);
          return generateHtmlResponse("error", null, "Failed to resubscribe. Please try again.");
        }

        // Fetch updated subscriber data
        const { data: subscriber } = await supabaseAdmin
          .from("newsletter_subscribers")
          .select("*")
          .eq("email", email)
          .single();

        return generateHtmlResponse("success", subscriber, "Welcome back! You have been resubscribed to our newsletter.");
      }

      if (action === "save_preferences") {
        const frequency = formData.get("frequency") as string || "all";
        const topics = formData.getAll("topics") as string[];

        const { error } = await supabaseAdmin
          .from("newsletter_subscribers")
          .update({ 
            frequency,
            topics,
            preferences_token: token
          })
          .eq("email", email);

        if (error) {
          console.error("Error updating preferences:", error);
          return generateHtmlResponse("error", null, "Failed to save preferences. Please try again.");
        }

        const { data: subscriber } = await supabaseAdmin
          .from("newsletter_subscribers")
          .select("*")
          .eq("email", email)
          .single();

        return generateHtmlResponse("success", subscriber, "Your preferences have been saved successfully!");
      }

      if (action === "unsubscribe") {
        const { error } = await supabaseAdmin
          .from("newsletter_subscribers")
          .update({ is_active: false })
          .eq("email", email);

        if (error) {
          console.error("Error unsubscribing:", error);
          return generateHtmlResponse("error", null, "Failed to unsubscribe. Please try again.");
        }

        const { data: subscriber } = await supabaseAdmin
          .from("newsletter_subscribers")
          .select("*")
          .eq("email", email)
          .single();

        return generateHtmlResponse("unsubscribed", subscriber, "You have been unsubscribed from our newsletter.");
      }
    }

    // GET request - show preference form
    const { data: subscriber, error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !subscriber) {
      return generateHtmlResponse("not_found", null, "This email address is not in our newsletter list.");
    }

    return generateHtmlResponse("form", subscriber, null);

  } catch (error: any) {
    console.error("Preference center error:", error);
    return generateHtmlResponse("error", null, "Something went wrong. Please try again later.");
  }
};

interface Subscriber {
  email: string;
  is_active: boolean;
  frequency: string;
  topics: string[];
}

function generateHtmlResponse(status: string, subscriber: Subscriber | null, message: string | null): Response {
  const baseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const token = subscriber ? btoa(subscriber.email).replace(/=/g, "") : "";
  const formAction = subscriber ? `${baseUrl}/functions/v1/newsletter-preferences?email=${encodeURIComponent(subscriber.email)}&token=${token}` : "";

  let content = "";

  if (status === "error" || status === "not_found") {
    content = `
      <div class="icon error">✕</div>
      <p class="message">${message}</p>
      <a href="https://vibelinkevent.com" class="button">Visit Our Website</a>
    `;
  } else if (status === "success") {
    content = `
      <div class="icon success">✓</div>
      <p class="message">${message}</p>
      <a href="${formAction}" class="button secondary">View Preferences</a>
    `;
  } else if (status === "unsubscribed") {
    content = `
      <div class="icon warning">👋</div>
      <p class="message">${message}</p>
      <p class="sub-message">Changed your mind?</p>
      <form method="POST" action="${formAction}">
        <input type="hidden" name="action" value="resubscribe">
        <button type="submit" class="button">Re-subscribe</button>
      </form>
    `;
  } else if (status === "form" && subscriber) {
    const frequencyOptions = FREQUENCIES.map(f => `
      <label class="radio-option ${subscriber.frequency === f.value ? 'selected' : ''}">
        <input type="radio" name="frequency" value="${f.value}" ${subscriber.frequency === f.value ? 'checked' : ''}>
        <div class="option-content">
          <span class="option-label">${f.label}</span>
          <span class="option-desc">${f.description}</span>
        </div>
      </label>
    `).join('');

    const topicOptions = TOPICS.map(t => `
      <label class="checkbox-option ${(subscriber.topics || []).includes(t.value) ? 'selected' : ''}">
        <input type="checkbox" name="topics" value="${t.value}" ${(subscriber.topics || []).includes(t.value) ? 'checked' : ''}>
        <div class="option-content">
          <span class="option-label">${t.label}</span>
          <span class="option-desc">${t.description}</span>
        </div>
      </label>
    `).join('');

    if (!subscriber.is_active) {
      content = `
        <div class="status-badge inactive">Currently Unsubscribed</div>
        <p class="message">You are not currently receiving our newsletters.</p>
        <form method="POST" action="${formAction}">
          <input type="hidden" name="action" value="resubscribe">
          <button type="submit" class="button">Re-subscribe to Newsletter</button>
        </form>
        <a href="https://vibelinkevent.com" class="link">Return to website</a>
      `;
    } else {
      content = `
        <div class="status-badge active">Subscribed</div>
        <p class="email-display">${subscriber.email}</p>
        
        <form method="POST" action="${formAction}">
          <input type="hidden" name="action" value="save_preferences">
          
          <div class="section">
            <h3>Email Frequency</h3>
            <p class="section-desc">How often would you like to hear from us?</p>
            <div class="options-grid">
              ${frequencyOptions}
            </div>
          </div>
          
          <div class="section">
            <h3>Topics of Interest</h3>
            <p class="section-desc">Select the content you want to receive</p>
            <div class="options-grid">
              ${topicOptions}
            </div>
          </div>
          
          <button type="submit" class="button">Save Preferences</button>
        </form>
        
        <div class="unsubscribe-section">
          <p>Want to stop receiving emails?</p>
          <form method="POST" action="${formAction}" style="display: inline;">
            <input type="hidden" name="action" value="unsubscribe">
            <button type="submit" class="link-button">Unsubscribe from all</button>
          </form>
        </div>
      `;
    }
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Preferences - VibeLink Event</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          max-width: 540px;
          width: 100%;
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #7C3AED 0%, #F59E0B 100%);
          padding: 30px;
          text-align: center;
        }
        .header h1 { color: white; font-size: 24px; margin: 0; }
        .header p { color: rgba(255,255,255,0.9); font-size: 14px; margin-top: 8px; }
        .content {
          padding: 30px;
          text-align: center;
        }
        .icon {
          width: 80px; height: 80px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 40px;
          margin: 0 auto 24px;
        }
        .icon.success { background: #22c55e15; color: #22c55e; }
        .icon.error { background: #ef444415; color: #ef4444; }
        .icon.warning { background: #f59e0b15; color: #f59e0b; }
        .message { color: #1e293b; font-size: 18px; line-height: 1.6; margin-bottom: 16px; }
        .sub-message { color: #64748b; font-size: 14px; margin-bottom: 16px; }
        .status-badge {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        .status-badge.active { background: #22c55e15; color: #22c55e; }
        .status-badge.inactive { background: #f59e0b15; color: #f59e0b; }
        .email-display {
          color: #64748b;
          font-size: 14px;
          margin-bottom: 24px;
        }
        .section {
          text-align: left;
          margin-bottom: 24px;
        }
        .section h3 {
          color: #1e293b;
          font-size: 16px;
          margin-bottom: 4px;
        }
        .section-desc {
          color: #64748b;
          font-size: 13px;
          margin-bottom: 12px;
        }
        .options-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .radio-option, .checkbox-option {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .radio-option:hover, .checkbox-option:hover {
          border-color: #7C3AED;
          background: #7C3AED08;
        }
        .radio-option.selected, .checkbox-option.selected {
          border-color: #7C3AED;
          background: #7C3AED08;
        }
        .radio-option input, .checkbox-option input {
          margin-top: 3px;
          accent-color: #7C3AED;
        }
        .option-content {
          display: flex;
          flex-direction: column;
          text-align: left;
        }
        .option-label { color: #1e293b; font-weight: 500; font-size: 14px; }
        .option-desc { color: #64748b; font-size: 12px; margin-top: 2px; }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #7C3AED 0%, #F59E0B 100%);
          color: white;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          font-size: 14px;
          transition: transform 0.2s, box-shadow 0.2s;
          width: 100%;
          margin-top: 8px;
        }
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }
        .button.secondary {
          background: #f1f5f9;
          color: #475569;
        }
        .button.secondary:hover {
          background: #e2e8f0;
          box-shadow: none;
        }
        .unsubscribe-section {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
        }
        .unsubscribe-section p {
          color: #94a3b8;
          font-size: 13px;
          margin-bottom: 8px;
        }
        .link-button {
          background: none;
          border: none;
          color: #94a3b8;
          text-decoration: underline;
          cursor: pointer;
          font-size: 13px;
        }
        .link-button:hover { color: #64748b; }
        .link {
          display: block;
          margin-top: 16px;
          color: #64748b;
          font-size: 14px;
        }
        .footer {
          padding: 20px 30px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
          color: #94a3b8;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✨ VibeLink Event</h1>
          <p>Email Preferences</p>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} VibeLink Event. All rights reserved.</p>
        </div>
      </div>
      <script>
        // Update visual selection on radio/checkbox change
        document.querySelectorAll('.radio-option input, .checkbox-option input').forEach(input => {
          input.addEventListener('change', () => {
            if (input.type === 'radio') {
              document.querySelectorAll('.radio-option').forEach(opt => opt.classList.remove('selected'));
              input.closest('.radio-option').classList.add('selected');
            } else {
              input.closest('.checkbox-option').classList.toggle('selected', input.checked);
            }
          });
        });
      </script>
    </body>
    </html>
  `;

  return new Response(html, {
    status: 200,
    headers: { 
      "Content-Type": "text/html; charset=utf-8",
      ...corsHeaders 
    },
  });
}

serve(handler);
