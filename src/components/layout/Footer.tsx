import { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Phone, Mail, MapPin, Send, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
const quickLinks = [{
  name: "Home",
  href: "/"
}, {
  name: "About Us",
  href: "/about"
}, {
  name: "Services",
  href: "/services"
}, {
  name: "Portfolio",
  href: "/portfolio"
}, {
  name: "Blog",
  href: "/blog"
}, {
  name: "Pricing",
  href: "/pricing"
}];
const policyLinks = [{
  name: "Privacy",
  href: "/privacy-policy"
}, {
  name: "Terms",
  href: "/terms-of-service"
}, {
  name: "Refunds",
  href: "/refund-policy"
}, {
  name: "Cookies",
  href: "/cookie-policy"
}];
const eventTypes = [{
  name: "Weddings",
  href: "/services#wedding"
}, {
  name: "Funerals",
  href: "/services#funeral"
}, {
  name: "Naming Ceremonies",
  href: "/services#naming"
}, {
  name: "Anniversaries",
  href: "/services#anniversary"
}, {
  name: "Graduations",
  href: "/services#graduation"
}, {
  name: "Corporate Events",
  href: "/services#corporate"
}];
const socialLinks = [{
  name: "Instagram",
  icon: Instagram,
  href: "https://instagram.com/vibelink_ghana"
}, {
  name: "Facebook",
  icon: Facebook,
  href: "https://facebook.com/VibeLink Event"
}, {
  name: "Twitter",
  icon: Twitter,
  href: "https://twitter.com/VibeLink_GH"
}, {
  name: "TikTok",
  icon: () => <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>,
  href: "https://tiktok.com/@vibelink.ghana"
}];
export function Footer() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setIsSubmitting(true);
    try {
      // Generate a preferences token
      const preferencesToken = crypto.randomUUID();
      const {
        error
      } = await supabase.from('newsletter_subscribers').insert({
        email: email.trim().toLowerCase(),
        preferences_token: preferencesToken
      });
      if (error) {
        if (error.code === '23505') {
          toast.info("You're already subscribed!");
        } else {
          throw error;
        }
      } else {
        // Send welcome email
        try {
          await supabase.functions.invoke('send-welcome-email', {
            body: {
              email: email.trim().toLowerCase(),
              preferencesToken
            }
          });
        } catch (emailError) {
          console.error("Failed to send welcome email:", emailError);
          // Don't fail the subscription if welcome email fails
        }
        toast.success("Successfully subscribed to our newsletter!");
        setEmail("");
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return <footer className="bg-navy text-primary-foreground">
      {/* Main Footer */}
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1 text-center md:text-left">
            <Link to="/" className="flex items-center justify-center md:justify-start mb-4">
              <img src="/vibelink-logo.png" alt="VibeLink Event" className="h-20 object-contain" />
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-4">
              Your Event. Our Vibe. Transform your Ghanaian events into stunning, shareable digital invitations.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-3">
              {socialLinks.map(social => <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-secondary hover:text-secondary-foreground transition-all duration-300" aria-label={social.name}>
                  <social.icon className="h-4 w-4" />
                </a>)}
            </div>
            {/* Newsletter Form - directly under social icons */}
            <form onSubmit={handleNewsletterSubmit} className="flex justify-center md:justify-start gap-2 mt-4">
              <Input type="email" placeholder="Enter email for Newsletter" value={email} onChange={e => setEmail(e.target.value)} className="h-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 text-sm min-w-[160px]" disabled={isSubmitting} />
              <Button type="submit" size="sm" disabled={isSubmitting} className="h-10 bg-secondary/20 hover:bg-secondary text-secondary hover:text-secondary-foreground border-0">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>

          {/* Quick Links */}
          <div className="mx-0 text-center md:text-left md:ml-4 lg:ml-8">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-secondary mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map(link => <li key={link.name}>
                  <Link to={link.href} className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>)}
            </ul>
          </div>

          {/* Event Types - Clickable */}
          <div className="mx-0 text-center md:text-left md:ml-4 lg:ml-8">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-secondary mb-4">
              Event Types
            </h4>
            <ul className="space-y-2">
              {eventTypes.map(event => <li key={event.name}>
                  <Link to={event.href} className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm">
                    {event.name}
                  </Link>
                </li>)}
            </ul>
          </div>

          {/* Contact */}
          <div className="text-center md:text-left md:ml-4 lg:ml-8">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-secondary mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center justify-center md:justify-start gap-3 text-sm">
                <Phone className="h-4 w-4 text-secondary" />
                <a href="tel:+233245817973" className="text-primary-foreground/70 hover:text-secondary transition-colors">
                  +233 24 581 7973
                </a>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-3 text-sm">
                <Phone className="h-4 w-4 text-secondary" />
                <a href="tel:+233244147594" className="text-primary-foreground/70 hover:text-secondary transition-colors">
                  +233 24 414 7594
                </a>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-3 text-sm">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-secondary">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <a href="https://wa.me/4915757178561" className="text-primary-foreground/70 hover:text-secondary transition-colors">
                  +49 157 5717 8561
                </a>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-3 text-sm">
                <Mail className="h-4 w-4 text-secondary" />
                <a href="mailto:info@vibelinkevent.com" className="text-primary-foreground/70 hover:text-secondary transition-colors">
                  info@vibelinkevent.com
                </a>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-secondary" />
                <span className="text-primary-foreground/70">
                  Accra, Ghana
                </span>
              </li>
            </ul>
            {/* My Orders Button */}
            <div className="mt-5 flex justify-center md:justify-start">
              <Button asChild size="sm" className="bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-secondary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 px-6">
                <Link to="/my-orders" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  My Orders
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            {/* Left - Designed by NovaStream */}
            <div className="text-sm">
              <a href="https://www.novastreamdigital.com" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-secondary/80 transition-colors">
                Designed by NovaStream
              </a>
            </div>

            {/* Center - Copyright */}
            <div className="text-primary-foreground/60 text-sm">
              © {new Date().getFullYear()} VibeLink Event
            </div>

            {/* Right - Policy links */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 text-primary-foreground/60 text-sm">
              {policyLinks.map((link, index) => <span key={link.name} className="flex items-center gap-2">
                  <Link to={link.href} className="hover:text-secondary transition-colors">
                    {link.name}
                  </Link>
                  {index < policyLinks.length - 1 && <span>|</span>}
                </span>)}
            </div>
          </div>
        </div>
      </div>
    </footer>;
}