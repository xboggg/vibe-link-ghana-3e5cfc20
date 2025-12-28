import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Package, Phone, DollarSign, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatbot, type ChatMessage } from "@/hooks/useChatbot";
import { cn } from "@/lib/utils";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [showTrackInput, setShowTrackInput] = useState(false);
  const [trackOrderId, setTrackOrderId] = useState("");
  const { messages, isLoading, suggestions, sendMessage, trackOrder, clearMessages } = useChatbot();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, suggestions]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput("");
    await sendMessage(message);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    if (isLoading) return;
    await sendMessage(suggestion);
  };

  const handleTrackOrder = async () => {
    if (!trackOrderId.trim()) return;
    await trackOrder(trackOrderId.trim());
    setTrackOrderId("");
    setShowTrackInput(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTrackKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTrackOrder();
    }
  };

  const quickActions = [
    { label: "Track Order", icon: Package, action: () => setShowTrackInput(true) },
    { label: "View Pricing", icon: DollarSign, action: () => sendMessage("What are your packages and pricing?") },
    { label: "Book Consultation", icon: Phone, action: () => sendMessage("I'd like to book a consultation") },
  ];

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-24 right-4 z-50 sm:bottom-28 sm:right-6"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="h-14 w-14 rounded-full bg-primary shadow-lg hover:bg-primary/90 hover:scale-105 transition-transform"
            >
              <MessageCircle className="h-6 w-6" />
              <span className="sr-only">Open chat</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-md sm:bottom-6 sm:right-6"
          >
            <div className="flex flex-col h-[70vh] max-h-[600px] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-primary text-primary-foreground">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">VibeLink Assistant</h3>
                    <p className="text-xs text-primary-foreground/80">Your Ghanaian event expert</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {messages.length > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearMessages}
                      className="h-8 w-8 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Clear chat</span>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/20"
                  >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close chat</span>
                  </Button>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea ref={scrollRef} className="flex-1 p-4">
                {messages.length === 0 ? (
                  <div className="space-y-4">
                    <div className="bg-muted rounded-lg p-4">
                      <p className="text-sm text-foreground">
                        Akwaaba! 👋 I'm your VibeLink Assistant. I can help you with:
                      </p>
                      <ul className="mt-3 text-sm text-foreground space-y-2">
                        <li>• Our invitation packages & pricing</li>
                        <li>• Tracking your order</li>
                        <li>• Ghanaian event traditions & tips</li>
                        <li>• Booking a consultation</li>
                      </ul>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-2">
                      {quickActions.map((action) => (
                        <Button
                          key={action.label}
                          variant="outline"
                          size="sm"
                          onClick={action.action}
                          className="text-xs"
                        >
                          <action.icon className="h-3 w-3 mr-1" />
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <MessageBubble key={index} message={message} />
                    ))}
                    {isLoading && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    )}
                    
                    {/* Suggested Follow-up Questions */}
                    {!isLoading && suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-2"
                      >
                        <p className="text-xs text-muted-foreground">Suggested questions:</p>
                        <div className="flex flex-wrap gap-2">
                          {suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="text-xs h-auto py-1.5 px-3 whitespace-normal text-left"
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </ScrollArea>

              {/* Track Order Input */}
              <AnimatePresence>
                {showTrackInput && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border bg-muted/50 p-3"
                  >
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter your Order ID..."
                        value={trackOrderId}
                        onChange={(e) => setTrackOrderId(e.target.value)}
                        onKeyPress={handleTrackKeyPress}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={handleTrackOrder} disabled={!trackOrderId.trim()}>
                        Track
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowTrackInput(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input Area */}
              <div className="p-4 border-t border-border bg-background">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSend} 
                    disabled={!input.trim() || isLoading}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send message</span>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Parse and render text with clickable links and phone numbers
function parseMessageContent(content: string) {
  // Combined regex for URLs, WhatsApp links, phone numbers, and markdown-style links
  const patterns = [
    // Markdown links [text](url)
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    // Plain URLs
    /(https?:\/\/[^\s\])<>]+)/g,
    // WhatsApp wa.me links
    /(wa\.me\/\d+)/g,
    // Phone numbers (various formats)
    /(\+?\d{1,3}[\s.-]?\d{2,3}[\s.-]?\d{3}[\s.-]?\d{4})/g,
  ];

  // First, handle markdown links
  let processedContent = content.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '{{LINK:$2:$1}}'
  );

  // Handle plain URLs (not already in markdown)
  processedContent = processedContent.replace(
    /(?<!\]\()(?<!\{\{LINK:)(https?:\/\/[^\s\])<>]+)/g,
    '{{URL:$1}}'
  );

  // Handle wa.me links
  processedContent = processedContent.replace(
    /(?<!\{\{URL:)(wa\.me\/\d+)/g,
    '{{WHATSAPP:$1}}'
  );

  // Handle phone numbers
  processedContent = processedContent.replace(
    /(\+?\d{1,3}[\s.-]?\d{2,3}[\s.-]?\d{3}[\s.-]?\d{4})/g,
    (match) => {
      // Don't replace if it's already part of a wa.me link
      if (processedContent.includes(`wa.me/${match.replace(/[\s.-]/g, '')}`)) {
        return match;
      }
      return `{{PHONE:${match}}}`;
    }
  );

  // Split by our markers and create elements
  const parts = processedContent.split(/(\{\{(?:LINK|URL|WHATSAPP|PHONE):[^}]+\}\})/g);
  
  return parts.map((part, index) => {
    // Check for markdown-style link
    const linkMatch = part.match(/\{\{LINK:([^:]+):([^}]+)\}\}/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[1]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
        >
          {linkMatch[2]}
        </a>
      );
    }

    // Check for plain URL
    const urlMatch = part.match(/\{\{URL:([^}]+)\}\}/);
    if (urlMatch) {
      return (
        <a
          key={index}
          href={urlMatch[1]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors break-all"
        >
          {urlMatch[1]}
        </a>
      );
    }

    // Check for WhatsApp link
    const whatsappMatch = part.match(/\{\{WHATSAPP:([^}]+)\}\}/);
    if (whatsappMatch) {
      return (
        <a
          key={index}
          href={`https://${whatsappMatch[1]}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-600 dark:text-green-400 underline underline-offset-2 hover:text-green-500 transition-colors"
        >
          {whatsappMatch[1]}
        </a>
      );
    }

    // Check for phone number
    const phoneMatch = part.match(/\{\{PHONE:([^}]+)\}\}/);
    if (phoneMatch) {
      const cleanPhone = phoneMatch[1].replace(/[\s.-]/g, '');
      return (
        <span key={index} className="inline-flex items-center gap-1">
          <a
            href={`tel:${cleanPhone}`}
            className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
          >
            {phoneMatch[1]}
          </a>
          <a
            href={`https://wa.me/${cleanPhone.replace('+', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 dark:text-green-400 hover:text-green-500 transition-colors text-xs"
            title="Chat on WhatsApp"
          >
            (WhatsApp)
          </a>
        </span>
      );
    }

    return part;
  });
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
          isUser 
            ? "bg-primary text-primary-foreground rounded-br-md" 
            : "bg-muted text-foreground rounded-bl-md"
        )}
      >
        <div className="space-y-2 leading-relaxed">
          {message.content.split('\n').map((line, i) => (
            <p key={i} className={line.trim() === '' ? 'h-2' : ''}>
              {parseMessageContent(line)}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
