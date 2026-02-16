import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Send, Loader2, CheckCircle, AlertCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Layout } from "@/components/layout/Layout";

interface Survey {
  id: string;
  customer_name: string;
  customer_email: string;
  status: string;
  expires_at: string | null;
}

interface RatingCategory {
  id: string;
  label: string;
  description: string;
  value: number;
}

const Survey = () => {
  const { token } = useParams<{ token: string }>();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [overallRating, setOverallRating] = useState(0);
  const [ratings, setRatings] = useState<RatingCategory[]>([
    { id: "design_quality", label: "Design Quality", description: "How satisfied were you with the design?", value: 0 },
    { id: "delivery_speed", label: "Delivery Speed", description: "Was your invitation delivered on time?", value: 0 },
    { id: "communication", label: "Communication", description: "How was our communication throughout?", value: 0 },
    { id: "value_for_money", label: "Value for Money", description: "Did you get good value for your investment?", value: 0 },
  ]);
  const [feedbackText, setFeedbackText] = useState("");
  const [allowTestimonial, setAllowTestimonial] = useState(false);

  useEffect(() => {
    if (token) {
      fetchSurvey();
    }
  }, [token]);

  const fetchSurvey = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("surveys")
        .select("*")
        .eq("token", token)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          setError("Survey not found. The link may be invalid or expired.");
        } else {
          throw error;
        }
        return;
      }

      if (data.status === "completed") {
        setIsCompleted(true);
        setSurvey(data);
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setError("This survey has expired. Thank you for your interest!");
        return;
      }

      setSurvey(data);
    } catch (err) {
      console.error("Error fetching survey:", err);
      setError("Failed to load survey. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingChange = (categoryId: string, value: number) => {
    setRatings(prev => prev.map(r =>
      r.id === categoryId ? { ...r, value } : r
    ));
  };

  const handleSubmit = async () => {
    if (overallRating === 0) {
      toast.error("Please provide an overall rating");
      return;
    }

    setIsSubmitting(true);
    try {
      // Insert survey response
      const { error: responseError } = await supabase
        .from("survey_responses")
        .insert({
          survey_id: survey!.id,
          overall_rating: overallRating,
          design_quality: ratings.find(r => r.id === "design_quality")?.value || null,
          delivery_speed: ratings.find(r => r.id === "delivery_speed")?.value || null,
          communication: ratings.find(r => r.id === "communication")?.value || null,
          value_for_money: ratings.find(r => r.id === "value_for_money")?.value || null,
          feedback_text: feedbackText || null,
          allow_testimonial: allowTestimonial,
        });

      if (responseError) throw responseError;

      // Update survey status
      const { error: updateError } = await supabase
        .from("surveys")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", survey!.id);

      if (updateError) throw updateError;

      // If user allowed testimonial and gave good rating, add to testimonials
      if (allowTestimonial && overallRating >= 4 && feedbackText) {
        await supabase.from("testimonials").insert({
          name: survey!.customer_name,
          event_type: "Customer",
          quote: feedbackText,
          rating: overallRating,
          featured: false,
        });
      }

      setIsCompleted(true);
      toast.success("Thank you for your feedback!");
    } catch (err) {
      console.error("Error submitting survey:", err);
      toast.error("Failed to submit survey. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ value, onChange, size = "md" }: { value: number; onChange: (v: number) => void; size?: "sm" | "md" | "lg" }) => {
    const [hovered, setHovered] = useState(0);
    const starSize = size === "lg" ? "h-10 w-10" : size === "md" ? "h-8 w-8" : "h-6 w-6";

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="transition-transform hover:scale-110"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
          >
            <Star
              className={`${starSize} transition-colors ${
                star <= (hovered || value)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-8 pb-8">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Oops!</h1>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button asChild>
                <Link to="/">Return to Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (isCompleted) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="max-w-md w-full text-center">
              <CardContent className="pt-8 pb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
                </motion.div>
                <h1 className="text-2xl font-bold mb-2">Thank You!</h1>
                <p className="text-muted-foreground mb-6">
                  We truly appreciate you taking the time to share your feedback, {survey?.customer_name?.split(" ")[0]}!
                  Your response helps us improve our services.
                </p>
                <div className="flex flex-col gap-3">
                  <Button asChild>
                    <Link to="/">Visit Our Website</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/portfolio">View Our Portfolio</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12 px-4">
        <div className="container max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4"
              >
                <Heart className="h-8 w-8 text-primary" />
              </motion.div>
              <h1 className="text-3xl font-bold mb-2">We'd Love Your Feedback!</h1>
              <p className="text-muted-foreground">
                Hi {survey?.customer_name?.split(" ")[0]}, thank you for choosing VibeLink Event!
                Please take a moment to rate your experience.
              </p>
            </div>

            {/* Survey Form */}
            <Card>
              <CardHeader>
                <CardTitle>Rate Your Experience</CardTitle>
                <CardDescription>Your feedback helps us serve you better</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Overall Rating */}
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <Label className="text-lg font-semibold mb-4 block">Overall Experience</Label>
                  <p className="text-sm text-muted-foreground mb-4">How would you rate your overall experience with us?</p>
                  <div className="flex justify-center">
                    <StarRating value={overallRating} onChange={setOverallRating} size="lg" />
                  </div>
                  {overallRating > 0 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-3 text-sm font-medium text-primary"
                    >
                      {overallRating === 5 ? "Excellent! We're thrilled!" :
                       overallRating === 4 ? "Great! Thank you!" :
                       overallRating === 3 ? "Good, we'll work to improve!" :
                       overallRating === 2 ? "We're sorry, we'll do better!" :
                       "We apologize, please tell us more below."}
                    </motion.p>
                  )}
                </div>

                {/* Category Ratings */}
                <div className="space-y-6">
                  {ratings.map((category) => (
                    <div key={category.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border">
                      <div>
                        <Label className="font-medium">{category.label}</Label>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                      <StarRating
                        value={category.value}
                        onChange={(v) => handleRatingChange(category.id, v)}
                        size="sm"
                      />
                    </div>
                  ))}
                </div>

                {/* Written Feedback */}
                <div className="space-y-3">
                  <Label htmlFor="feedback">Additional Comments (Optional)</Label>
                  <Textarea
                    id="feedback"
                    placeholder="Tell us more about your experience... What did you love? What could we improve?"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Testimonial Permission */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div>
                    <Label htmlFor="testimonial" className="font-medium">Share as Testimonial</Label>
                    <p className="text-sm text-muted-foreground">
                      May we feature your feedback on our website?
                    </p>
                  </div>
                  <Switch
                    id="testimonial"
                    checked={allowTestimonial}
                    onCheckedChange={setAllowTestimonial}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isSubmitting || overallRating === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Feedback
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Survey;
