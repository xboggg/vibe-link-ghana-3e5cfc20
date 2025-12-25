import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderFormData, initialFormData, packages, addOns } from "@/data/orderFormData";
import { supabase } from "@/integrations/supabase/client";
import { EventTypeStep } from "./steps/EventTypeStep";
import { EventDetailsStep } from "./steps/EventDetailsStep";
import { StyleColorsStep } from "./steps/StyleColorsStep";
import { PackageStep } from "./steps/PackageStep";
import { AddOnsStep } from "./steps/AddOnsStep";
import { TimelineStep } from "./steps/TimelineStep";
import { ContactStep } from "./steps/ContactStep";
import { OrderSummary } from "./OrderSummary";
import { PriceCalculator } from "./PriceCalculator";

const steps = [
  { id: 1, name: "Event Type", shortName: "Event" },
  { id: 2, name: "Event Details", shortName: "Details" },
  { id: 3, name: "Style & Colors", shortName: "Style" },
  { id: 4, name: "Package", shortName: "Package" },
  { id: 5, name: "Add-ons", shortName: "Add-ons" },
  { id: 6, name: "Timeline", shortName: "Timeline" },
  { id: 7, name: "Contact & Submit", shortName: "Submit" },
];

interface OrderFormWizardProps {
  onComplete?: (data: OrderFormData) => void;
}

export const OrderFormWizard = ({ onComplete }: OrderFormWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OrderFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (updates: Partial<OrderFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step <= currentStep || canGoToStep(step)) {
      setCurrentStep(step);
    }
  };

  const canGoToStep = (step: number): boolean => {
    // Allow going to any previous step or current step
    if (step <= currentStep) return true;
    // Otherwise check if all previous steps are complete
    for (let i = 1; i < step; i++) {
      if (!isStepComplete(i)) return false;
    }
    return true;
  };

  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.eventType;
      case 2:
        return !!formData.eventTitle && !!formData.eventDate && !!formData.eventVenue;
      case 3:
        return !!formData.colorPalette && !!formData.stylePreference;
      case 4:
        return !!formData.selectedPackage;
      case 5:
        return true; // Add-ons are optional
      case 6:
        return true; // Timeline has defaults
      case 7:
        return !!formData.fullName && !!formData.phone;
      default:
        return false;
    }
  };

  const calculateTotal = () => {
    let total = 0;
    
    // Package price
    const selectedPkg = packages.find((p) => p.id === formData.selectedPackage);
    if (selectedPkg) {
      total += selectedPkg.price;
    }
    
    // Add-ons prices
    formData.selectedAddOns.forEach((addonId) => {
      const addon = addOns.find((a) => a.id === addonId);
      if (addon) {
        total += addon.price;
      }
    });
    
    // Rush delivery
    if (formData.deliveryUrgency === "rush" && !formData.selectedAddOns.includes("rush")) {
      total += 300;
    }
    
    return total;
  };

  const uploadReferenceImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const file of formData.referenceImages) {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("reference-images")
        .upload(fileName, file);
      
      if (error) {
        console.error("Error uploading image:", error);
        continue;
      }
      
      const { data: urlData } = supabase.storage
        .from("reference-images")
        .getPublicUrl(data.path);
      
      uploadedUrls.push(urlData.publicUrl);
    }
    
    return uploadedUrls;
  };

  const sendWhatsAppNotification = (orderId: string, total: number) => {
    const selectedPkg = packages.find((p) => p.id === formData.selectedPackage);
    const selectedAddOnsList = formData.selectedAddOns.map((addonId) => {
      const addon = addOns.find((a) => a.id === addonId);
      return addon?.name || "";
    }).filter(Boolean);
    
    const message = `🎉 *New Order from VibeLink Ghana!*
    
📋 *Order ID:* ${orderId.substring(0, 8)}

👤 *Client Details:*
• Name: ${formData.fullName}
• Phone: ${formData.phone}
• Email: ${formData.email}
${formData.whatsapp ? `• WhatsApp: ${formData.whatsapp}` : ""}

📅 *Event Details:*
• Type: ${formData.eventType.charAt(0).toUpperCase() + formData.eventType.slice(1)}
• Title: ${formData.eventTitle}
• Date: ${formData.eventDate ? formData.eventDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "TBD"}
• Time: ${formData.eventTime || "TBD"}
• Venue: ${formData.eventVenue}
${formData.eventAddress ? `• Address: ${formData.eventAddress}` : ""}
${formData.celebrantNames ? `• Celebrant(s): ${formData.celebrantNames}` : ""}

🎨 *Design Preferences:*
• Package: ${selectedPkg?.name || ""} (GHS ${selectedPkg?.price || 0})
• Color Palette: ${formData.colorPalette}
• Style: ${formData.stylePreference}
${selectedAddOnsList.length > 0 ? `• Add-ons: ${selectedAddOnsList.join(", ")}` : ""}
• Delivery: ${formData.deliveryUrgency === "rush" ? "Rush (48h)" : "Standard"}
${formData.preferredDeliveryDate ? `• Preferred Delivery: ${formData.preferredDeliveryDate.toLocaleDateString("en-GB")}` : ""}

💰 *Total:* GHS ${total.toLocaleString()}

${formData.additionalInfo ? `📝 *Additional Notes:* ${formData.additionalInfo}` : ""}
${formData.designNotes ? `🎯 *Design Notes:* ${formData.designNotes}` : ""}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = "233245817973"; // VibeLink Ghana WhatsApp
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    // Use window.location.href for more reliable redirect, avoiding iframe blocking
    // Create a link element and trigger click to ensure proper navigation
    const link = document.createElement("a");
    link.href = whatsappUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sendOrderConfirmationEmail = async (
    orderId: string,
    total: number,
    selectedPkg: typeof packages[0] | undefined,
    selectedAddOnsList: { id: string; name: string; price: number }[]
  ) => {
    try {
      const { error } = await supabase.functions.invoke("send-order-confirmation", {
        body: {
          orderId,
          clientName: formData.fullName,
          clientEmail: formData.email,
          eventType: formData.eventType,
          eventTitle: formData.eventTitle,
          eventDate: formData.eventDate ? formData.eventDate.toISOString().split("T")[0] : null,
          packageName: selectedPkg?.name || "",
          packagePrice: selectedPkg?.price || 0,
          totalPrice: total,
          addOns: selectedAddOnsList.map(a => ({ name: a.name, price: a.price })),
        },
      });

      if (error) {
        console.error("Error sending confirmation email:", error);
      }
    } catch (error) {
      console.error("Failed to send confirmation email:", error);
    }
  };

  const sendAdminNotification = async (
    orderId: string,
    total: number,
    selectedPkg: typeof packages[0] | undefined,
    selectedAddOnsList: { id: string; name: string; price: number }[]
  ) => {
    try {
      const { error } = await supabase.functions.invoke("send-admin-notification", {
        body: {
          orderId,
          clientName: formData.fullName,
          clientEmail: formData.email,
          clientPhone: formData.phone,
          clientWhatsapp: formData.whatsapp || null,
          eventType: formData.eventType,
          eventTitle: formData.eventTitle,
          eventDate: formData.eventDate ? formData.eventDate.toISOString().split("T")[0] : null,
          eventTime: formData.eventTime || null,
          venueName: formData.eventVenue || null,
          venueAddress: formData.eventAddress || null,
          packageName: selectedPkg?.name || "",
          packagePrice: selectedPkg?.price || 0,
          totalPrice: total,
          addOns: selectedAddOnsList.map(a => ({ name: a.name, price: a.price })),
          colorPalette: formData.colorPalette || null,
          stylePreference: formData.stylePreference || null,
          deliveryType: formData.deliveryUrgency,
          specialRequests: formData.designNotes || null,
        },
      });

      if (error) {
        console.error("Error sending admin notification:", error);
      }
    } catch (error) {
      console.error("Failed to send admin notification:", error);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const selectedPkg = packages.find((p) => p.id === formData.selectedPackage);
      const selectedAddOnsList = formData.selectedAddOns.map((addonId) => {
        const addon = addOns.find((a) => a.id === addonId);
        return addon ? { id: addon.id, name: addon.name, price: addon.price } : null;
      }).filter(Boolean) as { id: string; name: string; price: number }[];
      
      const total = calculateTotal();
      
      // Upload reference images first
      const referenceImageUrls = await uploadReferenceImages();
      
      const { data, error } = await supabase.from("orders").insert({
        event_type: formData.eventType,
        event_title: formData.eventTitle,
        event_date: formData.eventDate ? formData.eventDate.toISOString().split("T")[0] : null,
        event_time: formData.eventTime || null,
        venue_name: formData.eventVenue || null,
        venue_address: formData.eventAddress || null,
        couple_names: formData.celebrantNames || null,
        special_message: formData.additionalInfo || null,
        color_palette: formData.colorPalette || null,
        custom_colors: formData.customColors.length > 0 ? formData.customColors : null,
        style_preferences: formData.stylePreference ? [formData.stylePreference] : null,
        package_id: formData.selectedPackage,
        package_name: selectedPkg?.name || "",
        package_price: selectedPkg?.price || 0,
        add_ons: selectedAddOnsList,
        delivery_type: formData.deliveryUrgency,
        preferred_delivery_date: formData.preferredDeliveryDate 
          ? formData.preferredDeliveryDate.toISOString().split("T")[0] 
          : null,
        special_requests: formData.designNotes || null,
        client_name: formData.fullName,
        client_email: formData.email,
        client_phone: formData.phone,
        client_whatsapp: formData.whatsapp || null,
        total_price: total,
        reference_images: referenceImageUrls.length > 0 ? referenceImageUrls : null,
      }).select("id").single();

      if (error) {
        console.error("Error submitting order:", error);
        throw error;
      }
      
      // Send confirmation email, admin notification, and WhatsApp notification
      if (data?.id) {
        sendOrderConfirmationEmail(data.id, total, selectedPkg, selectedAddOnsList);
        sendAdminNotification(data.id, total, selectedPkg, selectedAddOnsList);
        sendWhatsAppNotification(data.id, total);
      }
      
      onComplete?.(formData);
    } catch (error) {
      console.error("Order submission failed:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    const props = {
      formData,
      updateFormData,
      onNext: nextStep,
      onPrev: prevStep,
    };

    switch (currentStep) {
      case 1:
        return <EventTypeStep {...props} />;
      case 2:
        return <EventDetailsStep {...props} />;
      case 3:
        return <StyleColorsStep {...props} />;
      case 4:
        return <PackageStep {...props} />;
      case 5:
        return <AddOnsStep {...props} />;
      case 6:
        return <TimelineStep {...props} />;
      case 7:
        return (
          <ContactStep
            {...props}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            total={calculateTotal()}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Form Area */}
      <div className="lg:col-span-2 space-y-6">
        {/* Progress Steps */}
        <div className="bg-card rounded-2xl border border-border p-4 lg:p-6">
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="flex items-center flex-shrink-0"
              >
                <button
                  onClick={() => goToStep(step.id)}
                  disabled={!canGoToStep(step.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 transition-all",
                    canGoToStep(step.id) ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                      currentStep === step.id
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : isStepComplete(step.id)
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isStepComplete(step.id) && currentStep !== step.id ? (
                      <Check className="h-4 w-4 lg:h-5 lg:w-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium hidden sm:block",
                      currentStep === step.id
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.shortName}
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-6 lg:w-12 h-0.5 mx-1 lg:mx-2 flex-shrink-0",
                      isStepComplete(step.id)
                        ? "bg-accent"
                        : "bg-border"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6 lg:p-8"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Sidebar - Price Calculator & Summary */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 space-y-6">
          <PriceCalculator
            formData={formData}
            currentStep={currentStep}
          />
          {currentStep >= 4 && (
            <OrderSummary
              formData={formData}
              total={calculateTotal()}
            />
          )}
        </div>
      </div>
    </div>
  );
};
