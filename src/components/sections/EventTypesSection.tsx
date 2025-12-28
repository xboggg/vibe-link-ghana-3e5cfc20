import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ParallaxBackground } from "@/components/ParallaxBackground";
import { AnimatedHeading, AnimatedText } from "@/components/AnimatedHeading";
import { useRef } from "react";

const eventTypes = [
  { icon: "💒", title: "Weddings", slug: "wedding" },
  { icon: "⚰️", title: "Funerals", slug: "funeral" },
  { icon: "👶", title: "Naming Ceremonies", slug: "naming" },
  { icon: "💍", title: "Anniversaries", slug: "anniversary" },
  { icon: "🎓", title: "Graduations", slug: "graduation" },
  { icon: "⛪", title: "Church Events", slug: "church" },
  { icon: "🏢", title: "Corporate Events", slug: "corporate" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { 
      duration: 0.5, 
      ease: "easeOut" as const,
    },
  },
};

export function EventTypesSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true, amount: 0.3 });
  const isGridInView = useInView(gridRef, { once: true, amount: 0.2 });

  return (
    <section className="py-20 lg:py-28 bg-muted/50 relative overflow-hidden">
      <ParallaxBackground variant="waves" />
      <div className="container mx-auto px-4 lg:px-8 relative">
        {/* Header */}
        <motion.div 
          ref={headerRef}
          className="text-center mb-12"
          initial={{ opacity: 0, y: 50 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <AnimatedHeading
            as="span"
            variant="fade-up"
            className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 text-secondary-foreground text-sm font-medium mb-4"
          >
            Our Expertise
          </AnimatedHeading>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            <AnimatedText text="For Every" className="justify-center" />
            {" "}
            <AnimatedHeading
              as="span"
              variant="blur"
              delay={0.3}
              className="text-gradient-gold inline-block"
            >
              Ghanaian
            </AnimatedHeading>
            {" "}
            <AnimatedHeading as="span" variant="wave" delay={0.5} className="inline-block">
              Celebration
            </AnimatedHeading>
          </h2>
          <AnimatedHeading
            as="p"
            variant="fade-up"
            delay={0.4}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            From joyful weddings to solemn funerals, we create beautiful digital
            experiences that honor your traditions.
          </AnimatedHeading>
        </motion.div>

        {/* Event Types Grid */}
        <motion.div 
          ref={gridRef}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate={isGridInView ? "visible" : "hidden"}
        >
          {eventTypes.map((event) => (
            <motion.div
              key={event.title}
              variants={itemVariants}
            >
              <Link
                to={`/portfolio?type=${event.slug}`}
                className="group flex flex-col items-center p-6 rounded-2xl bg-card border border-border hover:border-secondary/50 hover:shadow-gold transition-all duration-300"
              >
                <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {event.icon}
                </span>
                <span className="text-sm font-medium text-foreground text-center">
                  {event.title}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
