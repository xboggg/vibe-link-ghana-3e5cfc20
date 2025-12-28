import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Heart, Globe, Sparkles, Shield, Users, MessageCircle as MessageCircleIcon, Instagram, Facebook, Twitter, Linkedin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import SEO, { createBreadcrumbSchema } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  photo_url: string | null;
  social_facebook: string | null;
  social_twitter: string | null;
  social_instagram: string | null;
  social_linkedin: string | null;
}

const aboutBreadcrumb = createBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "About Us", url: "/about" },
]);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

export const socialLinks = [
  { name: "Instagram", icon: Instagram, href: "https://instagram.com/vibelink_ghana" },
  { name: "Facebook", icon: Facebook, href: "https://facebook.com/VibeLink Ghana" },
  { name: "Twitter", icon: Twitter, href: "https://twitter.com/VibeLink_GH" },
  { name: "TikTok", icon: TikTokIcon, href: "https://tiktok.com/@vibelink.ghana" },
];

const values = [
  {
    icon: Heart,
    title: "Dignity",
    description: "Every ceremony deserves respect. We treat each project with the care it deserves.",
  },
  {
    icon: Globe,
    title: "Culture",
    description: "We celebrate Ghanaian traditions and honor the unique aspects of every celebration.",
  },
  {
    icon: Sparkles,
    title: "Simplicity",
    description: "One link does everything. We believe beautiful design should be effortless to share.",
  },
  {
    icon: Shield,
    title: "Trust",
    description: "Transparent pricing, reliable service. We deliver what we promise, every time.",
  },
];

const stats = [
  { value: 500, suffix: "+", label: "Events Created" },
  { value: 10000, suffix: "+", label: "Guests Reached" },
  { value: 98, suffix: "%", label: "Satisfaction Rate" },
  { value: 48, suffix: "hrs", label: "Fastest Delivery" },
];

// Why Choose VibeLink features
const whyChooseFeatures = [
  {
    icon: MessageCircleIcon,
    title: "WhatsApp-First Support",
    description: "We're always just a message away. Get quick responses and updates via WhatsApp, the way Ghanaians prefer to communicate.",
  },
  {
    icon: Users,
    title: "Ghana-Focused Design",
    description: "Our templates are designed specifically for Ghanaian ceremonies, respecting cultural nuances and traditions.",
  },
  {
    icon: Globe,
    title: "Diaspora-Ready",
    description: "Your invitations work perfectly for guests anywhere in the world, with timezone support and easy sharing.",
  },
];

const About = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("id, name, role, bio, photo_url, social_facebook, social_twitter, social_instagram, social_linkedin")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (!error && data) {
        setTeamMembers(data);
      }
      setLoadingTeam(false);
    };

    fetchTeamMembers();
  }, []);

  return (
    <Layout>
      <SEO 
        title="About Us"
        description="Learn about VibeLink Ghana - Ghana's premier digital invitation service. Our mission is to transform traditional invitations into beautiful digital experiences."
        keywords="VibeLink Ghana, digital invitations company, Ghana event services, about VibeLink"
        canonical="/about"
        jsonLd={aboutBreadcrumb}
      />
      {/* Hero - Purple Gradient */}
      <section className="pt-24 lg:pt-32 pb-16 bg-gradient-to-b from-[#6B46C1] via-[#553C9A] to-[#44337A]">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              About VibeLink Ghana
            </h1>
            <p className="text-white/80 text-lg lg:text-xl">
              Ghana's premier digital invitation service, celebrating life's precious moments
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Our Story
              </h2>
              
              <div className="prose prose-lg text-muted-foreground space-y-4">
                <p>
                  VibeLink Ghana was born from a simple observation: Ghanaians love to
                  celebrate, but the traditional invitation process was stuck in the past. Paper
                  invitations were expensive, hard to distribute, and couldn't reach loved ones
                  abroad.
                </p>
                
                <p>
                  We set out to change that. Our mission is to be the digital front door to every
                  Ghanaian ceremony - from joyful weddings and naming ceremonies to
                  dignified funerals and everything in between.
                </p>
                
                <p>
                  Today, we serve families across Ghana and the diaspora, helping them share
                  their most precious moments with beautiful, interactive digital invitations that
                  honor our traditions while embracing modern convenience.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=600&h=400&fit=crop"
                  alt="Ghana celebration"
                  className="w-full h-auto object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats - Purple Background */}
      <section className="py-16 bg-[#7C3AED]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-1">
                  <AnimatedCounter 
                    end={stat.value} 
                    suffix={stat.suffix} 
                    duration={2000} 
                  />
                </div>
                <div className="text-white/80 text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              What drives us every day
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl bg-card border border-border"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-secondary/20 flex items-center justify-center mb-4">
                  <value.icon className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Team */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Meet Our Team
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              The passionate people behind VibeLink Ghana
            </p>
          </motion.div>

          {loadingTeam ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : teamMembers.length === 0 ? (
            <p className="text-center text-muted-foreground">Team information coming soon.</p>
          ) : (
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${teamMembers.length >= 3 ? 'lg:grid-cols-3' : ''} ${teamMembers.length >= 4 ? 'xl:grid-cols-4' : ''} gap-8 max-w-5xl mx-auto`}>
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group text-center"
                >
                  <div className="relative mb-4 overflow-hidden rounded-2xl">
                    <img
                      src={member.photo_url || "/placeholder.svg"}
                      alt={member.name}
                      className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                      <div className="flex gap-3">
                        {member.social_linkedin && (
                          <a
                            href={member.social_linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                            aria-label={`${member.name} LinkedIn`}
                          >
                            <Linkedin className="h-4 w-4 text-white" />
                          </a>
                        )}
                        {member.social_twitter && (
                          <a
                            href={member.social_twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                            aria-label={`${member.name} Twitter`}
                          >
                            <Twitter className="h-4 w-4 text-white" />
                          </a>
                        )}
                        {member.social_instagram && (
                          <a
                            href={member.social_instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                            aria-label={`${member.name} Instagram`}
                          >
                            <Instagram className="h-4 w-4 text-white" />
                          </a>
                        )}
                        {member.social_facebook && (
                          <a
                            href={member.social_facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                            aria-label={`${member.name} Facebook`}
                          >
                            <Facebook className="h-4 w-4 text-white" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    {member.name}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {member.role}
                  </p>
                  {member.bio && (
                    <p className="text-muted-foreground text-xs mt-2 line-clamp-2">
                      {member.bio}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose VibeLink */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose VibeLink?
            </h2>
            <p className="text-muted-foreground text-lg">
              What makes us different
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {whyChooseFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 rounded-xl bg-secondary/20 flex items-center justify-center mb-5">
                  <feature.icon className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-8 rounded-2xl bg-card border border-border"
            >
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Our Mission
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                We transform traditional event invitations into beautiful,
                interactive digital experiences that honor Ghanaian culture and
                connect families across the world.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-8 rounded-2xl bg-card border border-border"
            >
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5 text-secondary" />
                Our Vision
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                To be Ghana's #1 digital front door to all ceremonies – the
                first choice for every family celebrating life's important
                moments.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section - Purple Background */}
      <section className="py-20 bg-[#7C3AED] relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern-dots opacity-10" />
        
        <div className="container mx-auto px-4 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Create Something Beautiful?
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Let us help you celebrate your next milestone with a stunning digital invitation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold px-8">
                <Link to="/get-started">
                  Get Started
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 px-8">
                <Link to="/portfolio">
                  View Our Work
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

    </Layout>
  );
};

export default About;
