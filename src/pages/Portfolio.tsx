import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CTASection } from "@/components/sections/CTASection";
import { ExternalLink } from "lucide-react";

const categories = ["All", "Weddings", "Funerals", "Naming", "Anniversaries", "Other"];

const portfolioItems = [
  {
    id: 1,
    title: "Evans & Mina's Anniversary",
    type: "Anniversaries",
    description: "A beautiful 25th anniversary celebration with elegant gold accents.",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    demoUrl: "https://evmin-rsvp.netlify.app/",
    slug: "evans-mina-anniversary",
    features: ["Photo gallery", "RSVP tracking", "Music player", "Countdown timer"],
  },
  {
    id: 2,
    title: "Kofi & Ama's Wedding",
    type: "Weddings",
    description: "Traditional Ghanaian wedding with modern digital touches and kente-inspired design.",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
    demoUrl: null,
    slug: "kofi-ama-wedding",
    features: ["Love story timeline", "Gift registry", "MoMo collection"],
  },
  {
    id: 3,
    title: "In Loving Memory of Nana Yaw",
    type: "Funerals",
    description: "A dignified digital tribute celebrating a life well-lived with grace.",
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=80",
    demoUrl: null,
    slug: "nana-yaw-memorial",
    features: ["Memorial page", "Tribute wall", "Donation tracking"],
  },
  {
    id: 4,
    title: "Baby Adjoa's Naming",
    type: "Naming",
    description: "Celebrating the arrival of a beautiful baby girl with joy and tradition.",
    image: "https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=800&q=80",
    demoUrl: null,
    slug: "baby-adjoa-naming",
    features: ["Baby gallery", "Gift wishes", "Family tree"],
  },
  {
    id: 5,
    title: "Sarah & John's White Wedding",
    type: "Weddings",
    description: "An elegant church wedding with diaspora guest features and live streaming.",
    image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80",
    demoUrl: null,
    slug: "sarah-john-wedding",
    features: ["Live stream link", "Multi-language", "RSVP"],
  },
  {
    id: 6,
    title: "Dr. Mensah Graduation",
    type: "Other",
    description: "Celebrating a PhD achievement with family and friends worldwide.",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
    demoUrl: null,
    slug: "dr-mensah-graduation",
    features: ["Achievement showcase", "Event schedule", "Photo gallery"],
  },
  {
    id: 7,
    title: "Kweku & Efua's Engagement",
    type: "Weddings",
    description: "A stunning traditional engagement ceremony with rich Akan cultural elements.",
    image: "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?auto=format&fit=crop&w=800&q=80",
    demoUrl: null,
    slug: "kweku-efua-engagement",
    features: ["Ceremony program", "Family introductions", "Photo gallery"],
  },
  {
    id: 8,
    title: "Celebration of Life - Mama Akosua",
    type: "Funerals",
    description: "A touching tribute honoring a beloved grandmother and community pillar.",
    image: "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?auto=format&fit=crop&w=800&q=80",
    demoUrl: null,
    slug: "mama-akosua-memorial",
    features: ["Obituary", "Service schedule", "MoMo contributions"],
  },
  {
    id: 9,
    title: "Baby Kwame's Outdooring",
    type: "Naming",
    description: "A joyful celebration welcoming baby Kwame to the world.",
    image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=800&q=80",
    demoUrl: null,
    slug: "baby-kwame-naming",
    features: ["Countdown", "Photo gallery", "RSVP"],
  },
  {
    id: 10,
    title: "Nana's 60th Birthday",
    type: "Other",
    description: "A lavish surprise birthday celebration for a beloved community elder.",
    image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80",
    demoUrl: null,
    slug: "nana-60th-birthday",
    features: ["Guest messages", "Photo slideshow", "Event schedule"],
  },
  {
    id: 11,
    title: "The Asante-Boateng Wedding",
    type: "Weddings",
    description: "A grand celebration blending traditional and contemporary wedding styles.",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80",
    demoUrl: null,
    slug: "asante-boateng-wedding",
    features: ["Dual ceremony pages", "Gift registry", "MoMo collection"],
  },
  {
    id: 12,
    title: "Pastor Mensah's Retirement",
    type: "Other",
    description: "Celebrating 40 years of dedicated service to the church community.",
    image: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=80",
    demoUrl: null,
    slug: "pastor-mensah-retirement",
    features: ["Tribute messages", "Career timeline", "Event program"],
  },
];

const Portfolio = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredItems =
    activeCategory === "All"
      ? portfolioItems
      : portfolioItems.filter((item) => item.type === activeCategory);

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-24 lg:pt-32 pb-16 bg-gradient-to-b from-navy to-navy-light">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-4">
              Our Work
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              Our Portfolio
            </h1>
            <p className="text-primary-foreground/80 text-lg lg:text-xl">
              See our digital invitations in action. Real projects for real
              Ghanaian families.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-8 bg-background border-b border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group rounded-2xl bg-card border border-border overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent" />
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                    {item.type}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.features.slice(0, 3).map((feature) => (
                      <span
                        key={feature}
                        className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    {item.demoUrl ? (
                      <a
                        href={item.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="gold" size="sm" className="w-full">
                          View Live Demo
                          <ExternalLink className="ml-2 h-3 w-3" />
                        </Button>
                      </a>
                    ) : (
                      <Button variant="outline" size="sm" className="flex-1" disabled>
                        Demo Coming Soon
                      </Button>
                    )}
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link to={`/portfolio/${item.slug}`}>Details</Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </Layout>
  );
};

export default Portfolio;
