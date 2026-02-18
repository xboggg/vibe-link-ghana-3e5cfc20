import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/customer-chat`;

// Generate a unique session ID for analytics using cryptographically secure random
function getSessionId(): string {
  let sessionId = sessionStorage.getItem("chat_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("chat_session_id", sessionId);
  }
  return sessionId;
}

export function useChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const sessionIdRef = useRef(getSessionId());

  // Clear suggestions when new message starts
  useEffect(() => {
    if (isLoading) {
      setSuggestions([]);
    }
  }, [isLoading]);

  const sendMessage = useCallback(async (input: string) => {
    const userMsg: ChatMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setSuggestions([]);

    let assistantContent = "";

    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => 
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: [...messages, userMsg],
          sessionId: sessionIdRef.current
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        if (errorData.suggestions) {
          setSuggestions(errorData.suggestions);
        }
        throw new Error(errorData.error || "Failed to send message");
      }

      if (!resp.body) {
        throw new Error("No response body");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            
            // Check if this is a suggestions event
            if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
              setSuggestions(parsed.suggestions);
              continue;
            }
            
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) updateAssistant(content);
          } catch {
            // Incomplete JSON, put back in buffer
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Process remaining buffer
      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
              setSuggestions(parsed.suggestions);
              continue;
            }
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) updateAssistant(content);
          } catch { /* ignore */ }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Message failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      // Remove the user message if we failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const trackOrder = useCallback(async (orderId: string, email?: string) => {
    setIsLoading(true);
    setSuggestions([]);
    
    const userMsg: ChatMessage = { 
      role: "user", 
      content: `Track my order: ${orderId}${email ? ` (email: ${email})` : ""}` 
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          action: "track_order", 
          orderId,
          customerEmail: email,
          sessionId: sessionIdRef.current
        }),
      });

      const data = await resp.json();
      
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: data.message || data.error || "Unable to track order" 
      }]);

      // Set suggestions from response
      if (data.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error("Track order error:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Sorry, I couldn't track your order. Please try again or contact us on WhatsApp." 
      }]);
      setSuggestions(["Try again", "Contact via WhatsApp", "View pricing"]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setSuggestions([]);
    // Generate new session ID
    const newSessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem("chat_session_id", newSessionId);
    sessionIdRef.current = newSessionId;
  }, []);

  return {
    messages,
    isLoading,
    suggestions,
    sendMessage,
    trackOrder,
    clearMessages,
  };
}
