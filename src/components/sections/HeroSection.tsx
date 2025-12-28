import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import heroWedding from "@/assets/hero-celebration.jpg";
import heroNaming from "@/assets/hero-naming.jpg";
import heroFuneral from "@/assets/hero-funeral.jpg";
import heroGraduation from "@/assets/hero-graduation.jpg";
import heroBirthday from "@/assets/hero-birthday.jpg";
import heroChurch from "@/assets/hero-church.jpg";
import heroCorporate from "@/assets/hero-corporate.jpg";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";
import avatar4 from "@/assets/avatar-4.jpg";

const avatarImages = [avatar1, avatar2, avatar3, avatar4];

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

// Preload images for smoother transitions
const preloadImages = () => {
  slides.forEach((slide) => {
    const img = new Image();
    img.src = slide.image;
  });
};

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [previousSlide, setPreviousSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(new Array(slides.length).fill(false));

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      setPreviousSlide(prev);
      return (prev + 1) % slides.length;
    });
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      setPreviousSlide(prev);
      return (prev - 1 + slides.length) % slides.length;
    });
  }, []);

  useEffect(() => {
    preloadImages();
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 7000);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused]);

  const handleImageLoad = (index: number) => {
    setImagesLoaded((prev) => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Images with Crossfade - only show current and previous */}
      <div className="absolute inset-0 bg-navy">
        {/* Previous slide (bottom layer) */}
        <div className="absolute inset-0" style={{ zIndex: 1 }}>
          <img
            src={slides[previousSlide].image}
            alt={slides[previousSlide].alt}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/85 to-purple-dark/70" />
          <div className="absolute inset-0 bg-pattern-dots opacity-20" />
        </div>
        
        {/* Current slide (top layer with fade-in) */}
        <div 
          key={currentSlide}
          className="absolute inset-0 hero-slide-fade"
          style={{ zIndex: 2 }}
        >
          <img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].alt}
            className="w-full h-full object-cover"
            onLoad={() => handleImageLoad(currentSlide)}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/85 to-purple-dark/70" />
          <div className="absolute inset-0 bg-pattern-dots opacity-20" />
        </div>
      </div>

      {/* Decorative Diagonal Lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Diagonal lines pattern */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="absolute inset-0"
        >
          {/* Top-right diagonal lines */}
          <div className="absolute top-0 right-0 w-1/2 h-full">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <line x1="20" y1="0" x2="100" y2="80" stroke="hsl(var(--secondary))" strokeWidth="0.15" strokeOpacity="0.3" />
              <line x1="40" y1="0" x2="100" y2="60" stroke="hsl(var(--secondary))" strokeWidth="0.1" strokeOpacity="0.2" />
              <line x1="60" y1="0" x2="100" y2="40" stroke="hsl(var(--secondary))" strokeWidth="0.15" strokeOpacity="0.25" />
              <line x1="80" y1="0" x2="100" y2="20" stroke="hsl(var(--secondary))" strokeWidth="0.1" strokeOpacity="0.15" />
            </svg>
          </div>
          
          {/* Bottom-left wave pattern */}
          <div className="absolute bottom-0 left-0 w-full h-32">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 120">
              <motion.path
                d="M0,60 C150,20 350,100 600,60 C850,20 1050,100 1200,60 L1200,120 L0,120 Z"
                fill="none"
                stroke="hsl(var(--secondary))"
                strokeWidth="1"
                strokeOpacity="0.2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 1, duration: 2, ease: "easeInOut" }}
              />
              <motion.path
                d="M0,80 C200,40 400,120 600,80 C800,40 1000,120 1200,80 L1200,120 L0,120 Z"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="0.5"
                strokeOpacity="0.15"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 1.3, duration: 2, ease: "easeInOut" }}
              />
            </svg>
          </div>
        </motion.div>

        {/* Animated floating diagonal accent */}
        <motion.div
          className="absolute top-1/4 right-10 w-px h-32 bg-gradient-to-b from-transparent via-secondary/40 to-transparent"
          animate={{ 
            y: [0, 20, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ transform: "rotate(45deg)" }}
        />
        <motion.div
          className="absolute top-1/3 right-24 w-px h-24 bg-gradient-to-b from-transparent via-primary/30 to-transparent"
          animate={{ 
            y: [0, -15, 0],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
          style={{ transform: "rotate(45deg)" }}
        />
        
        {/* Corner accent lines */}
        <div className="absolute top-20 right-20 w-20 h-20 border-t border-r border-secondary/20 rounded-tr-lg" />
        <div className="absolute bottom-32 left-10 w-16 h-16 border-b border-l border-primary/15 rounded-bl-lg" />
      </div>

      {/* Carousel Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 lg:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/20 transition-all duration-300"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 lg:h-6 lg:w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 lg:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/20 transition-all duration-300"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 lg:h-6 lg:w-6" />
      </button>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 pt-20 lg:pt-24">
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
              {avatarImages.map((avatar, i) => (
                <img
                  key={i}
                  src={avatar}
                  alt={`Happy customer ${i + 1}`}
                  className="w-10 h-10 rounded-full border-2 border-navy object-cover"
                />
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
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setPreviousSlide(currentSlide);
              setCurrentSlide(index);
            }}
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
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
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
