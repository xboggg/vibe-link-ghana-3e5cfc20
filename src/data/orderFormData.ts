import { 
  Heart, 
  Church, 
  GraduationCap, 
  Cake, 
  Baby, 
  Building2, 
  PartyPopper,
  Flower2
} from "lucide-react";

export interface EventType {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export interface Package {
  id: string;
  name: string;
  price: number;
  description: string;
  popular: boolean;
  features: string[];
  heroImages: number;
  hosting: string;
  revisions: string;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  category: "delivery" | "design" | "features" | "language" | "hosting";
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  mood: string;
}

export interface StylePreference {
  id: string;
  name: string;
  description: string;
  image?: string;
}

export const eventTypes: EventType[] = [
  { id: "wedding", name: "Wedding", icon: Heart, description: "Celebrate your love story" },
  { id: "funeral", name: "Funeral", icon: Flower2, description: "Honor a life well-lived" },
  { id: "graduation", name: "Graduation", icon: GraduationCap, description: "Celebrate achievements" },
  { id: "birthday", name: "Birthday", icon: Cake, description: "Make birthdays special" },
  { id: "naming", name: "Naming Ceremony", icon: Baby, description: "Welcome new life" },
  { id: "corporate", name: "Corporate Event", icon: Building2, description: "Professional gatherings" },
  { id: "anniversary", name: "Anniversary", icon: PartyPopper, description: "Milestone celebrations" },
  { id: "church", name: "Church Event", icon: Church, description: "Faith-based gatherings" },
];

export const packages: Package[] = [
  {
    id: "starter",
    name: "Starter Vibe",
    price: 600,
    description: "Best for simple, intimate events",
    popular: false,
    heroImages: 1,
    hosting: "30 days",
    revisions: "1 round",
    features: [
      "1 hero banner image",
      "Pre-designed template",
      "Event details section",
      "Countdown timer",
      "Google Maps integration",
      "WhatsApp share button",
      "Mobile responsive",
      "30-day hosting",
      "1 revision round",
    ],
  },
  {
    id: "classic",
    name: "Classic Vibe",
    price: 1200,
    description: "Best for weddings, funerals, most events",
    popular: true,
    heroImages: 2,
    hosting: "90 days",
    revisions: "2 rounds",
    features: [
      "2 hero banner images",
      "Everything in Starter",
      "Custom color scheme",
      "Photo gallery (5 photos)",
      "RSVP tracking",
      "Background music",
      "White-label",
      "90-day hosting",
      "2 revision rounds",
    ],
  },
  {
    id: "prestige",
    name: "Prestige Vibe",
    price: 2500,
    description: "Best for premium celebrations",
    popular: false,
    heroImages: 3,
    hosting: "6 months",
    revisions: "5 revisions",
    features: [
      "3 hero banner images",
      "Everything in Classic",
      "Photo gallery (10 photos)",
      "Video integration",
      "Calendar sync",
      "MoMo donation link",
      "Priority WhatsApp support",
      "6-month hosting",
      "5 revisions",
    ],
  },
  {
    id: "royal",
    name: "Royal Vibe",
    price: 5000,
    description: "Best for exclusive, luxury events",
    popular: false,
    heroImages: 5,
    hosting: "1 year",
    revisions: "Unlimited",
    features: [
      "5 hero banner images",
      "Everything in Prestige",
      "Multiple event pages",
      "Advanced animations",
      "MoMo tracking dashboard",
      "Program booklet page",
      "Host dashboard",
      "Custom domain",
      "Book a ride",
      "Lost & found",
      "White-label (no branding)",
      "1-year hosting",
      "Unlimited revisions",
      "Dedicated account manager",
      "Professional consultation",
    ],
  },
];

export const addOns: AddOn[] = [
  // Design
  { id: "video-integration", name: "Video Integration", price: 200, priceLabel: "GHS 200", category: "design" },
  { id: "extra-revision", name: "Extra Revision Round", price: 100, priceLabel: "GHS 100", category: "design" },
  { id: "extra-photos", name: "Extra Photos (+10)", price: 100, priceLabel: "GHS 100", category: "design" },
  // Features
  { id: "calendar-sync", name: "Calendar Sync", price: 100, priceLabel: "GHS 100", category: "features" },
  { id: "momo-tracking", name: "MoMo Tracking Dashboard", price: 200, priceLabel: "GHS 200", category: "features" },
  { id: "program-booklet", name: "Program Booklet Page", price: 150, priceLabel: "GHS 150", category: "features" },
  { id: "host-dashboard", name: "Host Dashboard", price: 200, priceLabel: "GHS 200", category: "features" },
  { id: "rsvp", name: "RSVP Tracking", price: 100, priceLabel: "GHS 100", category: "features" },
  { id: "qr-checkin", name: "QR Check-in System", price: 150, priceLabel: "GHS 150", category: "features" },
  { id: "digital-guestbook", name: "Digital Guestbook", price: 150, priceLabel: "GHS 150", category: "features" },
  { id: "gift-acknowledgment", name: "Gift Acknowledgment Page", price: 150, priceLabel: "GHS 150", category: "features" },
  { id: "livestream", name: "Live Stream Embed", price: 200, priceLabel: "GHS 200", category: "features" },
  { id: "thank-you", name: "Post-Event Thank You Page", price: 200, priceLabel: "GHS 200", category: "features" },
  { id: "messaging-wall", name: "Guest Messaging Wall", price: 150, priceLabel: "GHS 150", category: "features" },
  { id: "photo-booth", name: "Photo Booth Frame", price: 100, priceLabel: "GHS 100", category: "features" },
  { id: "timeline", name: "Event Timeline/Program Display", price: 100, priceLabel: "GHS 100", category: "features" },
  { id: "tribute-wall", name: "Memory Tribute Wall (funerals)", price: 200, priceLabel: "GHS 200", category: "features" },
  { id: "bg-music", name: "Background Music", price: 50, priceLabel: "GHS 50", category: "features" },
  { id: "lost-found", name: "Lost & Found", price: 100, priceLabel: "GHS 100", category: "features" },
  { id: "nearby-accommodation", name: "Nearby Accommodation", price: 100, priceLabel: "GHS 100", category: "features" },
  { id: "book-a-ride", name: "Book a Ride", price: 100, priceLabel: "GHS 100", category: "features" },
  // Language
  { id: "extra-language", name: "Additional Language", price: 150, priceLabel: "GHS 150", category: "language" },
  { id: "bilingual-twi", name: "Bilingual (English + Twi)", price: 150, priceLabel: "GHS 150", category: "language" },
  { id: "bilingual-french", name: "Bilingual (English + French)", price: 150, priceLabel: "GHS 150", category: "language" },
  // Hosting
  { id: "hosting-6m", name: "Extended Hosting (6 months)", price: 250, priceLabel: "GHS 250", category: "hosting" },
  { id: "hosting-1y", name: "Extended Hosting (1 year)", price: 600, priceLabel: "GHS 600", category: "hosting" },
  { id: "custom-domain", name: "Custom Domain", price: 300, priceLabel: "GHS 300/yr", category: "hosting" },
  { id: "memorial-renewal", name: "Memorial Page Renewal", price: 100, priceLabel: "GHS 100/yr", category: "hosting" },
];

export const colorPalettes: ColorPalette[] = [
  { id: "elegant-gold", name: "Elegant Gold", colors: ["#D4AF37", "#1a1a2e", "#FFFAF0", "#8B7355"], mood: "Luxurious & Sophisticated" },
  { id: "romantic-blush", name: "Romantic Blush", colors: ["#E8B4B8", "#67595E", "#EED6D3", "#A49393"], mood: "Soft & Romantic" },
  { id: "royal-purple", name: "Royal Purple", colors: ["#6B46C1", "#1a1a2e", "#E9D5FF", "#9F7AEA"], mood: "Regal & Majestic" },
  { id: "natural-green", name: "Natural Green", colors: ["#2D5A27", "#F5F5DC", "#90B77D", "#42855B"], mood: "Organic & Fresh" },
  { id: "ocean-blue", name: "Ocean Blue", colors: ["#1E40AF", "#F0F9FF", "#60A5FA", "#1E3A5F"], mood: "Calm & Serene" },
  { id: "sunset-warm", name: "Sunset Warm", colors: ["#DC2626", "#FEF3C7", "#F59E0B", "#7C2D12"], mood: "Warm & Vibrant" },
  { id: "modern-mono", name: "Modern Mono", colors: ["#18181B", "#FFFFFF", "#71717A", "#F4F4F5"], mood: "Clean & Contemporary" },
  { id: "burgundy-classic", name: "Burgundy Classic", colors: ["#800020", "#F5F5DC", "#D4A373", "#3D0C11"], mood: "Timeless & Elegant" },
  { id: "teal-coral", name: "Teal & Coral", colors: ["#0D9488", "#FECACA", "#F97316", "#134E4A"], mood: "Fresh & Playful" },
  { id: "dusty-rose", name: "Dusty Rose", colors: ["#BE8A7C", "#FFF5F5", "#D4A5A5", "#8B5A5A"], mood: "Vintage & Delicate" },
  { id: "forest-gold", name: "Forest & Gold", colors: ["#14532D", "#FBBF24", "#F0FDF4", "#166534"], mood: "Nature & Luxury" },
  { id: "custom", name: "Custom Colors", colors: ["#6B46C1", "#D4AF37", "#1a1a2e", "#FFFFFF"], mood: "Choose your own" },
];

export const stylePreferences: StylePreference[] = [
  { id: "minimalist", name: "Minimalist", description: "Clean lines, lots of white space, simple elegance" },
  { id: "luxurious", name: "Luxurious", description: "Gold accents, rich textures, opulent details" },
  { id: "romantic", name: "Romantic", description: "Soft florals, flowing scripts, dreamy vibes" },
  { id: "modern", name: "Modern", description: "Bold typography, geometric shapes, contemporary feel" },
  { id: "traditional", name: "Traditional", description: "Classic layouts, timeless patterns, formal elegance" },
  { id: "playful", name: "Playful", description: "Bright colors, fun elements, energetic design" },
  { id: "rustic", name: "Rustic", description: "Natural textures, earthy tones, organic feel" },
  { id: "cultural", name: "Cultural/Afrocentric", description: "Kente patterns, African motifs, heritage-inspired" },
];

export interface OrderFormData {
  // Step 1: Event Type
  eventType: string;

  // Step 2: Event Details
  eventTitle: string;
  eventDate: Date | null;
  eventTime: string;
  eventVenue: string;
  eventAddress: string;
  celebrantNames: string;
  additionalInfo: string;

  // Step 3: Style & Colors
  colorPalette: string;
  customColors: string[];
  stylePreference: string;
  referenceImages: File[];
  designNotes: string;

  // Step 4: Package Selection
  selectedPackage: string;

  // Step 5: Add-ons
  selectedAddOns: string[];

  // Step 6: Timeline
  deliveryUrgency: "standard" | "rush";
  preferredDeliveryDate: Date | null;

  // Step 7: Contact
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
  hearAboutUs: string;

  // Referral
  referralCode: string;
}

export const initialFormData: OrderFormData = {
  eventType: "",
  eventTitle: "",
  eventDate: null,
  eventTime: "",
  eventVenue: "",
  eventAddress: "",
  celebrantNames: "",
  additionalInfo: "",
  colorPalette: "",
  customColors: [],
  stylePreference: "",
  referenceImages: [],
  designNotes: "",
  selectedPackage: "",
  selectedAddOns: [],
  deliveryUrgency: "standard",
  preferredDeliveryDate: null,
  fullName: "",
  email: "",
  phone: "",
  whatsapp: "",
  hearAboutUs: "",
  referralCode: "",
};
