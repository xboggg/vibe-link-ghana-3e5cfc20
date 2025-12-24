import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  blurAmount?: number;
  transitionDuration?: number;
  aspectRatio?: string;
  objectFit?: "cover" | "contain" | "fill" | "none";
}

export function OptimizedImage({
  src,
  alt,
  className = "",
  containerClassName = "",
  blurAmount = 20,
  transitionDuration = 0.6,
  aspectRatio,
  objectFit = "cover"
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px", threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isInView && imgRef.current) {
      if (imgRef.current.complete) {
        setIsLoaded(true);
      }
    }
  }, [isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  // Generate a low-quality placeholder color based on image
  const placeholderBg = "bg-muted";

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", containerClassName)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Placeholder with shimmer effect */}
      <motion.div
        className={cn(
          "absolute inset-0",
          placeholderBg
        )}
        initial={{ opacity: 1 }}
        animate={{ opacity: isLoaded ? 0 : 1 }}
        transition={{ duration: transitionDuration }}
      >
        {/* Shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent animate-shimmer" />
        
        {/* Blurred preview using a tiny version or gradient */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-primary/10 via-muted to-secondary/10"
          style={{ filter: `blur(${blurAmount}px)` }}
        />
      </motion.div>

      {/* Main image */}
      {isInView && (
        <motion.img
          ref={imgRef}
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={handleLoad}
          className={cn(
            "w-full h-full transition-all duration-500",
            objectFit === "cover" && "object-cover",
            objectFit === "contain" && "object-contain",
            objectFit === "fill" && "object-fill",
            objectFit === "none" && "object-none",
            className
          )}
          initial={{ 
            opacity: 0, 
            scale: 1.1,
            filter: `blur(${blurAmount}px)`
          }}
          animate={{ 
            opacity: isLoaded ? 1 : 0, 
            scale: isLoaded ? 1 : 1.1,
            filter: isLoaded ? "blur(0px)" : `blur(${blurAmount}px)`
          }}
          transition={{ 
            duration: transitionDuration,
            ease: [0.25, 0.4, 0.25, 1]
          }}
        />
      )}
    </div>
  );
}

// Variant for background images
interface OptimizedBackgroundProps {
  src: string;
  alt?: string;
  className?: string;
  overlayClassName?: string;
  children?: React.ReactNode;
  blurAmount?: number;
}

export function OptimizedBackground({
  src,
  alt = "Background",
  className = "",
  overlayClassName = "",
  children,
  blurAmount = 20
}: OptimizedBackgroundProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px", threshold: 0 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isInView) {
      const img = new Image();
      img.src = src;
      img.onload = () => setIsLoaded(true);
    }
  }, [isInView, src]);

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)}>
      {/* Placeholder */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/20 via-muted to-secondary/20"
        initial={{ opacity: 1 }}
        animate={{ opacity: isLoaded ? 0 : 1 }}
        transition={{ duration: 0.6 }}
        style={{ filter: `blur(${blurAmount}px)` }}
      />

      {/* Background image */}
      {isInView && (
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${src})` }}
          initial={{ 
            opacity: 0,
            scale: 1.1,
            filter: `blur(${blurAmount}px)`
          }}
          animate={{ 
            opacity: isLoaded ? 1 : 0,
            scale: isLoaded ? 1 : 1.1,
            filter: isLoaded ? "blur(0px)" : `blur(${blurAmount}px)`
          }}
          transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
        />
      )}

      {/* Overlay */}
      {overlayClassName && (
        <div className={cn("absolute inset-0", overlayClassName)} />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
