import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { ParallaxBackground } from "@/components/ParallaxBackground";
import { AnimatedHeading, AnimatedText } from "@/components/AnimatedHeading";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import testimonialWedding from "@/assets/testimonial-wedding.jpg";
import testimonialFamily from "@/assets/testimonial-family.jpg";
import testimonialNaming from "@/assets/testimonial-naming.jpg";

interface Testimonial {
  id: string;
  name: string;
  event_type: string;
  quote: string;
  rating: number;
  image_url: string | null;
}

// Default images for different event types
const defaultImages: Record<string, string> = {
  "Wedding": testimonialWedding,
  "Funeral": testimonialFamily,
  "Naming Ceremony": testimonialNaming,
};

// Fallback testimonials when database is empty or loading
const fallbackTestimonials: Testimonial[] = [
  {
    id: "1",
    quote: "VibeLink transformed our wedding invitation into something our guests couldn't stop talking about. The MoMo collection feature was a game-changer!",
    name: "Akosua & Kwame",
    event_type: "Wedding",
    rating: 5,
    image_url: null,
  },
  {
    id: "2",
    quote: "During a difficult time, VibeLink helped us create a beautiful tribute for our late father. The whole family, even those abroad, could access everything easily.",
    name: "The Mensah Family",
    event_type: "Funeral",
    rating: 5,
    image_url: null,
  },
  {
    id: "3",
    quote: "Our baby's naming ceremony invitation was absolutely stunning. Everyone asked where we got it from. Professional, fast, and worth every pesewa!",
    name: "Efua & David",
    event_type: "Naming Ceremony",
    rating: 5,
    image_url: null,
  },
];

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await supabase
          .from("testimonials")
          .select("id, name, event_type, quote, rating, image_url")
          .eq("featured", true)
          .order("display_order", { ascending: true })
          .limit(3);

        if (error) throw error;
        if (data && data.length > 0) {
          setTestimonials(data);
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        // Keep fallback testimonials on error
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const getTestimonialImage = (testimonial: Testimonial) => {
    if (testimonial.image_url) {
      return testimonial.image_url;
    }
    return defaultImages[testimonial.event_type] || testimonialWedding;
  };

  return (
    <section className="py-20 lg:py-28 bg-muted/50 relative overflow-hidden">
      <ParallaxBackground variant="dots" />
      <div className="container mx-auto px-4 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-12">
          <AnimatedHeading
            as="span"
            variant="fade-up"
            className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 text-secondary-foreground text-sm font-medium mb-4"
          >
            Testimonials
          </AnimatedHeading>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            <AnimatedText text="What Our" className="justify-center" />
            {" "}
            <AnimatedHeading
              as="span"
              variant="blur"
              delay={0.3}
              className="text-gradient-gold inline-block"
            >
              Clients
            </AnimatedHeading>
            {" "}
            <AnimatedHeading as="span" variant="wave" delay={0.5} className="inline-block">
              Say
            </AnimatedHeading>
          </h2>
          <AnimatedHeading
            as="p"
            variant="fade-up"
            delay={0.4}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Real stories from real Ghanaian families who trusted us with their
            special moments.
          </AnimatedHeading>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative p-6 lg:p-8 rounded-2xl bg-card border border-border hover:border-secondary/30 hover:shadow-lg transition-all duration-300"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-6 right-6 h-8 w-8 text-secondary/20" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-secondary text-secondary"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground/80 leading-relaxed mb-6 italic">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={getTestimonialImage(testimonial)}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-secondary/30"
                />
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    {testimonial.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {testimonial.event_type}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
