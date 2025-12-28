import { motion, useInView, Variants } from "framer-motion";
import { useRef, ReactNode } from "react";

type AnimationDirection = "up" | "down" | "left" | "right" | "fade" | "scale";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: AnimationDirection;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  amount?: number;
}

const getVariants = (direction: AnimationDirection): Variants => {
  const hidden: { opacity: number; x?: number; y?: number; scale?: number } = { opacity: 0 };
  const visible: { opacity: number; x?: number; y?: number; scale?: number } = { opacity: 1 };

  switch (direction) {
    case "up":
      hidden.y = 60;
      visible.y = 0;
      break;
    case "down":
      hidden.y = -60;
      visible.y = 0;
      break;
    case "left":
      hidden.x = 60;
      visible.x = 0;
      break;
    case "right":
      hidden.x = -60;
      visible.x = 0;
      break;
    case "scale":
      hidden.scale = 0.85;
      visible.scale = 1;
      break;
    case "fade":
    default:
      break;
  }

  return { hidden, visible };
};

export const ScrollReveal = ({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  className = "",
  once = true,
  amount = 0.2,
}: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount });
  const variants = getVariants(direction);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Staggered children animation wrapper
interface StaggerRevealProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  once?: boolean;
  amount?: number;
}

export const StaggerReveal = ({
  children,
  className = "",
  staggerDelay = 0.1,
  once = true,
  amount = 0.2,
}: StaggerRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Individual stagger item
export const StaggerItem = ({
  children,
  className = "",
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  direction?: AnimationDirection;
}) => {
  const variants = getVariants(direction);

  return (
    <motion.div
      variants={variants}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
