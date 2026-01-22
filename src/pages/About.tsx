import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import {
  Heart, Globe, Sparkles, Shield, Users, MessageCircle as MessageCircleIcon,
  Instagram, Facebook, Twitter, Linkedin, Loader2, ChevronLeft, ChevronRight,
  FileText, Smartphone, RefreshCw, MapPin, Clock, Camera, Music, Video,
  QrCode, Search, MessageSquare, ClipboardList, Radio, Flower2,
  BookOpen, Coins, CheckCircle2, XCircle, ArrowRight, Zap, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import SEO, { createBreadcrumbSchema } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  photo_url: string | null;
  social_facebook: string | null;
  social_twitter: string | null;
  social_instagram: string | null;
  social_linkedin: string | null;
}

const aboutBreadcrumb = createBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "About Us", url: "/about" },
]);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

export const socialLinks = [
  { name: "Instagram", icon: Instagram, href: "https://instagram.com/vibelink_events" },
  { name: "Facebook", icon: Facebook, href: "https://facebook.com/VibelinkEvents" },
  { name: "Twitter", icon: Twitter, href: "https://twitter.com/VibeLink_Events" },
  { name: "TikTok", icon: TikTokIcon, href: "https://tiktok.com/@vibelink.events" },
];

const values = [
  {
    icon: Heart,
    title: "Dignity",
    description: "Every ceremony deserves respect. We treat each project with the care it deserves.",
  },
  {
    icon: Globe,
    title: "Culture",
    description: "We celebrate Ghanaian traditions and honor the unique aspects of every celebration.",
  },
  {
    icon: Sparkles,
    title: "Simplicity",
    description: "One link does everything. We believe beautiful design should be effortless to share.",
  },
  {
    icon: Shield,
    title: "Trust",
    description: "Transparent pricing, reliable service. We deliver what we promise, every time.",
  },
];

const stats = [
  { value: 500, suffix: "+", label: "Events Created" },
  { value: 10000, suffix: "+", label: "Guests Reached" },
  { value: 98, suffix: "%", label: "Satisfaction Rate" },
  { value: 48, suffix: "hrs", label: "Fastest Delivery" },
];

const carouselImages = [
  { src: "/assets/carousel/wedding.png", label: "Weddings" },
  { src: "/assets/carousel/naming.png", label: "Naming Ceremonies" },
  { src: "/assets/carousel/graduation.png", label: "Graduations" },
  { src: "/assets/carousel/church.png", label: "Church Events" },
  { src: "/assets/carousel/corporate.png", label: "Corporate Events" },
  { src: "/assets/carousel/memorial.png", label: "Memorials" },
];

const paperProblems = [
  "Expensive to print in bulk",
  "Time-consuming to distribute by hand",
  "Cannot reach loved ones abroad",
  "Must reprint if details change",
];

const whatsappProblems = [
  "Images get compressed and lose quality",
  "Gets buried in busy WhatsApp chats",
  "No way to track who's coming",
  "Must reshare if details change",
  "No directions to venue",
  "Just a static picture - no interactivity",
];

// Feature tabs configuration
const featureTabs = [
  { id: "core", label: "Core", color: "primary" },
  { id: "engagement", label: "Guest", color: "pink-500" },
  { id: "media", label: "Media", color: "amber-500" },
  { id: "eventday", label: "Event Day", color: "emerald-500" },
  { id: "memorial", label: "Memorials", color: "slate-500" },
];

// Feature list organized by category
const allFeatures = [
  // Core Features
  { icon: RefreshCw, name: "Always Updated", desc: "Change details anytime - everyone sees the latest version", category: "core" },
  { icon: Globe, name: "Dedicated Webpage", desc: "A permanent link guests can bookmark and revisit", category: "core" },
  { icon: MapPin, name: "Google Maps", desc: "One-tap directions to your venue", category: "core" },
  { icon: Clock, name: "Countdown Timer", desc: "Build excitement as the day approaches", category: "core" },
  // Guest Engagement
  { icon: ClipboardList, name: "RSVP Tracking", desc: "Know exactly who's coming", category: "engagement" },
  { icon: FileText, name: "Registration Forms", desc: "Collect guest details and preferences", category: "engagement" },
  { icon: MessageSquare, name: "Guest Messaging", desc: "Direct communication with attendees", category: "engagement" },
  { icon: BookOpen, name: "Digital Guestbook", desc: "Heartfelt messages from loved ones", category: "engagement" },
  // Media
  { icon: Camera, name: "Photo Gallery", desc: "Share memories with all guests", category: "media" },
  { icon: Music, name: "Background Music", desc: "Set the mood instantly", category: "media" },
  { icon: Video, name: "Video Background", desc: "Cinematic first impressions", category: "media" },
  { icon: Radio, name: "Live Stream", desc: "Watch from anywhere in the world", category: "media" },
  // Event Day
  { icon: QrCode, name: "QR Check-in", desc: "Seamless guest scanning at the door", category: "eventday" },
  { icon: Search, name: "Lost & Found", desc: "Help recover misplaced items", category: "eventday" },
  // Memorials
  { icon: Flower2, name: "Tribute Wall", desc: "Share memories and condolences", category: "memorial" },
  { icon: BookOpen, name: "Obituary Section", desc: "Honor loved ones with dignity", category: "memorial" },
  { icon: Coins, name: "MoMo Donations", desc: "Direct contributions to the family", category: "memorial" },
];

const whyChooseFeatures = [
  {
    icon: MessageCircleIcon,
    title: "WhatsApp-First Support",
    description: "We are always just a message away. Get quick responses and updates via WhatsApp.",
  },
  {
    icon: Users,
    title: "Ghana-Focused Design",
    description: "Our templates are designed specifically for Ghanaian ceremonies and traditions.",
  },
  {
    icon: Globe,
    title: "Diaspora-Ready",
    description: "Your invitations work perfectly for guests anywhere in the world.",
  },
];

const About = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["core"]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  useEffect(() => {
    const fetchTeamMembers = async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("id, name, role, bio, photo_url, social_facebook, social_twitter, social_instagram, social_linkedin")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (!error && data) {
        setTeamMembers(data);
      }
      setLoadingTeam(false);
    };

    fetchTeamMembers();
  }, []);

  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
      }, 4000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  return (
    <Layout>
      <SEO
        title="About Us"
        description="Learn about VibeLink Events - Ghana's premier digital invitation service. Discover our journey from paper to the future of event invitations."
        keywords="VibeLink Events, digital invitations, Ghana event services, about VibeLink"
        canonical="/about"
        jsonLd={aboutBreadcrumb}
      />

      {/* Hero */}
      <section className="pt-24 lg:pt-32 pb-16 bg-gradient-to-b from-[#6B46C1] via-[#553C9A] to-[#44337A]">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              About VibeLink Events
            </h1>
            <p className="text-white/80 text-lg lg:text-xl">
              Ghana's premier digital invitation service, celebrating life's precious moments
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story - The Evolution */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Story
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              The evolution of invitations in Ghana
            </p>
          </motion.div>

          {/* Timeline */}
          <div className="max-w-5xl mx-auto">

            {/* Era 1: Paper */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative pl-8 md:pl-0 md:grid md:grid-cols-2 gap-8 mb-16"
            >
              <div className="md:text-right md:pr-12">
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 mb-4 relative overflow-hidden shadow-lg"
                  animate={{
                    scale: [1, 1.03, 1],
                    boxShadow: [
                      "0 4px 15px -3px rgba(56, 189, 248, 0.3)",
                      "0 8px 25px -3px rgba(56, 189, 248, 0.5)",
                      "0 4px 15px -3px rgba(56, 189, 248, 0.3)"
                    ],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <motion.div
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <FileText className="h-5 w-5 text-white" />
                  </motion.div>
                  <span className="font-semibold text-white">The Paper Era</span>
                </motion.div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Traditional Printed Cards</h3>
                <p className="text-muted-foreground mb-4">
                  For generations, Ghanaians celebrated life's milestones with beautifully printed invitation cards.
                  But paper came with limitations...
                </p>
                <div className="space-y-2">
                  {paperProblems.map((problem, i) => (
                    <div key={i} className="flex items-center gap-2 justify-start md:justify-end text-sm text-red-500">
                      <span>{problem}</span>
                      <XCircle className="h-4 w-4 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="hidden md:flex items-center justify-center">
                <motion.div
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg"
                  animate={{
                    y: [0, -10, 0],
                    boxShadow: [
                      "0 10px 25px -5px rgba(56, 189, 248, 0.3)",
                      "0 25px 50px -12px rgba(56, 189, 248, 0.5)",
                      "0 10px 25px -5px rgba(56, 189, 248, 0.3)"
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <motion.div
                    animate={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <FileText className="h-16 w-16 text-white" />
                  </motion.div>
                </motion.div>
              </div>
              {/* Timeline line for Paper Era */}
              <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 via-amber-400 to-purple-500 -translate-x-1/2 hidden md:block" />
            </motion.div>

            {/* Era 2: WhatsApp/Digital Images */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative pl-8 md:pl-0 md:grid md:grid-cols-2 gap-8 mb-16"
            >
              <div className="hidden md:flex items-center justify-center order-1">
                <motion.div
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg"
                  animate={{
                    y: [0, -10, 0],
                    boxShadow: [
                      "0 10px 25px -5px rgba(34, 197, 94, 0.3)",
                      "0 25px 50px -12px rgba(34, 197, 94, 0.5)",
                      "0 10px 25px -5px rgba(34, 197, 94, 0.3)"
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                  whileHover={{ scale: 1.1, rotate: -5 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0], y: [0, -3, 3, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Smartphone className="h-16 w-16 text-white" />
                  </motion.div>
                </motion.div>
              </div>
              <div className="md:pl-12 order-2">
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 mb-4 relative overflow-hidden"
                  animate={{
                    scale: [1, 1.03, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(34, 197, 94, 0)",
                      "0 0 20px 5px rgba(34, 197, 94, 0.25)",
                      "0 0 0 0 rgba(34, 197, 94, 0)"
                    ],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                >
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0], y: [0, -2, 2, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Smartphone className="h-5 w-5 text-green-600" />
                  </motion.div>
                  <span className="font-semibold text-green-700 dark:text-green-400">The WhatsApp Era</span>
                </motion.div>
                <h3 className="text-2xl font-bold text-foreground mb-4">JPEG & PDF Flyers</h3>
                <p className="text-muted-foreground mb-4">
                  Then came the digital shift. Designers created invitation flyers - JPEGs and PDFs shared via
                  WhatsApp, email, and social media. Faster and cheaper, but with new problems...
                </p>
                <div className="space-y-2">
                  {whatsappProblems.map((problem, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-amber-600">
                      <XCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{problem}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Timeline line for WhatsApp Era */}
              <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-400 via-amber-400 to-purple-500 -translate-x-1/2 hidden md:block" />
            </motion.div>

            {/* Era 3: VibeLink */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="text-center max-w-3xl mx-auto px-4">
                <motion.div
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 mb-6 shadow-lg relative overflow-hidden"
                  animate={{
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      "0 10px 25px -5px rgba(139, 92, 246, 0.3)",
                      "0 20px 40px -5px rgba(139, 92, 246, 0.5)",
                      "0 10px 25px -5px rgba(139, 92, 246, 0.3)"
                    ],
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                    animate={{
                      x: ["-100%", "200%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      repeatDelay: 1.5
                    }}
                  />
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap className="h-5 w-5 text-white relative z-10" />
                  </motion.div>
                  <span className="font-bold text-white relative z-10">The VibeLink Era</span>
                </motion.div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
                  What if an invitation could do <span className="text-primary">more</span>?
                </h3>
                <p className="text-muted-foreground text-base sm:text-lg mb-4">
                  VibeLink Events was born from this question. We don't just design invitations -
                  we create <strong>living, breathing event experiences</strong>. One simple link that does everything.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Accordion */}
      <section className="py-10 bg-gradient-to-b from-muted/30 via-background to-muted/20 relative overflow-hidden">
        {/* Parallax Background Elements */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl"
          animate={{
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl"
          animate={{
            y: [0, -40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-foreground mb-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Everything Your Event Needs
            </motion.h2>
            <motion.p
              className="text-muted-foreground text-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              One link. Endless possibilities.
            </motion.p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-2">
            {/* Accordion Items */}
            {featureTabs.map((tab, index) => {
              const isExpanded = expandedCategories.includes(tab.id);
              const categoryFeatures = allFeatures.filter(f => f.category === tab.id);
              const defaultConfig = {
                headerBg: "bg-gradient-to-r from-purple-600 to-indigo-600",
                headerText: "text-white",
                iconBg: "bg-white/20",
                iconText: "text-white",
                contentBg: "bg-purple-50 dark:bg-purple-950/20",
                featureIcon: "bg-purple-100 dark:bg-purple-900/30",
                featureText: "text-purple-600 dark:text-purple-400",
                shadow: "shadow-lg shadow-purple-500/20",
                hoverShadow: "hover:shadow-xl hover:shadow-purple-500/30",
              };

              const colorConfigs: Record<string, typeof defaultConfig> = {
                core: defaultConfig,
                engagement: {
                  headerBg: "bg-gradient-to-r from-pink-500 to-rose-500",
                  headerText: "text-white",
                  iconBg: "bg-white/20",
                  iconText: "text-white",
                  contentBg: "bg-pink-50 dark:bg-pink-950/20",
                  featureIcon: "bg-pink-100 dark:bg-pink-900/30",
                  featureText: "text-pink-600 dark:text-pink-400",
                  shadow: "shadow-lg shadow-pink-500/20",
                  hoverShadow: "hover:shadow-xl hover:shadow-pink-500/30",
                },
                media: {
                  headerBg: "bg-gradient-to-r from-amber-500 to-orange-500",
                  headerText: "text-white",
                  iconBg: "bg-white/20",
                  iconText: "text-white",
                  contentBg: "bg-amber-50 dark:bg-amber-950/20",
                  featureIcon: "bg-amber-100 dark:bg-amber-900/30",
                  featureText: "text-amber-600 dark:text-amber-400",
                  shadow: "shadow-lg shadow-amber-500/20",
                  hoverShadow: "hover:shadow-xl hover:shadow-amber-500/30",
                },
                eventday: {
                  headerBg: "bg-gradient-to-r from-emerald-500 to-teal-500",
                  headerText: "text-white",
                  iconBg: "bg-white/20",
                  iconText: "text-white",
                  contentBg: "bg-emerald-50 dark:bg-emerald-950/20",
                  featureIcon: "bg-emerald-100 dark:bg-emerald-900/30",
                  featureText: "text-emerald-600 dark:text-emerald-400",
                  shadow: "shadow-lg shadow-emerald-500/20",
                  hoverShadow: "hover:shadow-xl hover:shadow-emerald-500/30",
                },
                memorial: {
                  headerBg: "bg-gradient-to-r from-slate-600 to-gray-600",
                  headerText: "text-white",
                  iconBg: "bg-white/20",
                  iconText: "text-white",
                  contentBg: "bg-slate-50 dark:bg-slate-950/20",
                  featureIcon: "bg-slate-100 dark:bg-slate-900/30",
                  featureText: "text-slate-600 dark:text-slate-400",
                  shadow: "shadow-lg shadow-slate-500/20",
                  hoverShadow: "hover:shadow-xl hover:shadow-slate-500/30",
                },
              };
              const colorConfig = colorConfigs[tab.id] || defaultConfig;

              const categoryIcons = {
                core: RefreshCw,
                engagement: Users,
                media: Camera,
                eventday: QrCode,
                memorial: Flower2,
              };
              const CategoryIcon = categoryIcons[tab.id as keyof typeof categoryIcons] || RefreshCw;

              const categoryTitles = {
                core: "Core Features",
                engagement: "Guest Engagement",
                media: "Media & Experience",
                eventday: "Event Day Tools",
                memorial: "Memorial Features",
              };

              const categoryDescriptions = {
                core: "Essential tools for every invitation",
                engagement: "Connect with your guests",
                media: "Rich multimedia experiences",
                eventday: "On-site management tools",
                memorial: "Honor loved ones with dignity",
              };

              return (
                <motion.div
                  key={tab.id}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.08,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ scale: 1.01 }}
                  className={`rounded-2xl overflow-hidden transition-all duration-500 ${colorConfig.shadow} ${colorConfig.hoverShadow}`}
                >
                  {/* Accordion Header - Now with gradient background */}
                  <motion.button
                    onClick={() => toggleCategory(tab.id)}
                    className={`w-full px-5 py-4 flex items-center justify-between transition-all duration-300 ${colorConfig.headerBg} ${colorConfig.headerText}`}
                    whileTap={{ scale: 0.995 }}
                  >
                    <div className="flex items-center gap-4">
                      <motion.div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorConfig.iconBg} backdrop-blur-sm`}
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <CategoryIcon className={`h-5 w-5 ${colorConfig.iconText}`} />
                      </motion.div>
                      <div className="text-left">
                        <h3 className="font-bold text-lg">
                          {categoryTitles[tab.id as keyof typeof categoryTitles]}
                        </h3>
                        <p className="text-white/70 text-sm">
                          {categoryDescriptions[tab.id as keyof typeof categoryDescriptions]}
                        </p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                      className="bg-white/20 rounded-full p-1.5"
                    >
                      <ChevronDown className="h-5 w-5 text-white" />
                    </motion.div>
                  </motion.button>

                  {/* Accordion Content - Lighter background for contrast */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className={`px-5 pb-5 pt-4 ${colorConfig.contentBg}`}>
                          <div className="grid sm:grid-cols-2 gap-2">
                            {categoryFeatures.map((feature, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20, y: 10 }}
                                animate={{ opacity: 1, x: 0, y: 0 }}
                                transition={{
                                  duration: 0.3,
                                  delay: i * 0.06,
                                  type: "spring",
                                  stiffness: 150
                                }}
                                whileHover={{
                                  scale: 1.02,
                                  x: 5,
                                  transition: { duration: 0.2 }
                                }}
                                className="flex items-start gap-3 p-3 rounded-xl bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-all duration-300 cursor-default group shadow-sm hover:shadow-md"
                              >
                                <motion.div
                                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colorConfig.featureIcon}`}
                                  whileHover={{ rotate: 15 }}
                                  transition={{ type: "spring", stiffness: 300 }}
                                >
                                  <feature.icon className={`h-4 w-4 ${colorConfig.featureText}`} />
                                </motion.div>
                                <div>
                                  <p className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{feature.name}</p>
                                  <p className="text-muted-foreground text-xs">{feature.desc}</p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {/* Works Everywhere - More spacing and better styling */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="pt-8 text-center"
            >
              <motion.div
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 shadow-xl shadow-purple-500/25"
                whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(139, 92, 246, 0.35)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Globe className="h-5 w-5 text-white" />
                </motion.div>
                <span className="text-white font-semibold text-sm">
                  One Link, Any Location - Accra, Kumasi, Tamale, London, Nairobi, Lagos, New York...
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Carousel Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Events We Serve
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                From joyful celebrations to dignified memorials, we create the perfect digital
                invitation for every occasion.
              </p>
              <ul className="space-y-3">
                {["Weddings & Engagements", "Naming Ceremonies", "Graduations", "Church Events", "Corporate Gatherings", "Memorials & Funerals"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Image Carousel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <div className="relative aspect-[4/3] overflow-hidden">
                  {carouselImages.map((image, index) => (
                    <motion.div
                      key={index}
                      initial={false}
                      animate={{
                        opacity: currentSlide === index ? 1 : 0,
                        scale: currentSlide === index ? 1 : 1.1,
                      }}
                      transition={{ duration: 0.7, ease: "easeInOut" }}
                      className="absolute inset-0"
                    >
                      <img
                        src={image.src}
                        alt={image.label}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                          opacity: currentSlide === index ? 1 : 0,
                          y: currentSlide === index ? 0 : 20
                        }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="absolute bottom-6 left-6 right-6"
                      >
                        <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold shadow-lg">
                          {image.label}
                        </span>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>

                <button
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-all flex items-center justify-center group"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-all flex items-center justify-center group"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
                </button>

                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
                  {carouselImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`transition-all duration-300 rounded-full ${
                        currentSlide === index
                          ? "w-8 h-2 bg-white"
                          : "w-2 h-2 bg-white/50 hover:bg-white/70"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <motion.div
                    key={currentSlide}
                    initial={{ width: "0%" }}
                    animate={{ width: isPaused ? "0%" : "100%" }}
                    transition={{ duration: 4, ease: "linear" }}
                    className="h-full bg-gradient-to-r from-secondary to-primary"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-[#7C3AED]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-1">
                  <AnimatedCounter
                    end={stat.value}
                    suffix={stat.suffix}
                    duration={2000}
                  />
                </div>
                <div className="text-white/80 text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Our Mission
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              To be the digital front door to every Ghanaian ceremony - from joyful weddings and
              naming ceremonies to dignified funerals, graduations, church events, and corporate gatherings.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Today, we serve families across Ghana and the diaspora, helping them share life's
              most precious moments with interactive digital invitations that honor our traditions
              while embracing modern convenience.
            </p>
            <motion.div
              className="inline-block px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-2 border-primary/30 relative overflow-hidden"
              animate={{
                scale: [1, 1.02, 1],
                boxShadow: [
                  "0 0 0 0 rgba(139, 92, 246, 0)",
                  "0 0 30px 10px rgba(139, 92, 246, 0.15)",
                  "0 0 0 0 rgba(139, 92, 246, 0)"
                ],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 1
                }}
              />
              <p className="text-xl md:text-2xl font-bold text-foreground relative z-10">
                Your event deserves more than a JPEG.<br />
                <span className="text-primary">It deserves a VibeLink.</span>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              What drives us every day
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  y: -8,
                }}
                className="text-center p-6 rounded-2xl bg-card border border-border shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300"
              >
                <motion.div
                  className="w-14 h-14 mx-auto rounded-xl bg-secondary/20 flex items-center justify-center mb-4"
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(139, 92, 246, 0)",
                      "0 0 20px 5px rgba(139, 92, 246, 0.2)",
                      "0 0 0 0 rgba(139, 92, 246, 0)"
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.3
                  }}
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <value.icon className="h-7 w-7 text-secondary" />
                </motion.div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet The Vibers */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Meet The Vibers
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              The passionate people behind VibeLink Events
            </p>
          </motion.div>

          {loadingTeam ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : teamMembers.length === 0 ? (
            <p className="text-center text-muted-foreground">Team information coming soon.</p>
          ) : (
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${teamMembers.length >= 3 ? "lg:grid-cols-3" : ""} ${teamMembers.length >= 4 ? "xl:grid-cols-4" : ""} gap-8 max-w-5xl mx-auto`}>
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group text-center"
                >
                  <div className="relative mb-4 overflow-hidden rounded-2xl">
                    <img
                      src={member.photo_url || "/placeholder.svg"}
                      alt={member.name}
                      className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                      <div className="flex gap-3">
                        {member.social_linkedin && (
                          <a href={member.social_linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                            <Linkedin className="h-4 w-4 text-white" />
                          </a>
                        )}
                        {member.social_twitter && (
                          <a href={member.social_twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                            <Twitter className="h-4 w-4 text-white" />
                          </a>
                        )}
                        {member.social_instagram && (
                          <a href={member.social_instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                            <Instagram className="h-4 w-4 text-white" />
                          </a>
                        )}
                        {member.social_facebook && (
                          <a href={member.social_facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                            <Facebook className="h-4 w-4 text-white" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">{member.name}</h3>
                  <p className="text-muted-foreground text-sm">{member.role}</p>
                  {member.bio && <p className="text-muted-foreground text-xs mt-2 line-clamp-2">{member.bio}</p>}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose VibeLink */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose VibeLink?
            </h2>
            <p className="text-muted-foreground text-lg">
              What makes us different
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {whyChooseFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 rounded-xl bg-secondary/20 flex items-center justify-center mb-5">
                  <feature.icon className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#7C3AED] relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern-dots opacity-10" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Create Something Beautiful?
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Let us help you celebrate your next milestone with a stunning digital invitation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold px-8">
                <Link to="/get-started">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 px-8">
                <Link to="/portfolio">
                  View Our Work
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

    </Layout>
  );
};

export default About;
