import React, { useState, useRef, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Package, Phone, DollarSign, Trash2, Copy, Check, Volume2, VolumeX, SmilePlus, Search, Reply, ChevronUp, Pin, PinOff, Sparkles, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatbot, type ChatMessage } from "@/hooks/useChatbot";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Store message timestamps and reply info
type MessageWithTime = ChatMessage & { 
  timestamp: Date; 
  id: string;
  replyTo?: { id: string; content: string; role: string };
};

// Generate unique message ID
let messageIdCounter = 0;
const generateMessageId = () => `msg_${Date.now()}_${++messageIdCounter}`;

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
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [replyingTo, setReplyingTo] = useState<MessageWithTime | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [pinnedMessages, setPinnedMessages] = useState<Set<string>>(new Set());
  
  const { messages, isLoading, suggestions, sendMessage, trackOrder, clearMessages } = useChatbot();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevMessageCountRef = useRef(0);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

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

  // Sync messages with timestamps and IDs
  useEffect(() => {
    if (messages.length > messagesWithTime.length) {
      const newMessages = messages.slice(messagesWithTime.length);
      setMessagesWithTime(prev => [
        ...prev,
        ...newMessages.map(msg => ({ 
          ...msg, 
          timestamp: new Date(),
          id: generateMessageId(),
          replyTo: replyingTo ? { 
            id: replyingTo.id, 
            content: replyingTo.content.slice(0, 100), 
            role: replyingTo.role 
          } : undefined
        }))
      ]);
      // Clear reply after sending
      if (newMessages.some(m => m.role === 'user')) {
        setReplyingTo(null);
      }
    } else if (messages.length < messagesWithTime.length) {
      // Messages were cleared
      setMessagesWithTime([]);
    } else if (messages.length > 0) {
      // Update the last message (streaming)
      const lastMsg = messages[messages.length - 1];
      setMessagesWithTime(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1] = { 
            ...lastMsg, 
            timestamp: updated[updated.length - 1].timestamp,
            id: updated[updated.length - 1].id,
            replyTo: updated[updated.length - 1].replyTo
          };
        }
        return updated;
      });
    }
  }, [messages, replyingTo]);

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
    setReplyingTo(null);
    setSearchQuery("");
    setShowSearch(false);
    setPinnedMessages(new Set());
  };

  // Toggle pin on a message
  const handlePinMessage = (messageId: string) => {
    setPinnedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  // Get pinned messages in order
  const pinnedMessagesList = messagesWithTime.filter(msg => pinnedMessages.has(msg.id));

  // Filter messages based on search query
  const filteredMessages = searchQuery.trim()
    ? messagesWithTime.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messagesWithTime;

  // Scroll to a specific message
  const scrollToMessage = (messageId: string) => {
    const element = messageRefs.current.get(messageId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMessageId(messageId);
      setTimeout(() => setHighlightedMessageId(null), 2000);
    }
  };

  // Handle reply to message
  const handleReply = (message: MessageWithTime) => {
    setReplyingTo(message);
    inputRef.current?.focus();
  };

  const quickActions = [
    { label: "Track Order", icon: Package, action: () => setShowTrackInput(true) },
    { label: "View Pricing", icon: DollarSign, action: () => sendMessage("What are your packages and pricing?") },
    { label: "Book Consultation", icon: Phone, action: () => sendMessage("I'd like to book a consultation") },
  ];

  return (
    <>
      {/* AI Chat Button - Beautiful Animated Design */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-24 right-4 z-50 sm:bottom-28 sm:right-6"
          >
            {/* Floating Label */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap"
            >
              <motion.div
                animate={{
                  x: [0, -5, 0],
                  opacity: [0.9, 1, 0.9]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="bg-background/95 backdrop-blur-sm border border-border rounded-full px-4 py-2 shadow-lg"
              >
                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                  Chat with AI
                </span>
              </motion.div>
            </motion.div>

            {/* Main Button Container */}
            <div className="relative">
              {/* Outer Glow Ring */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.2, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ filter: "blur(8px)" }}
              />

              {/* Pulsing Ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-purple-400"
                animate={{
                  scale: [1, 1.4, 1.4],
                  opacity: [0.8, 0, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />

              {/* Second Pulsing Ring (offset) */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-pink-400"
                animate={{
                  scale: [1, 1.4, 1.4],
                  opacity: [0.8, 0, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 0.5,
                }}
              />

              {/* Main Button */}
              <motion.button
                onClick={() => setIsOpen(true)}
                className="relative h-16 w-16 rounded-full bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 shadow-2xl flex items-center justify-center overflow-hidden group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    "0 10px 30px -10px rgba(139, 92, 246, 0.5)",
                    "0 20px 40px -10px rgba(236, 72, 153, 0.5)",
                    "0 10px 30px -10px rgba(139, 92, 246, 0.5)",
                  ],
                }}
                transition={{
                  boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                }}
              >
                {/* Shimmer Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                  animate={{ x: ["-200%", "200%"] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatDelay: 2,
                  }}
                />

                {/* Sparkle Particles */}
                <motion.div
                  className="absolute top-2 right-2"
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 0,
                  }}
                >
                  <Sparkles className="h-3 w-3 text-yellow-300" />
                </motion.div>
                <motion.div
                  className="absolute bottom-3 left-2"
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    rotate: [0, -180, -360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 0.7,
                  }}
                >
                  <Sparkles className="h-2.5 w-2.5 text-cyan-300" />
                </motion.div>
                <motion.div
                  className="absolute top-4 left-3"
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 1.2,
                  }}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                </motion.div>

                {/* Bot Icon with Animation */}
                <motion.div
                  animate={{
                    y: [0, -2, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative z-10"
                >
                  <Bot className="h-7 w-7 text-white drop-shadow-lg" />
                </motion.div>

                {/* AI Badge */}
                <motion.div
                  className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full shadow-lg"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  AI
                </motion.div>
              </motion.button>
            </div>
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
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="relative h-11 w-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(255,255,255,0.4)",
                        "0 0 0 8px rgba(255,255,255,0)",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Bot className="h-6 w-6 text-white" />
                    </motion.div>
                    {/* Online indicator */}
                    <motion.div
                      className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-400 border-2 border-purple-500"
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </motion.div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">VibeLink AI</h3>
                      <motion.span
                        className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded-full"
                        animate={{
                          opacity: [0.8, 1, 0.8],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      >
                        <Sparkles className="h-2.5 w-2.5 inline mr-0.5" />
                        SMART
                      </motion.span>
                    </div>
                    <p className="text-xs text-white/80">Your Ghanaian event expert</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {/* Search Toggle */}
                  {messagesWithTime.length > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSearch(!showSearch)}
                      className={cn(
                        "h-8 w-8 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/20",
                        showSearch && "bg-primary-foreground/20"
                      )}
                      title="Search messages"
                    >
                      <Search className="h-4 w-4" />
                      <span className="sr-only">Search</span>
                    </Button>
                  )}
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

              {/* Search Bar */}
              <AnimatePresence>
                {showSearch && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-b border-border bg-muted/50 px-4 py-2"
                  >
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9"
                      />
                      {searchQuery && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSearchQuery("")}
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    {searchQuery && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {filteredMessages.length} result{filteredMessages.length !== 1 ? 's' : ''} found
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
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
                    {/* Pinned Messages Section */}
                    {!searchQuery && pinnedMessagesList.length > 0 && (
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                          <Pin className="h-3 w-3" />
                          <span>Pinned ({pinnedMessagesList.length})</span>
                        </div>
                        <div className="space-y-2">
                          {pinnedMessagesList.map((message) => (
                            <button
                              key={`pinned-${message.id}`}
                              onClick={() => scrollToMessage(message.id)}
                              className="w-full text-left text-xs p-2 rounded bg-background/50 hover:bg-background/80 transition-colors border border-border/50"
                            >
                              <p className="line-clamp-2 text-foreground">
                                {message.content.slice(0, 100)}{message.content.length > 100 ? '...' : ''}
                              </p>
                              <span className="text-muted-foreground text-[10px]">
                                {message.role === 'user' ? 'You' : 'Assistant'} • {format(message.timestamp, "h:mm a")}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Search results info */}
                    {searchQuery && filteredMessages.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No messages found for "{searchQuery}"</p>
                      </div>
                    )}
                    
                    {(searchQuery ? filteredMessages : messagesWithTime).map((message) => (
                      <MessageBubble 
                        key={message.id} 
                        message={message}
                        onReply={() => handleReply(message)}
                        onScrollToReply={scrollToMessage}
                        onPin={() => handlePinMessage(message.id)}
                        isPinned={pinnedMessages.has(message.id)}
                        isHighlighted={highlightedMessageId === message.id}
                        ref={(el) => {
                          if (el) messageRefs.current.set(message.id, el);
                        }}
                      />
                    ))}
                    {isLoading && !searchQuery && <TypingIndicator />}
                    
                    {/* Suggested Follow-up Questions */}
                    {!isLoading && !searchQuery && suggestions.length > 0 && (
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

              {/* Reply Preview */}
              <AnimatePresence>
                {replyingTo && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border bg-muted/30 px-4 py-2"
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 border-l-2 border-primary pl-2">
                        <p className="text-xs text-muted-foreground">
                          Replying to {replyingTo.role === 'user' ? 'yourself' : 'Assistant'}
                        </p>
                        <p className="text-sm text-foreground line-clamp-2">
                          {replyingTo.content.slice(0, 100)}{replyingTo.content.length > 100 ? '...' : ''}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setReplyingTo(null)}
                        className="h-6 w-6 shrink-0"
                      >
                        <X className="h-3 w-3" />
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
                    placeholder={replyingTo ? "Type your reply..." : "Type your message..."}
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

// Available emoji reactions
const EMOJI_REACTIONS = [
  { emoji: "👍", label: "Like" },
  { emoji: "❤️", label: "Love" },
  { emoji: "😂", label: "Laugh" },
  { emoji: "😮", label: "Wow" },
  { emoji: "😢", label: "Sad" },
  { emoji: "🙏", label: "Thanks" },
];

interface MessageBubbleProps {
  message: MessageWithTime;
  onReply?: () => void;
  onScrollToReply?: (messageId: string) => void;
  onPin?: () => void;
  isPinned?: boolean;
  isHighlighted?: boolean;
}

const MessageBubble = React.forwardRef<HTMLDivElement, MessageBubbleProps>(
  ({ message, onReply, onScrollToReply, onPin, isPinned, isHighlighted }, ref) => {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [reactions, setReactions] = useState<string[]>([]);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleReaction = (emoji: string) => {
    setReactions(prev => {
      if (prev.includes(emoji)) {
        return prev.filter(e => e !== emoji);
      }
      return [...prev, emoji];
    });
    setShowReactions(false);
  };

  const toggleReactionPicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowReactions(!showReactions);
  };

  const handleReplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReply?.();
  };

  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPin?.();
  };
  
  return (
    <div 
      ref={ref}
      className={cn(
        "flex flex-col gap-1 transition-all duration-500",
        isUser ? "items-end" : "items-start",
        isHighlighted && "bg-primary/10 -mx-2 px-2 py-1 rounded-lg"
      )}
    >
      {/* Reply reference */}
      {message.replyTo && (
        <button
          onClick={() => onScrollToReply?.(message.replyTo!.id)}
          className={cn(
            "flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2",
            isUser ? "flex-row-reverse" : ""
          )}
        >
          <ChevronUp className="h-3 w-3" />
          <span className="border-l-2 border-primary/50 pl-2 line-clamp-1">
            {message.replyTo.content.slice(0, 50)}{message.replyTo.content.length > 50 ? '...' : ''}
          </span>
        </button>
      )}
      
      <div className={cn("flex group", isUser ? "justify-end" : "justify-start")}>
        <div className="relative">
          <div
            className={cn(
              "max-w-[85%] rounded-2xl px-4 py-3 text-sm transition-all",
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
            
            {/* Display reactions */}
            {reactions.length > 0 && (
              <div className={cn(
                "flex flex-wrap gap-1 mt-2 pt-2 border-t",
                isUser ? "border-primary-foreground/20" : "border-border"
              )}>
                {reactions.map((emoji, i) => (
                  <motion.button
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => handleReaction(emoji)}
                    className={cn(
                      "text-sm px-1.5 py-0.5 rounded-full transition-colors",
                      isUser 
                        ? "bg-primary-foreground/20 hover:bg-primary-foreground/30" 
                        : "bg-background hover:bg-background/80"
                    )}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            )}
          </div>
          
          {/* Action buttons */}
          <div className={cn(
            "absolute -top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
            isUser ? "-left-24 flex-row-reverse" : "-right-24"
          )}>
            {/* Pin button */}
            <motion.button
              onClick={handlePinClick}
              className={cn(
                "rounded-full p-1.5 transition-colors",
                isPinned 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-background border border-border text-muted-foreground hover:bg-muted"
              )}
              title={isPinned ? "Unpin message" : "Pin message"}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isPinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
            </motion.button>
            
            {/* Reply button */}
            <motion.button
              onClick={handleReplyClick}
              className="bg-background border border-border text-muted-foreground rounded-full p-1.5 hover:bg-muted transition-colors"
              title="Reply"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Reply className="h-3 w-3" />
            </motion.button>
            
            {/* Reaction button */}
            <motion.button
              onClick={toggleReactionPicker}
              className="bg-background border border-border text-muted-foreground rounded-full p-1.5 hover:bg-muted transition-colors"
              title="Add reaction"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <SmilePlus className="h-3 w-3" />
            </motion.button>
            
            {/* Copy button */}
            <motion.button
              onClick={handleCopy}
              className={cn(
                "rounded-full p-1.5 transition-colors",
                copied 
                  ? "bg-green-500 text-white" 
                  : "bg-background border border-border text-muted-foreground hover:bg-muted"
              )}
              title="Copy message"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </motion.button>
          </div>
          
          {/* Reaction picker */}
          <AnimatePresence>
            {showReactions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                className={cn(
                  "absolute -top-12 z-10 bg-background border border-border rounded-full px-2 py-1.5 shadow-lg flex items-center gap-1",
                  isUser ? "right-0" : "left-0"
                )}
              >
                {EMOJI_REACTIONS.map(({ emoji, label }) => (
                  <motion.button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className={cn(
                      "text-lg p-1 rounded-full transition-all hover:bg-muted",
                      reactions.includes(emoji) && "bg-primary/10 ring-2 ring-primary/20"
                    )}
                    title={label}
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {emoji}
                  </motion.button>
                ))}
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
});

MessageBubble.displayName = 'MessageBubble';