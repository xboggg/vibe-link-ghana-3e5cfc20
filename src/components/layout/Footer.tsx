import { Link } from "react-router-dom";
import { Sparkles, Instagram, Facebook, Twitter, Phone, Mail, MapPin } from "lucide-react";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
  { name: "Get Started", href: "/get-started" },
];

const socialLinks = [
  { name: "Instagram", icon: Instagram, href: "https://instagram.com/vibelinkghana" },
  { name: "Facebook", icon: Facebook, href: "https://facebook.com/vibelinkghana" },
  { name: "Twitter", icon: Twitter, href: "https://twitter.com/vibelinkghana" },
];

export function Footer() {
  return (
    <footer className="bg-navy text-primary-foreground">
      {/* Main Footer */}
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-secondary" />
              <span className="text-xl font-bold font-poppins">
                Vibe<span className="text-secondary">Link</span>
              </span>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-4">
              Your Event. Our Vibe. Transform your Ghanaian celebrations into stunning, shareable digital invitations.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-secondary mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-primary-foreground/70 hover:text-secondary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-secondary mb-4">
              Event Types
            </h4>
            <ul className="space-y-2">
              <li className="text-primary-foreground/70 text-sm">Weddings</li>
              <li className="text-primary-foreground/70 text-sm">Funerals</li>
              <li className="text-primary-foreground/70 text-sm">Naming Ceremonies</li>
              <li className="text-primary-foreground/70 text-sm">Anniversaries</li>
              <li className="text-primary-foreground/70 text-sm">Graduations</li>
              <li className="text-primary-foreground/70 text-sm">Corporate Events</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-secondary mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-secondary" />
                <a
                  href="https://wa.me/233XXXXXXXXX"
                  className="text-primary-foreground/70 hover:text-secondary transition-colors"
                >
                  +233 XX XXX XXXX
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-secondary" />
                <a
                  href="mailto:hello@vibelinkgh.com"
                  className="text-primary-foreground/70 hover:text-secondary transition-colors"
                >
                  hello@vibelinkgh.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-secondary mt-0.5" />
                <span className="text-primary-foreground/70">
                  Accra, Ghana
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-primary-foreground/60 text-sm text-center md:text-left">
              © {new Date().getFullYear()} VibeLink Ghana. All rights reserved.
            </p>
            <p className="text-primary-foreground/60 text-sm flex items-center gap-1">
              Made with <span className="text-destructive">❤️</span> in Ghana
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
