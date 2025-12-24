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
}> = {
  "evans-mina-anniversary": {
    title: "Evans & Mina's 25th Anniversary",
    type: "Anniversary",
    description: "A beautiful silver jubilee celebration with elegant gold accents and heartfelt memories.",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    demoUrl: "https://evmin-rsvp.netlify.app/",
    features: ["Photo gallery with 50+ images", "RSVP tracking", "Background music", "Countdown timer", "Google Maps integration", "WhatsApp sharing", "Mobile responsive"],
    story: "Evans and Mina wanted to celebrate their 25 years of marriage with family and friends from around the world. We created a stunning digital invitation that showcased their journey together, complete with a photo gallery of their most cherished memories. The invitation was shared on WhatsApp and received over 200 views within the first week.",
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
                className="sticky top-24 p-6 rounded-2xl bg-card border border-border"
              >
                <h3 className="text-lg font-bold text-foreground mb-4">
                  Features Used
                </h3>
                <ul className="space-y-3 mb-6">
                  {item.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-accent flex-shrink-0" />
                      <span className="text-foreground text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-6 border-t border-border">
                  <p className="text-muted-foreground text-sm mb-4">
                    Want something similar for your event?
                  </p>
                  <Button asChild variant="default" className="w-full">
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
