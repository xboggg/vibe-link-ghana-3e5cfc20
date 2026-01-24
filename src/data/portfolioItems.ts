export interface PortfolioItem {
  id: number;
  title: string;
  type: string;
  description: string;
  image: string;
  demoUrl: string | null;
  slug: string;
  features: string[];
  imagePosition?: string;
}

export const portfolioItems: PortfolioItem[] = [
  {
    id: 1,
    title: "Evans & Mina's Anniversary",
    type: "Anniversaries",
    description: "A beautiful 25th anniversary celebration with elegant gold accents.",
    image: "/anniversary-portfolio.jpg",
    demoUrl: "https://evmin.vibelinkgh.com/",
    slug: "evans-mina-anniversary",
    features: ["Photo gallery", "RSVP tracking", "Music player", "Countdown timer"],
    imagePosition: "top",
  },
  {
    id: 2,
    title: "PRESEC-OSU 70th Anniversary",
    type: "Anniversaries",
    description: "Celebrating 70 years of academic excellence and brotherhood at Presbyterian Secondary School, Osu.",
    image: "/oposa-portfolio.jpg",
    demoUrl: "https://osupresec70.vibelinkgh.com/",
    slug: "presec-osu-70th-anniversary",
    features: ["Event countdown", "Photo gallery", "Alumni registration", "Donation portal"],
  },
  {
    id: 3,
    title: "In Loving Memory of Nana Yaw",
    type: "Funerals",
    description: "A dignified digital tribute celebrating a life well-lived with grace.",
    image: "/nanayaw-portfolio.png",
    demoUrl: "https://nanayaw.vibelinkgh.com/",
    slug: "nana-yaw-memorial",
    features: ["Memorial page", "Tribute wall", "Donation tracking"],
    imagePosition: "top",
  },
  {
    id: 4,
    title: "Baby Adjoa's Naming",
    type: "Naming",
    description: "Celebrating the arrival of a beautiful baby girl with joy and tradition.",
    image: "https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=800&q=80",
    demoUrl: "https://babyadjoa.vibelinkgh.com/",
    slug: "baby-adjoa-naming",
    features: ["Baby gallery", "Gift wishes", "Family tree"],
  },
  {
    id: 5,
    title: "Sarah & John's White Wedding",
    type: "Weddings",
    description: "An elegant church wedding with diaspora guest features and live streaming.",
    image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80",
    demoUrl: "https://sarahjohn.vibelinkgh.com/",
    slug: "sarah-john-wedding",
    features: ["Live stream link", "Multi-language", "RSVP"],
  },
  {
    id: 6,
    title: "Dr. Mensah Graduation",
    type: "Graduations",
    description: "Celebrating a PhD achievement with family and friends worldwide.",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
    demoUrl: "https://drmensah.vibelinkgh.com/",
    slug: "dr-mensah-graduation",
    features: ["Achievement showcase", "Event schedule", "Photo gallery"],
  },
  {
    id: 7,
    title: "Kweku & Efua's Engagement",
    type: "Weddings",
    description: "A stunning traditional engagement ceremony with rich Akan cultural elements.",
    image: "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?auto=format&fit=crop&w=800&q=80",
    demoUrl: "https://kwekuefua.vibelinkgh.com/",
    slug: "kweku-efua-engagement",
    features: ["Ceremony program", "Family introductions", "Photo gallery"],
  },
  {
    id: 8,
    title: "Celebration of Life - Mama Akosua",
    type: "Funerals",
    description: "A touching tribute honoring a beloved grandmother and community pillar.",
    image: "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?auto=format&fit=crop&w=800&q=80",
    demoUrl: "https://mamaakosua.vibelinkgh.com/",
    slug: "mama-akosua-memorial",
    features: ["Obituary", "Service schedule", "MoMo contributions"],
  },
  {
    id: 9,
    title: "Baby Kwame's Outdooring",
    type: "Naming",
    description: "A joyful celebration welcoming baby Kwame to the world.",
    image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=800&q=80",
    demoUrl: "https://babykwame.vibelinkgh.com/",
    slug: "baby-kwame-naming",
    features: ["Countdown", "Photo gallery", "RSVP"],
  },
  {
    id: 10,
    title: "Nana's 60th Birthday",
    type: "Other",
    description: "A lavish surprise birthday celebration for a beloved community elder.",
    image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80",
    demoUrl: "https://nana60.vibelinkgh.com/",
    slug: "nana-60th-birthday",
    features: ["Guest messages", "Photo slideshow", "Event schedule"],
  },
  {
    id: 11,
    title: "NovaStream CyberSecure Conference",
    type: "Other",
    description: "Ghana's premier cybersecurity conference bringing together industry leaders and professionals.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
    demoUrl: "https://novastream.vibelinkgh.com/",
    slug: "novastream-conference",
    features: ["Speaker lineup", "Agenda schedule", "Registration portal"],
  },
  {
    id: 12,
    title: "Pastor Mensah's Retirement",
    type: "Other",
    description: "Celebrating 40 years of dedicated service to the church community.",
    image: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=80",
    demoUrl: "https://pastormensah.vibelinkgh.com/",
    slug: "pastor-mensah-retirement",
    features: ["Tribute messages", "Career timeline", "Event program"],
  },
];

export const categories = ["All", "Weddings", "Funerals", "Naming", "Anniversaries", "Graduations", "Other"];

export const slugToCategoryMap: Record<string, string> = {
  wedding: "Weddings",
  funeral: "Funerals",
  naming: "Naming",
  anniversary: "Anniversaries",
  graduation: "Graduations",
  corporate: "Other",
};
