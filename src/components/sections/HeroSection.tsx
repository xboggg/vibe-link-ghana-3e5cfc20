import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Users, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import heroWedding from "@/assets/hero-celebration.jpg";
import heroNaming from "@/assets/hero-naming.jpg";
import heroFuneral from "@/assets/hero-funeral.jpg";
import heroGraduation from "@/assets/hero-graduation.jpg";
import heroBirthday from "@/assets/hero-birthday.jpg";
import heroChurch from "@/assets/hero-church.jpg";
import heroCorporate from "@/assets/hero-corporate.jpg";

const slides = [
  {
    image: heroWedding,
    alt: "Ghanaian wedding celebration",
    headline: "Transform Your",
    highlight: "Celebrations",
    subline: "Into Digital Masterpieces",
    description: "Stunning, shareable digital invitations for weddings, funerals, and every Ghanaian ceremony. One beautiful link that does it all.",
  },
  {
    image: heroNaming,
    alt: "Ghanaian naming ceremony",
    headline: "Welcome Your",
    highlight: "Little One",
    subline: "In Style",
    description: "Beautiful digital invitations for naming ceremonies and outdoorings. Share the joy with family near and far.",
  },
  {
    image: heroFuneral,
    alt: "Dignified funeral ceremony",
    headline: "Honor Their",
    highlight: "Legacy",
    subline: "With Dignity",
    description: "Elegant digital funeral programs that celebrate life and connect mourners across the globe.",
  },
  {
    image: heroGraduation,
    alt: "Graduation celebration",
    headline: "Celebrate Your",
    highlight: "Achievement",
    subline: "In Grand Style",
    description: "Share your academic success with stunning digital invitations that capture the joy of graduation.",
  },
  {
    image: heroBirthday,
    alt: "Birthday party celebration",
    headline: "Make Your",
    highlight: "Birthday",
    subline: "Unforgettable",
    description: "Create vibrant digital invitations that set the perfect tone for your birthday celebration.",
  },
  {
    image: heroChurch,
    alt: "Church event",
    headline: "Invite Your",
    highlight: "Congregation",
    subline: "With Grace",
    description: "Elegant digital invitations for church events, services, and special spiritual gatherings.",
  },
  {
    image: heroCorporate,
    alt: "Corporate event",
    headline: "Elevate Your",
    highlight: "Business Events",
    subline: "Professionally",
    description: "Professional digital invitations for conferences, launches, and corporate gatherings.",
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 7000);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused]);

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Images with Crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].alt}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/85 to-purple-dark/70" />
          <div className="absolute inset-0 bg-pattern-dots opacity-20" />
        </motion.div>
      </AnimatePresence>

      {/* Carousel Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/20 transition-all duration-300"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/20 transition-all duration-300"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Content */}
      <div className="relative container mx-auto px-4 lg:px-8 pt-20 lg:pt-24">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              Ghana's #1 Digital Event Experience
            </span>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-primary-foreground leading-tight mb-6">
                {slides[currentSlide].headline}{" "}
                <span className="text-gradient-gold">{slides[currentSlide].highlight}</span>{" "}
                {slides[currentSlide].subline}
              </h1>

              <p className="text-lg md:text-xl text-primary-foreground/80 leading-relaxed mb-8 max-w-2xl">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mb-10"
          >
            <Button asChild variant="hero" size="xl">
              <Link to="/get-started">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="hero-outline" size="xl">
              <Link to="/portfolio">View Portfolio</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center gap-4"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-navy bg-gradient-to-br from-purple to-secondary flex items-center justify-center"
                >
                  <Users className="h-4 w-4 text-primary-foreground" />
                </div>
              ))}
            </div>
            <div className="text-primary-foreground/80 text-sm">
              <span className="text-secondary font-semibold">100+</span>{" "}
              Ghanaian families trust us
            </div>
          </motion.div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-secondary w-8"
                : "bg-primary-foreground/40 hover:bg-primary-foreground/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-secondary"
          />
        </div>
      </motion.div>
    </section>
  );
}
