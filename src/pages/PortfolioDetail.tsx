import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CTASection } from "@/components/sections/CTASection";
import { ArrowLeft, ExternalLink, Check } from "lucide-react";

const portfolioData: Record<string, {
  title: string;
  type: string;
  description: string;
  image: string;
  demoUrl: string | null;
  features: string[];
  story: string;
  package: string;
  highlights: string[];
}> = {
  "evans-mina-anniversary": {
    title: "Evans & Mina's 25th Anniversary",
    type: "Anniversary",
    description: "A beautiful silver jubilee celebration with elegant gold accents and heartfelt memories.",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    demoUrl: "https://evmin-rsvp.netlify.app/",
    features: ["Photo gallery with 50+ images", "RSVP tracking", "Background music", "Countdown timer", "Google Maps integration", "WhatsApp sharing", "Mobile responsive"],
    story: "Evans and Mina wanted to celebrate their 25 years of marriage with family and friends from around the world. We created a stunning digital invitation that showcased their journey together, complete with a photo gallery of their most cherished memories. The invitation was shared on WhatsApp and received over 200 views within the first week.",
    package: "Classic Vibe",
    highlights: ["200+ invitation views", "85 RSVPs received", "Shared across 3 countries"],
  },
  "kofi-ama-wedding": {
    title: "Kofi & Ama's Traditional Wedding",
    type: "Wedding",
    description: "A stunning traditional Ghanaian wedding with kente-inspired design elements.",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
    demoUrl: null,
    features: ["Love story timeline", "Dual ceremony schedule", "Gift registry", "MoMo contribution collection", "Photo gallery", "Family tree display", "Add to calendar"],
    story: "Kofi and Ama came to us wanting something that honored their Ashanti heritage while being accessible to their diaspora family in the UK and USA. We designed a beautiful invitation featuring kente patterns and gold accents, with a love story timeline that touched everyone who saw it. The MoMo collection feature helped them receive contributions seamlessly from guests near and far.",
    package: "Prestige Vibe",
    highlights: ["GHS 15,000+ collected via MoMo", "120 RSVPs", "Featured love story timeline"],
  },
  "nana-yaw-memorial": {
    title: "In Loving Memory of Nana Yaw",
    type: "Funeral",
    description: "A dignified digital tribute celebrating a life well-lived with grace and honor.",
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=80",
    demoUrl: null,
    features: ["Memorial biography", "Tribute wall for messages", "Funeral program schedule", "Donation tracking", "Photo gallery", "Location directions", "WhatsApp sharing"],
    story: "The family of Nana Yaw needed a way to coordinate a large funeral while keeping diaspora family members informed. We created a memorial page that served both as an invitation and a lasting tribute. The donation tracking feature helped the family manage contributions transparently, and the tribute wall became a cherished collection of memories from friends and family.",
    package: "Prestige Vibe",
    highlights: ["GHS 25,000+ donations tracked", "50+ tribute messages", "500+ page views"],
  },
  "baby-adjoa-naming": {
    title: "Baby Adjoa's Naming Ceremony",
    type: "Naming",
    description: "A joyful celebration welcoming a beautiful baby girl to the world.",
    image: "https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=1200&q=80",
    demoUrl: null,
    features: ["Baby photo gallery", "Naming ceremony program", "Gift wishes list", "RSVP tracking", "Countdown timer", "Family tree", "WhatsApp sharing"],
    story: "The proud parents wanted to share their joy with extended family spread across Ghana and abroad. We created a sweet, elegant invitation featuring baby Adjoa's first photos and a countdown to the big day. The gift wishes feature helped guests know exactly what the family needed, making gift-giving more meaningful.",
    package: "Classic Vibe",
    highlights: ["45 RSVPs received", "30+ gift wishes fulfilled", "Shared in 5 family groups"],
  },
  "sarah-john-wedding": {
    title: "Sarah & John's White Wedding",
    type: "Wedding",
    description: "An elegant church wedding designed for an international guest list.",
    image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80",
    demoUrl: null,
    features: ["Live stream link integration", "Multi-language support", "RSVP with dietary preferences", "Wedding party showcase", "Venue directions", "Accommodation suggestions", "Add to calendar"],
    story: "Sarah and John's families were spread across Ghana, the UK, and Canada. They needed an invitation that could serve guests in multiple time zones with live streaming information for those who couldn't attend in person. We delivered a sophisticated design with all the details their international guest list needed.",
    package: "Prestige Vibe",
    highlights: ["150+ live stream viewers", "90 in-person RSVPs", "3 language versions"],
  },
  "dr-mensah-graduation": {
    title: "Dr. Mensah's PhD Graduation",
    type: "Graduation",
    description: "Celebrating an incredible academic achievement with pride and joy.",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
    demoUrl: null,
    features: ["Academic achievement showcase", "Event schedule", "Photo gallery", "RSVP tracking", "Venue directions", "Congratulatory messages wall", "WhatsApp sharing"],
    story: "After years of hard work, Dr. Mensah wanted to celebrate this milestone with everyone who supported his journey. We created an invitation that highlighted his academic journey and made it easy for guests across Ghana to join the celebration. The congratulations wall filled up with heartfelt messages from colleagues, friends, and family.",
    package: "Classic Vibe",
    highlights: ["100+ congratulatory messages", "75 RSVPs", "Featured in family group chat"],
  },
  "kweku-efua-engagement": {
    title: "Kweku & Efua's Engagement",
    type: "Wedding",
    description: "A stunning traditional engagement ceremony rich with Akan cultural heritage.",
    image: "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?auto=format&fit=crop&w=1200&q=80",
    demoUrl: null,
    features: ["Traditional ceremony program", "Family introductions", "Photo gallery", "RSVP tracking", "Event schedule", "Location with directions", "Cultural elements showcase"],
    story: "Kweku and Efua wanted their engagement to honor their Akan traditions while keeping guests informed of all the cultural protocols. We designed an invitation that explained each part of the ceremony and introduced both families beautifully. It became a reference guide that guests appreciated throughout the event.",
    package: "Classic Vibe",
    highlights: ["80 RSVPs", "Both families featured", "Cultural guide included"],
  },
  "mama-akosua-memorial": {
    title: "Celebration of Life - Mama Akosua",
    type: "Funeral",
    description: "A touching tribute honoring a beloved grandmother and community pillar.",
    image: "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?auto=format&fit=crop&w=1200&q=80",
    demoUrl: null,
    features: ["Life biography", "Funeral program", "Tribute messages", "MoMo contribution tracking", "Photo memories", "Service locations", "Family contact cards"],
    story: "Mama Akosua touched countless lives in her 85 years. Her family wanted a memorial that reflected her warmth and impact on the community. We created a tribute page that became a gathering place for memories, with hundreds of visitors leaving messages and the MoMo feature helping manage contributions from well-wishers.",
    package: "Prestige Vibe",
    highlights: ["GHS 35,000+ contributions", "100+ tributes", "800+ page views"],
  },
  "baby-kwame-naming": {
    title: "Baby Kwame's Outdooring",
    type: "Naming",
    description: "A joyful outdooring ceremony celebrating a new blessing.",
    image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=1200&q=80",
    demoUrl: null,
    features: ["Countdown timer", "Baby photo gallery", "Ceremony schedule", "RSVP tracking", "Gift registry", "Venue directions", "WhatsApp sharing"],
    story: "The family wanted to introduce baby Kwame to the world in style. We created a warm, inviting digital invitation that captured the excitement of welcoming a new family member. The countdown timer built anticipation, and the RSVP feature helped the family plan for the perfect celebration.",
    package: "Starter Vibe",
    highlights: ["35 RSVPs", "Countdown engagement", "20+ gifts received"],
  },
  "nana-60th-birthday": {
    title: "Nana's 60th Birthday",
    type: "Birthday",
    description: "A lavish surprise birthday celebration for a beloved community elder.",
    image: "https://images.unsplash.com/photo-1464349095431-e9a21285a5f3?auto=format&fit=crop&w=1200&q=80",
    demoUrl: null,
    features: ["Surprise element messaging", "Guest messages wall", "Photo slideshow", "Event schedule", "Venue directions", "RSVP tracking", "Add to calendar"],
    story: "Nana's children wanted to throw a surprise 60th birthday worthy of their father's impact on the family. We helped coordinate the surprise with discreet messaging and created a page where guests could leave birthday wishes. The photo slideshow at the event featured decades of cherished memories.",
    package: "Classic Vibe",
    highlights: ["Successful surprise!", "60+ guest messages", "Family slideshow created"],
  },
  "asante-boateng-wedding": {
    title: "The Asante-Boateng Wedding",
    type: "Wedding",
    description: "A grand celebration blending traditional and contemporary wedding styles.",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80",
    demoUrl: null,
    features: ["Dual ceremony pages", "Traditional & white wedding schedules", "Gift registry", "MoMo collection", "Wedding party showcase", "Multiple venue directions", "Accommodation guide"],
    story: "The Asante-Boateng wedding was a two-day affair with both traditional and white wedding ceremonies. We created a comprehensive digital invitation that guided guests through both events seamlessly. The MoMo collection feature was particularly useful for managing contributions across both ceremonies.",
    package: "Royal Vibe",
    highlights: ["GHS 50,000+ MoMo collected", "200+ guests", "2-day event coordination"],
  },
  "pastor-mensah-retirement": {
    title: "Pastor Mensah's Retirement",
    type: "Church Event",
    description: "Celebrating 40 years of faithful service to the church community.",
    image: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1200&q=80",
    demoUrl: null,
    features: ["Ministry timeline", "Tribute messages", "Event program", "Photo gallery", "Venue directions", "RSVP tracking", "Appreciation fund collection"],
    story: "After 40 years of dedicated ministry, Pastor Mensah's congregation wanted to honor him properly. We created a tribute page that showcased his journey and allowed church members to leave appreciation messages. The appreciation fund feature helped coordinate the love gift from the congregation.",
    package: "Prestige Vibe",
    highlights: ["GHS 20,000+ appreciation fund", "150+ tribute messages", "40-year timeline featured"],
  },
};

const PortfolioDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const item = slug ? portfolioData[slug] : null;

  if (!item) {
    return (
      <Layout>
        <section className="pt-24 lg:pt-32 pb-16 min-h-[60vh] flex items-center">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Portfolio item not found
            </h1>
            <p className="text-muted-foreground mb-8">
              This case study is coming soon or doesn't exist.
            </p>
            <Button asChild>
              <Link to="/portfolio">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Portfolio
              </Link>
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-24 lg:pt-32 pb-16 bg-gradient-to-b from-navy to-navy-light">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 text-primary-foreground/70 hover:text-secondary transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Portfolio
            </Link>
            
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-4">
              {item.type}
            </span>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
              {item.title}
            </h1>
            
            <p className="text-primary-foreground/80 text-lg max-w-2xl">
              {item.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full rounded-2xl shadow-lg mb-8"
                />
                
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  The Story
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  {item.story}
                </p>

                {item.demoUrl && (
                  <a
                    href={item.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="gold" size="lg">
                      View Live Demo
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="sticky top-24 space-y-6"
              >
                {/* Package Used */}
                <div className="p-6 rounded-2xl bg-secondary/10 border border-secondary/20">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Package Used
                  </h3>
                  <p className="text-xl font-bold text-secondary">
                    {item.package}
                  </p>
                </div>

                {/* Highlights */}
                <div className="p-6 rounded-2xl bg-card border border-border">
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Project Highlights
                  </h3>
                  <ul className="space-y-3">
                    {item.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                        <span className="text-foreground text-sm">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Features */}
                <div className="p-6 rounded-2xl bg-card border border-border">
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Features Used
                  </h3>
                  <ul className="space-y-3">
                    {item.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-accent flex-shrink-0" />
                        <span className="text-foreground text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="p-6 rounded-2xl bg-card border border-border">
                  <p className="text-muted-foreground text-sm mb-4">
                    Want something similar for your event?
                  </p>
                  <Button asChild variant="gold" className="w-full">
                    <Link to="/get-started">Create Yours</Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </Layout>
  );
};

export default PortfolioDetail;
