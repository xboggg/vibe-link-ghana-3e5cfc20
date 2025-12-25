import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrderFormData, eventTypes, packages, addOns, colorPalettes, stylePreferences } from "@/data/orderFormData";
import { ArrowLeft, User, Mail, Phone, MessageCircle, Loader2, Send, ShieldCheck } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { contactSchema } from "@/lib/validationSchemas";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const RECAPTCHA_SITE_KEY = "6LeEKjYsAAAAAPHV-PE4PQ31TsTTmRPc-ApB19f6";

declare global {
  interface Window {
    grecaptcha: {
      enterprise: {
        ready: (callback: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
    };
  }
}

interface ContactStepProps {
  formData: OrderFormData;
  updateFormData: (updates: Partial<OrderFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  total: number;
}

export const ContactStep = ({
  formData,
  updateFormData,
  onPrev,
  onSubmit,
  isSubmitting,
  total,
}: ContactStepProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  
  const selectedEvent = eventTypes.find((e) => e.id === formData.eventType);
  const selectedPackage = packages.find((p) => p.id === formData.selectedPackage);
  const selectedPalette = colorPalettes.find((c) => c.id === formData.colorPalette);
  const selectedStyle = stylePreferences.find((s) => s.id === formData.stylePreference);
  const selectedAddOnsList = formData.selectedAddOns.map((id) => addOns.find((a) => a.id === id)).filter(Boolean);

  // Load reCAPTCHA Enterprise script
  useEffect(() => {
    const scriptId = "recaptcha-enterprise-script";
    if (document.getElementById(scriptId)) {
      setRecaptchaLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://www.google.com/recaptcha/enterprise.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.grecaptcha.enterprise.ready(() => {
        setRecaptchaLoaded(true);
      });
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup not needed as script should persist
    };
  }, []);

  const executeRecaptcha = useCallback(async (): Promise<string | null> => {
    if (!recaptchaLoaded || !window.grecaptcha?.enterprise) {
      toast.error("Security verification not ready. Please wait.");
      return null;
    }

    try {
      const token = await window.grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, {
        action: "SUBMIT_ORDER",
      });
      return token;
    } catch (error) {
      console.error("reCAPTCHA execution error:", error);
      toast.error("Security verification failed. Please refresh and try again.");
      return null;
    }
  }, [recaptchaLoaded]);

  const validateAndSubmit = async () => {
    const result = contactSchema.safeParse({
      fullName: formData.fullName,
      email: formData.email || "",
      phone: formData.phone,
      whatsapp: formData.whatsapp || "",
      hearAboutUs: formData.hearAboutUs,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsVerifying(true);
    try {
      // Get reCAPTCHA token
      const captchaToken = await executeRecaptcha();
      if (!captchaToken) {
        setIsVerifying(false);
        return;
      }

      // Verify captcha on server
      const { data, error } = await supabase.functions.invoke("verify-captcha", {
        body: { token: captchaToken, action: "SUBMIT_ORDER" },
      });

      if (error || !data?.success) {
        toast.error("Security verification failed. Please try again.");
        setIsVerifying(false);
        return;
      }

      setErrors({});
      onSubmit();
    } catch (error) {
      console.error("Captcha verification error:", error);
      toast.error("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const isValid = formData.fullName && formData.phone && recaptchaLoaded;

  const clearError = (field: string) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Almost there! 🎉
        </h2>
        <p className="text-muted-foreground">
          Enter your contact details and review your order.
        </p>
      </div>

      {/* Contact Form */}
      <div className="grid gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Full Name *
            </Label>
            <Input
              id="fullName"
              placeholder="Your name"
              value={formData.fullName}
              onChange={(e) => {
                updateFormData({ fullName: e.target.value });
                clearError("fullName");
              }}
              className={`h-12 ${errors.fullName ? "border-destructive" : ""}`}
              maxLength={100}
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => {
                updateFormData({ email: e.target.value });
                clearError("email");
              }}
              className={`h-12 ${errors.email ? "border-destructive" : ""}`}
              maxLength={255}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              Phone Number *
            </Label>
            <Input
              id="phone"
              placeholder="024 XXX XXXX"
              value={formData.phone}
              onChange={(e) => {
                updateFormData({ phone: e.target.value });
                clearError("phone");
              }}
              className={`h-12 ${errors.phone ? "border-destructive" : ""}`}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              WhatsApp (if different)
            </Label>
            <Input
              id="whatsapp"
              placeholder="Same as phone if blank"
              value={formData.whatsapp}
              onChange={(e) => {
                updateFormData({ whatsapp: e.target.value });
                clearError("whatsapp");
              }}
              className={`h-12 ${errors.whatsapp ? "border-destructive" : ""}`}
            />
            {errors.whatsapp && (
              <p className="text-sm text-destructive">{errors.whatsapp}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hearAboutUs">How did you hear about us?</Label>
          <Select
            value={formData.hearAboutUs}
            onValueChange={(value) => updateFormData({ hearAboutUs: value })}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="google">Google Search</SelectItem>
              <SelectItem value="friend">Friend/Family</SelectItem>
              <SelectItem value="event">Saw at an Event</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* reCAPTCHA Enterprise Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>
            Protected by reCAPTCHA Enterprise
            {!recaptchaLoaded && " (loading...)"}
          </span>
        </div>
      </div>

      {/* Order Summary */}
      <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-4">
        <h3 className="font-bold text-lg text-foreground">Order Summary</h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Event Type</span>
            <span className="text-foreground font-medium">{selectedEvent?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Event</span>
            <span className="text-foreground font-medium">{formData.eventTitle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
            <span className="text-foreground font-medium">
              {formData.eventDate ? format(formData.eventDate, "PPP") : "TBD"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Style</span>
            <span className="text-foreground font-medium">{selectedStyle?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Colors</span>
            <span className="text-foreground font-medium flex items-center gap-1">
              {selectedPalette?.name}
              <span className="flex gap-0.5 ml-1">
                {selectedPalette?.colors.slice(0, 3).map((c, i) => (
                  <span key={i} className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: c }} />
                ))}
              </span>
            </span>
          </div>
        </div>

        <div className="border-t border-border pt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Package</span>
            <span className="text-foreground font-medium">
              {selectedPackage?.name} - GHS {selectedPackage?.price.toLocaleString()}
            </span>
          </div>
          {selectedAddOnsList.length > 0 && (
            <div className="text-sm">
              <span className="text-muted-foreground">Add-ons:</span>
              <ul className="mt-1 space-y-1">
                {selectedAddOnsList.map((addon) => (
                  <li key={addon?.id} className="flex justify-between text-xs pl-2">
                    <span className="text-muted-foreground">{addon?.name}</span>
                    <span className="text-foreground">{addon?.priceLabel}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {formData.deliveryUrgency === "rush" && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Rush Delivery</span>
              <span className="text-foreground">GHS 300</span>
            </div>
          )}
        </div>

        <div className="border-t border-border pt-3 flex justify-between items-center">
          <span className="text-lg font-bold text-foreground">Total</span>
          <span className="text-2xl font-bold text-primary">
            GHS {total.toLocaleString()}
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          50% deposit (GHS {Math.round(total / 2).toLocaleString()}) required to start. Balance due on delivery.
        </p>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrev} size="lg" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={validateAndSubmit}
          disabled={!isValid || isSubmitting || isVerifying}
          size="lg"
          variant="gold"
          className="gap-2 min-w-[180px]"
        >
          {isSubmitting || isVerifying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {isVerifying ? "Verifying..." : "Submitting..."}
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit Order
            </>
          )}
        </Button>
      </div>
    </div>
  );
};