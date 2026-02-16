import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Instagram, Facebook, Twitter, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "next-themes";

const navItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Blog", href: "/blog" },
  { name: "Pricing", href: "/pricing" },
  { name: "Contact Us", href: "/contact" },
];
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const socialLinks = [
  { name: "Instagram", icon: Instagram, href: "https://instagram.com/vibelink_ghana" },
  { name: "Facebook", icon: Facebook, href: "https://facebook.com/VibeLink Events" },
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
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => setIsOpen(false), [location]);

  const isHomePage = location.pathname === "/";
  const getNavbarClasses = () => {
    if (isScrolled || !isHomePage) {
      return isDark ? "bg-background/95 backdrop-blur-md shadow-lg border-b border-border/50" : "bg-[#6B46C1]/95 backdrop-blur-md shadow-lg";
    }
    return "bg-transparent";
  };

  return (
    <nav className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300", getNavbarClasses())}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center group shrink-0">
            <img src="/vibelink-logo.png" alt="VibeLink Event" className="h-20 lg:h-24 object-contain transition-transform duration-300 group-hover:scale-105" />
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.name} to={item.href} className={cn("px-3 py-2 text-sm font-medium transition-colors rounded-lg", location.pathname === item.href ? "text-secondary" : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10")}>
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-1 border-r border-primary-foreground/20 pr-4">
              {socialLinks.map((social) => (
                <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" className="p-1.5 text-primary-foreground/60 hover:text-secondary transition-colors" aria-label={social.name}>
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <Button asChild variant="outline" size="sm" className="border-secondary/50 text-primary-foreground hover:bg-secondary/20 hover:border-secondary">
              <Link to="/track-order" className="flex items-center gap-2"><Package className="h-4 w-4" />Track Order</Link>
            </Button>
            <Button asChild variant="nav" size="default">
              <Link to="/get-started">Get Started</Link>
            </Button>
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 text-primary-foreground hover:text-secondary transition-colors w-10 h-10 flex items-center justify-center" aria-label="Toggle menu">
            <AnimatePresence mode="wait">
              {isOpen ? <motion.div key="close" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><X className="h-6 w-6" /></motion.div> : <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Menu className="h-6 w-6" /></motion.div>}
            </AnimatePresence>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className={cn("lg:hidden backdrop-blur-md border-t overflow-hidden", isDark ? "bg-background/95 border-border/50" : "bg-[#6B46C1]/95 border-primary-foreground/10")}>
            <div className="container mx-auto px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <Link key={item.name} to={item.href} className={cn("block px-4 py-3 text-base font-medium rounded-lg", location.pathname === item.href ? "text-secondary bg-primary-foreground/10" : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10")}>
                  {item.name}
                </Link>
              ))}
              <div className="flex items-center justify-center gap-4 pt-4">
                <ThemeToggle />
                {socialLinks.map((social) => (
                  <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" className="p-2 text-primary-foreground/70 hover:text-secondary transition-colors" aria-label={social.name}>
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
              <div className="pt-4 space-y-3">
                <Button asChild variant="outline" size="lg" className="w-full border-secondary/50 text-primary-foreground hover:bg-secondary/20">
                  <Link to="/track-order" className="flex items-center gap-2"><Package className="h-4 w-4" />Track Order</Link>
                </Button>
                <Button asChild variant="gold" size="lg" className="w-full">
                  <Link to="/get-started">Get Started</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
