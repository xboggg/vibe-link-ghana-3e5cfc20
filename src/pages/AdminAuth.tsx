import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useTOTP } from "@/hooks/useTOTP";
import { toast } from "sonner";
import { Lock, Mail, User, Loader2, Shield } from "lucide-react";
import { z } from "zod";
import { TwoFactorSetup } from "@/components/auth/TwoFactorSetup";
import { TwoFactorVerify } from "@/components/auth/TwoFactorVerify";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(12, "Password must be at least 12 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

import { supabase } from "@/integrations/supabase/client";

type AuthStep = 'login' | 'signup' | '2fa-verify' | '2fa-setup' | 'forgot-password';

const AdminAuth = () => {
  const navigate = useNavigate();
  const { user, loading, signIn, signUp } = useAuth();
  const { getStatus } = useTOTP();
  const [step, setStep] = useState<AuthStep>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pendingNavigation, setPendingNavigation] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotEmailSent, setForgotEmailSent] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (user && !loading) {
        // Check if 2FA is enabled
        const status = await getStatus();
        if (status.enabled && !pendingNavigation) {
          setStep('2fa-verify');
        } else if (!status.hasSetup && step !== '2fa-setup') {
          // Prompt to set up 2FA for new users
          setStep('2fa-setup');
        } else if (pendingNavigation) {
          navigate("/admin");
        }
      }
    };
    checkAuth();
  }, [user, loading, navigate, pendingNavigation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      if (step === 'login') {
        const result = loginSchema.safeParse(formData);
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

        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Signed in successfully!");
          // Check 2FA status will happen in useEffect
        }
      } else if (step === 'signup') {
        const result = signupSchema.safeParse(formData);
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

        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("An account with this email already exists");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Account created! You can now sign in.");
          setStep('login');
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handle2FASuccess = () => {
    setPendingNavigation(true);
    navigate("/admin");
  };

  const handle2FASetupComplete = () => {
    setPendingNavigation(true);
    navigate("/admin");
  };

  const handle2FASkip = () => {
    setPendingNavigation(true);
    navigate("/admin");
  };

  const handle2FACancel = async () => {
    // Sign out and return to login
    const { signOut } = useAuth();
    await signOut();
    setStep('login');
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        setForgotEmailSent(true);
        toast.success("Password reset link sent to your email!");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

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
              {/* 2FA Verification */}
              {step === '2fa-verify' && (
                <TwoFactorVerify 
                  onSuccess={handle2FASuccess}
                  onCancel={handle2FACancel}
                />
              )}

              {/* 2FA Setup */}
              {step === '2fa-setup' && (
                <TwoFactorSetup 
                  onComplete={handle2FASetupComplete}
                  onSkip={handle2FASkip}
                />
              )}

              {/* Forgot Password Form */}
              {step === 'forgot-password' && (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Mail className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">
                      {forgotEmailSent ? "Check Your Email" : "Forgot Password"}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                      {forgotEmailSent
                        ? "We've sent a password reset link to your email address."
                        : "Enter your email and we'll send you a reset link"}
                    </p>
                  </div>

                  {!forgotEmailSent ? (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="forgotEmail">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="forgotEmail"
                            name="forgotEmail"
                            type="email"
                            placeholder="you@example.com"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
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
                            Sending...
                          </>
                        ) : (
                          "Send Reset Link"
                        )}
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-4">
                        Didn't receive the email? Check your spam folder or try again.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setForgotEmailSent(false);
                          setForgotEmail("");
                        }}
                        className="w-full"
                      >
                        Try Again
                      </Button>
                    </div>
                  )}

                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('login');
                        setForgotEmailSent(false);
                        setForgotEmail("");
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </>
              )}

              {/* Login/Signup Forms */}
              {(step === 'login' || step === 'signup') && (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Lock className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">
                      {step === 'login' ? "Admin Login" : "Create Account"}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                      {step === 'login'
                        ? "Sign in to access the admin dashboard"
                        : "Create an account to get started"}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {step === 'signup' && (
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="fullName"
                            name="fullName"
                            type="text"
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="pl-10"
                          />
                        </div>
                        {errors.fullName && (
                          <p className="text-sm text-destructive">{errors.fullName}</p>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          className="pl-10"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                          className="pl-10"
                        />
                      </div>
                      {errors.password && (
                        <p className="text-sm text-destructive">{errors.password}</p>
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
                          {step === 'login' ? "Signing in..." : "Creating account..."}
                        </>
                      ) : step === 'login' ? (
                        "Sign In"
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 text-center space-y-2">
                    {step === 'login' && (
                      <button
                        type="button"
                        onClick={() => setStep('forgot-password')}
                        className="block w-full text-sm text-muted-foreground hover:text-primary hover:underline"
                      >
                        Forgot your password?
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setStep(step === 'login' ? 'signup' : 'login');
                        setErrors({});
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      {step === 'login'
                        ? "Don't have an account? Sign up"
                        : "Already have an account? Sign in"}
                    </button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Shield className="h-3 w-3" />
                      <span>Protected with Two-Factor Authentication</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default AdminAuth;
