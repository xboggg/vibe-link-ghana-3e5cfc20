import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { MessageCircle as MessageCircleIcon, Send, Mail, MapPin, Phone, Clock, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How long does it take to create my digital invitation?",
    answer: "Most invitations are ready within 24-48 hours after you provide all the necessary details. For urgent requests, we offer expedited service that can deliver within 12 hours.",
  },
  {
    question: "Can I make changes after my invitation is created?",
    answer: "Yes! We offer unlimited revisions during the design phase. Once your invitation is live, you can request up to 3 minor changes at no extra cost.",
  },
  {
    question: "How do guests access my digital invitation?",
    answer: "Your invitation comes with a unique link that you can share via WhatsApp, SMS, email, or social media. Guests simply click the link to view all event details on any device.",
  },
  {
    question: "Do you offer invitations for diaspora families?",
    answer: "Absolutely! Our invitations are designed with diaspora families in mind. They include timezone conversions, international sharing options, and work perfectly on any device worldwide.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept Mobile Money (MTN, Vodafone, AirtelTigo), bank transfers, and international payments via card for our diaspora clients.",
  },
  {
    question: "Can I collect contributions through the invitation?",
    answer: "Yes! We can integrate Mobile Money collection directly into your invitation, making it easy for guests to contribute and for you to track all donations transparently.",
  },
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    eventType: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = "Please enter your name (at least 2 characters)";
    }
    if (formData.name.length > 100) {
      newErrors.name = "Name must be less than 100 characters";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      newErrors.message = "Please enter a message (at least 10 characters)";
    }
    if (formData.message.length > 1000) {
      newErrors.message = "Message must be less than 1000 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Please fix the errors",
        description: "Check the form fields and try again.",
        variant: "destructive",
      });
      return;
    }

    const message = `Hi VibeLink! 👋

*Name:* ${formData.name.trim()}
${formData.email ? `*Email:* ${formData.email.trim()}` : ""}
${formData.eventType ? `*Event Type:* ${formData.eventType.trim()}` : ""}

*Message:*
${formData.message.trim()}`;

    const whatsappUrl = `https://wa.me/233245817973?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    
    toast({
      title: "Opening WhatsApp",
      description: "Complete your message in WhatsApp to reach us!",
    });

    setFormData({ name: "", email: "", eventType: "", message: "" });
    setErrors({});
  };

  const handleEmailSubmit = () => {
    if (!validateForm()) {
      toast({
        title: "Please fix the errors",
        description: "Check the form fields and try again.",
        variant: "destructive",
      });
      return;
    }

    const subject = formData.eventType 
      ? `Inquiry about ${formData.eventType}` 
      : "Inquiry from VibeLink Website";
    
    const body = `Hi VibeLink Team,

Name: ${formData.name.trim()}
${formData.email ? `Email: ${formData.email.trim()}` : ""}
${formData.eventType ? `Event Type: ${formData.eventType.trim()}` : ""}

Message:
${formData.message.trim()}`;

    const mailtoUrl = `mailto:hello@vibelinkgh.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    
    toast({
      title: "Opening Email",
      description: "Complete your message in your email app!",
    });

    setFormData({ name: "", email: "", eventType: "", message: "" });
    setErrors({});
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-24 lg:pt-32 pb-16 bg-gradient-to-b from-[#6B46C1] via-[#553C9A] to-[#44337A]">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Contact Us
            </h1>
            <p className="text-white/80 text-lg lg:text-xl">
              Have a question or ready to create your event? We'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center p-6 rounded-2xl bg-card border border-border"
            >
              <div className="w-14 h-14 mx-auto rounded-xl bg-secondary/20 flex items-center justify-center mb-4">
                <MapPin className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Location</h3>
              <p className="text-muted-foreground text-sm">Accra, Ghana</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center p-6 rounded-2xl bg-card border border-border"
            >
              <div className="w-14 h-14 mx-auto rounded-xl bg-secondary/20 flex items-center justify-center mb-4">
                <Phone className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Phone / WhatsApp</h3>
              <p className="text-muted-foreground text-sm">+233 24 581 7973</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center p-6 rounded-2xl bg-card border border-border"
            >
              <div className="w-14 h-14 mx-auto rounded-xl bg-secondary/20 flex items-center justify-center mb-4">
                <Clock className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Response Time</h3>
              <p className="text-muted-foreground text-sm">Within 24 hours</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-secondary/20 flex items-center justify-center mb-6">
                <MessageCircleIcon className="h-8 w-8 text-secondary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Get In Touch
              </h2>
              <p className="text-muted-foreground text-lg">
                Have a question or want to discuss your event? Send us a message
                and we'll get back to you.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-8 rounded-2xl bg-card border border-border space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">
                    Your Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Kwame Asante"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={errors.name ? "border-destructive" : ""}
                    maxLength={100}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email (optional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="kwame@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={errors.email ? "border-destructive" : ""}
                    maxLength={255}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventType" className="text-foreground">
                  Event Type (optional)
                </Label>
                <Input
                  id="eventType"
                  placeholder="e.g. Wedding, Funeral, Birthday"
                  value={formData.eventType}
                  onChange={(e) =>
                    setFormData({ ...formData, eventType: e.target.value })
                  }
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-foreground">
                  Your Message <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="message"
                  placeholder="Tell us about your event or ask any questions..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className={`min-h-[120px] ${errors.message ? "border-destructive" : ""}`}
                  maxLength={1000}
                />
                {errors.message && (
                  <p className="text-sm text-destructive">{errors.message}</p>
                )}
                <p className="text-xs text-muted-foreground text-right">
                  {formData.message.length}/1000
                </p>
              </div>

              {/* Dual Send Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button 
                  type="button" 
                  onClick={handleWhatsAppSubmit}
                  size="lg" 
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Send via WhatsApp
                </Button>
                <Button 
                  type="button" 
                  onClick={handleEmailSubmit}
                  variant="outline"
                  size="lg" 
                  className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Send via Email
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-secondary/20 flex items-center justify-center mb-6">
              <HelpCircle className="h-8 w-8 text-secondary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Find answers to common questions about our services
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-md transition-shadow"
                >
                  <AccordionTrigger className="text-left text-foreground font-medium hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
