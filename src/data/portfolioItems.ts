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
    title: "A Soldier's Final Salute - Ex-WO1 Deku",
    type: "Funerals",
    description: "A dignified military tribute honoring Ex-WO1 Raphael Yaovi Deku (1944-2025), a dedicated soldier of the Ghana Armed Forces.",
    image: "/wo1deku-portfolio.jpg",
    demoUrl: "https://wo1deku.vibelinkevent.com/",
    slug: "wo1-deku-memorial",
    features: ["Military tribute", "Photo gallery", "Event schedule", "Family tribute wall"],
    imagePosition: "top",
  },
  {
    id: 2,
    title: "Evans & Mina's Anniversary",
    type: "Anniversaries",
    description: "A beautiful 25th anniversary celebration with elegant gold accents.",
    image: "/anniversary-portfolio.jpg",
    demoUrl: "https://evmin.vibelinkevent.com/",
    slug: "evans-mina-anniversary",
    features: ["Photo gallery", "RSVP tracking", "Music player", "Countdown timer"],
    imagePosition: "top",
  },
  {
    id: 3,
    title: "PRESEC-OSU 70th Anniversary",
    type: "Anniversaries",
    description: "Celebrating 70 years of academic excellence and brotherhood at Presbyterian Secondary School, Osu.",
    image: "/oposa-portfolio.jpg",
    demoUrl: "https://osupresec70.vibelinkevent.com/",
    slug: "presec-osu-70th-anniversary",
    features: ["Event countdown", "Photo gallery", "Alumni registration", "Donation portal"],
  },
  {
    id: 4,
    title: "In Loving Memory of Nana Yaw",
    type: "Funerals",
    description: "A dignified digital tribute celebrating a life well-lived with grace.",
    image: "/nanayaw-portfolio.png",
    demoUrl: "https://nanayaw.vibelinkevent.com/",
    slug: "nana-yaw-memorial",
    features: ["Memorial page", "Tribute wall", "Donation tracking"],
    imagePosition: "top",
  },
  {
    id: 5,
    title: "Baby Adjoa's Naming",
    type: "Naming",
    description: "Celebrating the arrival of a beautiful baby girl with joy and tradition.",
    image: "/babyadjoa-portfolio.png",
    demoUrl: "https://babyadjoa.vibelinkevent.com/",
    slug: "baby-adjoa-naming",
    features: ["Baby gallery", "Gift wishes", "Family tree"],
  },
  {
    id: 6,
    title: "Sarah & John's White Wedding",
    type: "Weddings",
    description: "An elegant church wedding with diaspora guest features and live streaming.",
    image: "/sarahjohn-portfolio.png",
    demoUrl: "https://sarahjohn.vibelinkevent.com/",
    slug: "sarah-john-wedding",
    features: ["Live stream link", "Multi-language", "RSVP"],
  },
  {
    id: 7,
    title: "Dr. Mensah Graduation",
    type: "Graduations",
    description: "Celebrating a PhD achievement with family and friends worldwide.",
    image: "/drmensah-portfolio.png",
    demoUrl: "https://drmensah.vibelinkevent.com/",
    slug: "dr-mensah-graduation",
    features: ["Achievement showcase", "Event schedule", "Photo gallery"],
  },
  {
    id: 8,
    title: "Kweku & Efua's Engagement",
    type: "Weddings",
    description: "A stunning traditional engagement ceremony with rich Akan cultural elements.",
    image: "/kwekuefua-portfolio.png",
    demoUrl: "https://kwekuefua.vibelinkevent.com/",
    slug: "kweku-efua-engagement",
    features: ["Ceremony program", "Family introductions", "Photo gallery"],
  },
  {
    id: 9,
    title: "Celebration of Life - Mama Akosua",
    type: "Funerals",
    description: "A touching tribute honoring a beloved grandmother and community pillar.",
    image: "/mamaakosua-portfolio.png",
    demoUrl: "https://mamaakosua.vibelinkevent.com/",
    slug: "mama-akosua-memorial",
    features: ["Obituary", "Service schedule", "MoMo contributions"],
  },
  {
    id: 10,
    title: "Baby Kwame's Outdooring",
    type: "Naming",
    description: "A joyful celebration welcoming baby Kwame to the world.",
    image: "/babykwame-portfolio.png",
    demoUrl: "https://babykwame.vibelinkevent.com/",
    slug: "baby-kwame-naming",
    features: ["Countdown", "Photo gallery", "RSVP"],
  },
  {
    id: 11,
    title: "Nana's 60th Birthday",
    type: "Other",
    description: "A lavish surprise birthday celebration for a beloved community elder.",
    image: "/nana60/vibelink-nana60_5.png",
    demoUrl: "https://nana60.vibelinkevent.com/",
    slug: "nana-60th-birthday",
    features: ["Guest messages", "Photo slideshow", "Event schedule"],
  },
  {
    id: 12,
    title: "NovaStream CyberSecure Conference",
    type: "Other",
    description: "Ghana's premier cybersecurity conference bringing together industry leaders and professionals.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
    demoUrl: "https://novastream.vibelinkevent.com/",
    slug: "novastream-conference",
    features: ["Speaker lineup", "Agenda schedule", "Registration portal"],
  },
  {
    id: 13,
    title: "Pastor Mensah's Retirement",
    type: "Other",
    description: "Celebrating 40 years of dedicated service to the church community.",
    image: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=80",
    demoUrl: "https://pastormensah.vibelinkevent.com/",
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
