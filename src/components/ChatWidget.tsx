import { useState, useRef, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Package, Phone, DollarSign, Trash2, Copy, Check, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatbot, type ChatMessage } from "@/hooks/useChatbot";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Store message timestamps
type MessageWithTime = ChatMessage & { timestamp: Date };

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [showTrackInput, setShowTrackInput] = useState(false);
  const [trackOrderId, setTrackOrderId] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const stored = localStorage.getItem("chat_sound_enabled");
    return stored !== "false"; // Default to true
  });
  const [messagesWithTime, setMessagesWithTime] = useState<MessageWithTime[]>([]);
  
  const { messages, isLoading, suggestions, sendMessage, trackOrder, clearMessages } = useChatbot();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevMessageCountRef = useRef(0);

  // Initialize audio
  useEffect(() => {
    // Create audio element with a simple notification sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioRef.current = new Audio();
    
    // Create a simple beep sound
    const createBeep = () => {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    };
    
    audioRef.current.play = createBeep as any;
    
    return () => {
      audioContext.close();
    };
  }, []);

  // Play sound on new assistant message
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === "assistant" && soundEnabled && !isLoading) {
        playNotificationSound();
      }
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, soundEnabled, isLoading]);

  // Sync messages with timestamps
  useEffect(() => {
    if (messages.length > messagesWithTime.length) {
      const newMessages = messages.slice(messagesWithTime.length);
      setMessagesWithTime(prev => [
        ...prev,
        ...newMessages.map(msg => ({ ...msg, timestamp: new Date() }))
      ]);
    } else if (messages.length < messagesWithTime.length) {
      // Messages were cleared
      setMessagesWithTime([]);
    } else if (messages.length > 0) {
      // Update the last message (streaming)
      const lastMsg = messages[messages.length - 1];
      setMessagesWithTime(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1] = { ...lastMsg, timestamp: updated[updated.length - 1].timestamp };
        }
        return updated;
      });
    }
  }, [messages]);

  const playNotificationSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);
      
      setTimeout(() => ctx.close(), 500);
    } catch (e) {
      console.log("Audio not supported");
    }
  };

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem("chat_sound_enabled", String(newValue));
    toast({
      title: newValue ? "Sound enabled" : "Sound muted",
      description: newValue ? "You'll hear a sound for new messages" : "Notifications are now silent",
    });
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messagesWithTime, suggestions]);

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

  const handleClearMessages = () => {
    clearMessages();
    setMessagesWithTime([]);
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
                <div className="flex items-center gap-1">
                  {/* Sound Toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSound}
                    className="h-8 w-8 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/20"
                    title={soundEnabled ? "Mute notifications" : "Enable sound"}
                  >
                    {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    <span className="sr-only">{soundEnabled ? "Mute" : "Unmute"}</span>
                  </Button>
                  {messagesWithTime.length > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClearMessages}
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
                {messagesWithTime.length === 0 ? (
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
                    {messagesWithTime.map((message, index) => (
                      <MessageBubble key={index} message={message} />
                    ))}
                    {isLoading && <TypingIndicator />}
                    
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

// Parse and render text with clickable links, phone numbers, and bold text
function parseMessageContent(content: string): ReactNode[] {
  const elements: ReactNode[] = [];
  let remaining = content;
  let key = 0;

  while (remaining.length > 0) {
    // Check for bold text **text**
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    
    // Check for markdown link [text](url)
    const linkMatch = remaining.match(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/);
    
    // Check for plain URL (including wa.me)
    const urlMatch = remaining.match(/(https?:\/\/[^\s<>)\]]+)/);
    
    // Check for wa.me without https
    const waMatch = remaining.match(/(?<![/:])(wa\.me\/\d+)/);
    
    // Check for phone number
    const phoneMatch = remaining.match(/(\+\d{1,3}\s?\d{2,3}\s?\d{3}\s?\d{4})/);

    // Find the earliest match
    const matches = [
      { type: 'bold', match: boldMatch, index: boldMatch?.index ?? Infinity },
      { type: 'link', match: linkMatch, index: linkMatch?.index ?? Infinity },
      { type: 'url', match: urlMatch, index: urlMatch?.index ?? Infinity },
      { type: 'wa', match: waMatch, index: waMatch?.index ?? Infinity },
      { type: 'phone', match: phoneMatch, index: phoneMatch?.index ?? Infinity },
    ].filter(m => m.match !== null).sort((a, b) => a.index - b.index);

    if (matches.length === 0 || matches[0].index === Infinity) {
      // No more matches, add remaining text
      if (remaining) elements.push(remaining);
      break;
    }

    const first = matches[0];
    const matchIndex = first.index;
    const match = first.match!;

    // Add text before the match
    if (matchIndex > 0) {
      elements.push(remaining.slice(0, matchIndex));
    }

    switch (first.type) {
      case 'bold':
        elements.push(
          <strong key={key++} className="font-semibold">
            {match[1]}
          </strong>
        );
        remaining = remaining.slice(matchIndex + match[0].length);
        break;

      case 'link':
        elements.push(
          <a
            key={key++}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
          >
            {match[1]}
          </a>
        );
        remaining = remaining.slice(matchIndex + match[0].length);
        break;

      case 'url':
        const url = match[1];
        // Check if this is a wa.me URL
        if (url.includes('wa.me')) {
          elements.push(
            <a
              key={key++}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 dark:text-green-400 underline underline-offset-2 hover:text-green-500 transition-colors"
            >
              Chat on WhatsApp
            </a>
          );
        } else {
          // Clean display URL
          const displayUrl = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
          elements.push(
            <a
              key={key++}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            >
              {displayUrl}
            </a>
          );
        }
        remaining = remaining.slice(matchIndex + match[0].length);
        break;

      case 'wa':
        elements.push(
          <a
            key={key++}
            href={`https://${match[1]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 dark:text-green-400 underline underline-offset-2 hover:text-green-500 transition-colors"
          >
            Chat on WhatsApp
          </a>
        );
        remaining = remaining.slice(matchIndex + match[0].length);
        break;

      case 'phone':
        const cleanPhone = match[1].replace(/\s/g, '');
        elements.push(
          <span key={key++} className="inline-flex items-center gap-1 flex-wrap">
            <a
              href={`tel:${cleanPhone}`}
              className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            >
              {match[1]}
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
        remaining = remaining.slice(matchIndex + match[0].length);
        break;
    }
  }

  return elements.length > 0 ? elements : [content];
}

// Typing indicator with animated dots
function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center gap-1">
          <motion.span
            className="w-2 h-2 bg-muted-foreground/60 rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
          />
          <motion.span
            className="w-2 h-2 bg-muted-foreground/60 rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
          />
          <motion.span
            className="w-2 h-2 bg-muted-foreground/60 rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: MessageWithTime }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy message",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
      <div className={cn("flex group", isUser ? "justify-end" : "justify-start")}>
        <div className="relative">
          <div
            className={cn(
              "max-w-[85%] rounded-2xl px-4 py-3 text-sm cursor-pointer transition-all",
              isUser 
                ? "bg-primary text-primary-foreground rounded-br-md hover:bg-primary/90" 
                : "bg-muted text-foreground rounded-bl-md hover:bg-muted/80"
            )}
            onClick={handleCopy}
            title="Click to copy"
          >
            <div className="space-y-2 leading-relaxed">
              {message.content.split('\n').map((line, i) => (
                <p key={i} className={line.trim() === '' ? 'h-2' : ''}>
                  {parseMessageContent(line)}
                </p>
              ))}
            </div>
          </div>
          
          {/* Copy indicator */}
          <AnimatePresence>
            {copied ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={cn(
                  "absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1",
                  isUser && "-left-2 -right-auto"
                )}
              >
                <Check className="h-3 w-3" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                className={cn(
                  "absolute -top-2 -right-2 bg-background border border-border text-muted-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity",
                  isUser && "-left-2 -right-auto"
                )}
              >
                <Copy className="h-3 w-3" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Timestamp */}
      <span className={cn(
        "text-[10px] text-muted-foreground/60 px-2",
        isUser ? "text-right" : "text-left"
      )}>
        {format(message.timestamp, "h:mm a")}
      </span>
    </div>
  );
}