import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sparkles, Instagram, Facebook, Twitter, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "next-themes";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Blog", href: "/blog" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
  { name: "Contact Us", href: "/contact" },
];

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const socialLinks = [
  { name: "Instagram", icon: Instagram, href: "https://instagram.com/vibelink_ghana" },
  { name: "Facebook", icon: Facebook, href: "https://facebook.com/VibeLink Ghana" },
  { name: "Twitter", icon: Twitter, href: "https://twitter.com/VibeLink_GH" },
  { name: "TikTok", icon: TikTokIcon, href: "https://tiktok.com/@vibelink.ghana" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const isHomePage = location.pathname === "/";

  // Determine navbar background based on scroll, page, and theme
  const getNavbarClasses = () => {
    if (isScrolled || !isHomePage) {
      if (isDark) {
        return "bg-background/95 backdrop-blur-md shadow-lg border-b border-border/50";
      }
      return "bg-[#6B46C1]/95 backdrop-blur-md shadow-lg";
    }
    return "bg-transparent";
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        getNavbarClasses()
      )}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Sparkles className="h-7 w-7 text-secondary transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-secondary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-xl lg:text-2xl font-bold font-poppins text-primary-foreground">
              Vibe<span className="text-secondary">Link</span> <span className="text-primary-foreground/70 font-normal text-sm">Ghana</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium transition-colors rounded-lg",
                  location.pathname === item.href
                    ? "text-secondary"
                    : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Side: Theme Toggle + Socials + CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Social Links */}
            <div className="flex items-center gap-1 border-r border-primary-foreground/20 pr-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-primary-foreground/60 hover:text-secondary transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>

            {/* Track Order Button */}
            <Button asChild variant="outline" size="sm" className="border-secondary/50 text-primary-foreground hover:bg-secondary/20 hover:border-secondary">
              <Link to="/track-order" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Track Order
              </Link>
            </Button>

            {/* CTA Button */}
            <Button asChild variant="nav" size="default">
              <Link to="/get-started">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-primary-foreground hover:text-secondary transition-colors relative w-10 h-10 flex items-center justify-center"
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, rotate: 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ 
              duration: 0.3, 
              ease: [0.4, 0, 0.2, 1],
              opacity: { duration: 0.2 }
            }}
            className={cn(
              "lg:hidden backdrop-blur-md border-t overflow-hidden",
              isDark 
                ? "bg-background/95 border-border/50" 
                : "bg-[#6B46C1]/95 border-primary-foreground/10"
            )}
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="container mx-auto px-4 py-4 space-y-1"
            >
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -30, y: -10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ 
                    delay: index * 0.05,
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                >
                  <Link
                    to={item.href}
                    className={cn(
                      "block px-4 py-3 text-base font-medium rounded-lg transition-all duration-200",
                      location.pathname === item.href
                        ? "text-secondary bg-primary-foreground/10"
                        : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 hover:translate-x-1"
                    )}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              {/* Mobile Social Links + Theme Toggle */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: navItems.length * 0.05, duration: 0.3 }}
                className="flex items-center justify-center gap-4 pt-4"
              >
                <ThemeToggle />
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-primary-foreground/70 hover:text-secondary transition-colors"
                    aria-label={social.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (navItems.length + index) * 0.05 + 0.1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <social.icon className="h-5 w-5" />
                  </motion.a>
                ))}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ 
                  delay: (navItems.length + socialLinks.length) * 0.05 + 0.1,
                  duration: 0.3 
                }}
                className="pt-4 space-y-3"
              >
                <Button asChild variant="outline" size="lg" className="w-full border-secondary/50 hover:bg-secondary/20">
                  <Link to="/track-order" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Track Order
                  </Link>
                </Button>
                <Button asChild variant="gold" size="lg" className="w-full">
                  <Link to="/get-started">Get Started</Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
