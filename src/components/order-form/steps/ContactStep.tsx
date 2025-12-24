import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrderFormData, eventTypes, packages, addOns, colorPalettes, stylePreferences } from "@/data/orderFormData";
import { ArrowLeft, User, Mail, Phone, MessageCircle, Loader2, Send } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

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
  const isValid = formData.fullName && formData.phone;
  
  const selectedEvent = eventTypes.find((e) => e.id === formData.eventType);
  const selectedPackage = packages.find((p) => p.id === formData.selectedPackage);
  const selectedPalette = colorPalettes.find((c) => c.id === formData.colorPalette);
  const selectedStyle = stylePreferences.find((s) => s.id === formData.stylePreference);
  const selectedAddOnsList = formData.selectedAddOns.map((id) => addOns.find((a) => a.id === id)).filter(Boolean);

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
              onChange={(e) => updateFormData({ fullName: e.target.value })}
              className="h-12"
            />
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
              onChange={(e) => updateFormData({ email: e.target.value })}
              className="h-12"
            />
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
              onChange={(e) => updateFormData({ phone: e.target.value })}
              className="h-12"
            />
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
              onChange={(e) => updateFormData({ whatsapp: e.target.value })}
              className="h-12"
            />
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
          onClick={onSubmit}
          disabled={!isValid || isSubmitting}
          size="lg"
          variant="gold"
          className="gap-2 min-w-[180px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
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
