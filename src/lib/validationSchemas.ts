import { z } from "zod";

// Phone number validation for Ghana
const ghanaPhoneRegex = /^(\+233|0)(2[0-9]|5[0-9])[0-9]{7}$/;

export const eventTypeSchema = z.object({
  eventType: z.string().min(1, "Please select an event type"),
});

export const eventDetailsSchema = z.object({
  eventTitle: z.string().trim().min(1, "Event title is required").max(100, "Event title must be less than 100 characters"),
  eventDate: z.date({ required_error: "Event date is required" }),
  eventTime: z.string().optional(),
  eventVenue: z.string().trim().min(1, "Venue name is required").max(200, "Venue name must be less than 200 characters"),
  eventAddress: z.string().max(300, "Address must be less than 300 characters").optional(),
  celebrantNames: z.string().max(200, "Names must be less than 200 characters").optional(),
  additionalInfo: z.string().max(1000, "Additional info must be less than 1000 characters").optional(),
});

export const styleColorsSchema = z.object({
  colorPalette: z.string().min(1, "Please select a color palette"),
  stylePreference: z.string().min(1, "Please select a design style"),
  customColors: z.array(z.string()).optional(),
  designNotes: z.string().max(1000, "Design notes must be less than 1000 characters").optional(),
});

export const packageSchema = z.object({
  selectedPackage: z.string().min(1, "Please select a package"),
});

export const timelineSchema = z.object({
  deliveryUrgency: z.enum(["standard", "rush"]),
  preferredDeliveryDate: z.date().nullable().optional(),
});

export const contactSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().min(1, "Email address is required").email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().min(1, "Phone number is required").regex(ghanaPhoneRegex, "Please enter a valid Ghana phone number (e.g., 024 XXX XXXX or +233 24 XXX XXXX)"),
  whatsapp: z.string().regex(ghanaPhoneRegex, "Please enter a valid WhatsApp number").optional().or(z.literal("")),
  hearAboutUs: z.string().optional(),
});

export const fullOrderSchema = z.object({
  eventType: z.string().min(1, "Please select an event type"),
  eventTitle: z.string().trim().min(1, "Event title is required"),
  eventDate: z.date({ required_error: "Event date is required" }),
  eventTime: z.string().optional(),
  eventVenue: z.string().trim().min(1, "Venue name is required"),
  eventAddress: z.string().optional(),
  celebrantNames: z.string().optional(),
  additionalInfo: z.string().optional(),
  colorPalette: z.string().min(1, "Please select a color palette"),
  stylePreference: z.string().min(1, "Please select a design style"),
  customColors: z.array(z.string()).optional(),
  designNotes: z.string().optional(),
  selectedPackage: z.string().min(1, "Please select a package"),
  selectedAddOns: z.array(z.string()),
  deliveryUrgency: z.enum(["standard", "rush"]),
  preferredDeliveryDate: z.date().nullable().optional(),
  fullName: z.string().trim().min(1, "Full name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().trim().min(1, "Phone number is required"),
  whatsapp: z.string().optional(),
  hearAboutUs: z.string().optional(),
  referenceImages: z.array(z.any()).optional(),
});

export type EventTypeFormData = z.infer<typeof eventTypeSchema>;
export type EventDetailsFormData = z.infer<typeof eventDetailsSchema>;
export type StyleColorsFormData = z.infer<typeof styleColorsSchema>;
export type PackageFormData = z.infer<typeof packageSchema>;
export type TimelineFormData = z.infer<typeof timelineSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
