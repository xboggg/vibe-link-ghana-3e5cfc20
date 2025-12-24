import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OrderFormData, eventTypes } from "@/data/orderFormData";
import { ArrowLeft, ArrowRight, Calendar, Clock, MapPin, Users } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface EventDetailsStepProps {
  formData: OrderFormData;
  updateFormData: (updates: Partial<OrderFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const EventDetailsStep = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
}: EventDetailsStepProps) => {
  const selectedEvent = eventTypes.find((e) => e.id === formData.eventType);
  
  const isValid = formData.eventTitle && formData.eventDate && formData.eventVenue;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Tell us about your {selectedEvent?.name.toLowerCase() || "event"}
        </h2>
        <p className="text-muted-foreground">
          These details will appear on your invitation.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Event Title */}
        <div className="space-y-2">
          <Label htmlFor="eventTitle" className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Event Title / Headline
          </Label>
          <Input
            id="eventTitle"
            placeholder="e.g., John & Sarah's Wedding, Celebrating Kofi's Life"
            value={formData.eventTitle}
            onChange={(e) => updateFormData({ eventTitle: e.target.value })}
            className="h-12"
          />
        </div>

        {/* Celebrant Names */}
        <div className="space-y-2">
          <Label htmlFor="celebrantNames">Names of Celebrants/Honorees</Label>
          <Input
            id="celebrantNames"
            placeholder="e.g., John Mensah & Sarah Addo"
            value={formData.celebrantNames}
            onChange={(e) => updateFormData({ celebrantNames: e.target.value })}
            className="h-12"
          />
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Event Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 justify-start text-left font-normal",
                    !formData.eventDate && "text-muted-foreground"
                  )}
                >
                  {formData.eventDate ? (
                    format(formData.eventDate, "PPP")
                  ) : (
                    "Select date"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={formData.eventDate || undefined}
                  onSelect={(date) => updateFormData({ eventDate: date || null })}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventTime" className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Event Time
            </Label>
            <Input
              id="eventTime"
              type="time"
              value={formData.eventTime}
              onChange={(e) => updateFormData({ eventTime: e.target.value })}
              className="h-12"
            />
          </div>
        </div>

        {/* Venue */}
        <div className="space-y-2">
          <Label htmlFor="eventVenue" className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Venue Name
          </Label>
          <Input
            id="eventVenue"
            placeholder="e.g., La Palm Royal Beach Hotel"
            value={formData.eventVenue}
            onChange={(e) => updateFormData({ eventVenue: e.target.value })}
            className="h-12"
          />
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="eventAddress">Full Address (for Google Maps)</Label>
          <Input
            id="eventAddress"
            placeholder="e.g., 2 La Bypass Road, La, Accra, Ghana"
            value={formData.eventAddress}
            onChange={(e) => updateFormData({ eventAddress: e.target.value })}
            className="h-12"
          />
        </div>

        {/* Additional Info */}
        <div className="space-y-2">
          <Label htmlFor="additionalInfo">Additional Information (optional)</Label>
          <Textarea
            id="additionalInfo"
            placeholder="Any other details you'd like on the invitation? Dress code, special instructions, etc."
            value={formData.additionalInfo}
            onChange={(e) => updateFormData({ additionalInfo: e.target.value })}
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrev} size="lg" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={onNext} disabled={!isValid} size="lg" className="gap-2">
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
