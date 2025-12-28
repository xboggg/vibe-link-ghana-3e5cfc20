import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRef, useState, useEffect, useMemo } from "react";
import { AnimatedHeading, AnimatedText } from "@/components/AnimatedHeading";

// Confetti particle component
const ConfettiParticle = ({ 
  delay, 
  startX, 
  startY, 
  color,
  size,
  rotation,
  duration
}: { 
  delay: number; 
  startX: number; 
  startY: number; 
  color: string;
  size: number;
  rotation: number;
  duration: number;
}) => {
  const endX = startX + (Math.random() - 0.5) * 400;
  const endY = startY + 300 + Math.random() * 200;
  
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: startX,
        top: startY,
        width: size,
        height: size * (Math.random() > 0.5 ? 1 : 2.5),
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? "50%" : "2px",
      }}
      initial={{ 
        opacity: 0, 
        scale: 0,
        rotate: 0,
        x: 0,
        y: 0
      }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1, 0.5],
        rotate: rotation,
        x: endX - startX,
        y: endY - startY
      }}
      transition={{
        duration: duration,
        delay: delay,
        ease: [0.25, 0.46, 0.45, 0.94],
        times: [0, 0.1, 0.8, 1]
      }}
    />
  );
};

// Confetti burst component
const ConfettiBurst = ({ trigger }: { trigger: boolean }) => {
  const colors = [
    "#FFD700", // Gold
    "#FF6B6B", // Coral
    "#4ECDC4", // Teal
    "#A855F7", // Purple
    "#F59E0B", // Amber
    "#EC4899", // Pink
    "#10B981", // Emerald
    "#3B82F6", // Blue
  ];

  // Generate particles only once using useMemo
  const particles = useMemo(() => {
    return [...Array(60)].map((_, i) => ({
      id: i,
      delay: Math.random() * 0.5,
      startX: 50 + Math.random() * (typeof window !== 'undefined' ? window.innerWidth * 0.8 : 800),
      startY: -20,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 8,
      rotation: (Math.random() - 0.5) * 720,
      duration: 2 + Math.random() * 1.5,
    }));
  }, []);

  if (!trigger) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
      {particles.map((particle) => (
        <ConfettiParticle
          key={particle.id}
          delay={particle.delay}
          startX={particle.startX}
          startY={particle.startY}
          color={particle.color}
          size={particle.size}
          rotation={particle.rotation}
          duration={particle.duration}
        />
      ))}
    </div>
  );
};

export function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [showConfetti, setShowConfetti] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 40]);

  // Trigger confetti when section comes into view
  useEffect(() => {
    if (isInView && !showConfetti) {
      setShowConfetti(true);
    }
  }, [isInView, showConfetti]);

  return (
    <section ref={ref} className="py-20 lg:py-28 bg-[#7C3AED] relative overflow-hidden">
      {/* Confetti Effect */}
      <ConfettiBurst trigger={showConfetti} />
      
      {/* Background Effects with Parallax */}
      <div className="absolute inset-0 bg-pattern-dots opacity-10" />
      <motion.div style={{ y: y1 }} className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      <motion.div style={{ y: y2 }} className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      
      {/* Parallax decorative elements */}
      <motion.div 
        style={{ y: y1 }} 
        className="absolute top-20 right-[10%] w-20 h-20 border border-white/10 rounded-lg rotate-12"
      />
      <motion.div 
        style={{ y: y2 }} 
        className="absolute bottom-20 left-[8%] w-16 h-16 border border-white/10 rounded-full"
      />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Celebration emoji burst */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
            className="mb-6"
          >
            <motion.span
              className="inline-block text-5xl"
              animate={isInView ? { 
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.2, 1]
              } : {}}
              transition={{ 
                duration: 0.8, 
                delay: 0.5,
                times: [0, 0.25, 0.5, 0.75, 1]
              }}
            >
              🎉
            </motion.span>
          </motion.div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            <AnimatedText text="Ready to Create Something" className="justify-center text-white" />
            {" "}
            <AnimatedHeading
              as="span"
              variant="blur"
              delay={0.4}
              className="text-secondary inline-block"
            >
              Beautiful?
            </AnimatedHeading>
          </h2>

          <AnimatedHeading
            as="p"
            variant="fade-up"
            delay={0.3}
            className="text-white/80 text-lg mb-8 max-w-2xl mx-auto"
          >
            Let us help you celebrate your next milestone with a stunning digital invitation.
          </AnimatedHeading>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                asChild 
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold px-8"
              >
                <Link to="/get-started">
                  Get Started
                  <motion.span
                    className="ml-2"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.span>
                </Link>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                asChild 
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 px-8"
              >
                <Link to="/portfolio">
                  View Our Work
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
