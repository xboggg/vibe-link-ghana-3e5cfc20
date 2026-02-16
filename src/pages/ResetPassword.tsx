import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lock, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { z } from "zod";

const passwordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PageState = 'loading' | 'ready' | 'success' | 'error' | 'expired';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [pageState, setPageState] = useState<PageState>('loading');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Check for recovery token in URL hash
    const checkRecoveryToken = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      const errorCode = hashParams.get('error_code');
      const errorDescription = hashParams.get('error_description');

      // Check for error in URL
      if (errorCode || errorDescription) {
        setErrorMessage(errorDescription || 'An error occurred');
        setPageState('error');
        return;
      }

      // Check if this is a recovery flow
      if (type === 'recovery' && accessToken) {
        try {
          // Set the session using the access token
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || '',
          });

          if (error) {
            console.error('Session error:', error);
            if (error.message.includes('expired')) {
              setPageState('expired');
            } else {
              setErrorMessage(error.message);
              setPageState('error');
            }
            return;
          }

          if (data.session) {
            setPageState('ready');
          } else {
            setPageState('expired');
          }
        } catch (err) {
          console.error('Recovery error:', err);
          setErrorMessage('Failed to process recovery link');
          setPageState('error');
        }
      } else {
        // No recovery token - check if user is already authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // User is logged in, they can reset password
          setPageState('ready');
        } else {
          // No token and not logged in - show error
          setPageState('expired');
        }
      }
    };

    checkRecoveryToken();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const result = passwordSchema.safeParse({ password, confirmPassword });
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        toast.error(error.message);
        setIsSubmitting(false);
        return;
      }

      setPageState('success');
      toast.success("Password updated successfully!");

      // Redirect to admin after 2 seconds
      setTimeout(() => {
        navigate("/admin");
      }, 2000);
    } catch (error) {
      toast.error("An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  const handleRequestNewLink = async () => {
    navigate("/admin/auth");
  };

  return (
    <Layout>
      <section className="pt-24 lg:pt-32 pb-20 min-h-screen bg-gradient-to-b from-primary via-primary/90 to-primary/80">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-card rounded-2xl border border-border p-8 shadow-xl">
              {/* Loading State */}
              {pageState === 'loading' && (
                <div className="text-center py-8">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Verifying recovery link...</p>
                </div>
              )}

              {/* Ready State - Show Form */}
              {pageState === 'ready' && (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Lock className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">
                      Reset Your Password
                    </h1>
                    <p className="text-muted-foreground mt-2">
                      Enter your new password below
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      {errors.password && (
                        <p className="text-sm text-destructive">{errors.password}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating password...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </form>
                </>
              )}

              {/* Success State */}
              {pageState === 'success' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Password Updated!
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Your password has been successfully updated.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Redirecting to admin dashboard...
                  </p>
                </div>
              )}

              {/* Expired State */}
              {pageState === 'expired' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                    <AlertCircle className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Link Expired
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    This password reset link has expired or is invalid. Please request a new one.
                  </p>
                  <Button onClick={handleRequestNewLink} className="w-full">
                    Request New Link
                  </Button>
                </div>
              )}

              {/* Error State */}
              {pageState === 'error' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Something Went Wrong
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {errorMessage || "We couldn't process your request. Please try again."}
                  </p>
                  <Button onClick={handleRequestNewLink} className="w-full">
                    Back to Login
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default ResetPassword;
