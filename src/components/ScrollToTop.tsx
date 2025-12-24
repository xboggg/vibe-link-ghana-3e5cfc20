import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";

interface ScrollToTopProps {
  threshold?: number;
}

export const ScrollToTop = ({ threshold = 300 }: ScrollToTopProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      
      setScrollProgress(progress);
      setIsVisible(scrollTop > threshold);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20 
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-40 group"
          aria-label="Scroll to top"
        >
          {/* Progress ring */}
          <svg
            className="w-14 h-14 -rotate-90"
            viewBox="0 0 56 56"
          >
            {/* Background circle */}
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="none"
              className="stroke-muted/30"
              strokeWidth="3"
            />
            {/* Progress circle */}
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="none"
              className="stroke-primary transition-all duration-300"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 24}`}
              strokeDashoffset={`${2 * Math.PI * 24 * (1 - scrollProgress / 100)}`}
            />
          </svg>
          
          {/* Center button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center group-hover:shadow-xl group-hover:shadow-primary/40 transition-all duration-300">
              <motion.div
                animate={{ y: [0, -2, 0] }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5,
                  ease: "easeInOut"
                }}
              >
                <ChevronUp className="h-5 w-5 text-primary-foreground" />
              </motion.div>
            </div>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};
