import { useState, useEffect } from "react";
import {
  Gift, Copy, Share2, Users, Wallet, CheckCircle,
  Loader2, TrendingUp, Award, Phone
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

// Social media icons
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

interface ReferralStats {
  total_referrals: number;
  successful_referrals: number;
  pending_referrals: number;
  total_earnings: number;
  available_balance: number;
}

interface Referral {
  id: string;
  referred_email: string;
  status: string;
  reward_amount: number | null;
  created_at: string | null;
  completed_at?: string | null;
}

interface ReferralProgramProps {
  customerEmail: string;
  customerName: string;
}

export function ReferralProgram({ customerEmail, customerName }: ReferralProgramProps) {
  const [referralCode, setReferralCode] = useState("");
  const [momoNumber, setMomoNumber] = useState("");
  const [isSavingMomo, setIsSavingMomo] = useState(false);
  const [stats, setStats] = useState<ReferralStats>({
    total_referrals: 0,
    successful_referrals: 0,
    pending_referrals: 0,
    total_earnings: 0,
    available_balance: 0
  });
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeReferral();
  }, [customerEmail]);

  const initializeReferral = async () => {
    setIsLoading(true);
    try {
      // Get or create referral code
      const { data: existingCode, error: codeError } = await supabase
        .from("referral_codes")
        .select("*")
        .eq("owner_email", customerEmail.toLowerCase())
        .single();

      if (codeError && codeError.code !== "PGRST116") {
        throw codeError;
      }

      if (existingCode) {
        setReferralCode(existingCode.code);
        setMomoNumber((existingCode as any).owner_momo_number || "");
        setStats({
          total_referrals: existingCode.total_referrals || 0,
          successful_referrals: existingCode.successful_referrals || 0,
          pending_referrals: existingCode.pending_referrals || 0,
          total_earnings: existingCode.total_earnings || 0,
          available_balance: existingCode.available_balance || 0
        });
      } else {
        // Generate new referral code
        const code = generateReferralCode(customerName);
        const { error: insertError } = await supabase
          .from("referral_codes")
          .insert({
            code,
            owner_email: customerEmail.toLowerCase(),
            owner_name: customerName,
            reward_percentage: 10 // 10% reward
          });

        if (insertError) throw insertError;
        setReferralCode(code);
      }

      // Fetch referral history
      const { data: referralData } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_email", customerEmail.toLowerCase())
        .order("created_at", { ascending: false });

      setReferrals(referralData || []);
    } catch (err) {
      console.error("Error initializing referral:", err);
      toast.error("Failed to load referral data");
    } finally {
      setIsLoading(false);
    }
  };

  const generateReferralCode = (name: string) => {
    const prefix = name.split(" ")[0].toUpperCase().slice(0, 4);
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${suffix}`;
  };

  const referralLink = `https://vibelinkgh.com/get-started?ref=${referralCode}`;
  const shareMessage = `I got my beautiful digital invitation from VibeLink Events! Check them out for stunning event invitations: ${referralLink}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  };

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "VibeLink Events",
          text: shareMessage,
          url: referralLink
        });
      } catch (err) {
        copyReferralLink();
      }
    } else {
      copyReferralLink();
    }
  };

  const shareOnWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, "_blank");
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(shareMessage)}`;
    window.open(url, "_blank");
  };

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, "_blank");
  };

  const saveMomoNumber = async () => {
    if (!momoNumber.trim()) {
      toast.error("Please enter your MoMo number");
      return;
    }
    setIsSavingMomo(true);
    try {
      const { error } = await supabase
        .from("referral_codes")
        .update({ owner_momo_number: momoNumber.trim() } as any)
        .eq("owner_email", customerEmail.toLowerCase());

      if (error) throw error;
      toast.success("MoMo number saved! You'll receive payouts to this number.");
    } catch (err) {
      console.error("Error saving MoMo:", err);
      toast.error("Failed to save MoMo number");
    } finally {
      setIsSavingMomo(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "expired":
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Referral Code Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Your Referral Code
          </CardTitle>
          <CardDescription>
            Share your code and earn cash rewards for each successful referral!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={referralCode}
              readOnly
              className="text-lg font-mono font-bold text-center bg-background"
            />
            <Button variant="outline" onClick={copyReferralLink}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button onClick={shareReferral}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Social Sharing Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={shareOnWhatsApp}
              className="bg-[#25D366]/10 hover:bg-[#25D366]/20 border-[#25D366]/30 text-[#25D366]"
            >
              <WhatsAppIcon className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={shareOnFacebook}
              className="bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border-[#1877F2]/30 text-[#1877F2]"
            >
              <FacebookIcon className="h-4 w-4 mr-2" />
              Facebook
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={shareOnTwitter}
              className="bg-black/10 hover:bg-black/20 border-black/30 text-black dark:text-white"
            >
              <TwitterIcon className="h-4 w-4 mr-2" />
              X / Twitter
            </Button>
          </div>

          <div className="bg-secondary/10 rounded-lg p-3 space-y-1">
            <p className="text-sm font-medium">Earn cash for every referral:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Classic Vibe referral: <span className="font-semibold text-foreground">GHS 100</span></li>
              <li>• Prestige Vibe referral: <span className="font-semibold text-foreground">GHS 200</span></li>
              <li>• Royal Vibe referral: <span className="font-semibold text-foreground">GHS 500</span></li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* MoMo Number Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Phone className="h-5 w-5" />
            Payout Details
          </CardTitle>
          <CardDescription>
            Enter your MoMo number to receive referral payouts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="tel"
              placeholder="e.g., 024 XXX XXXX"
              value={momoNumber}
              onChange={(e) => setMomoNumber(e.target.value)}
              className="flex-1"
            />
            <Button onClick={saveMomoNumber} disabled={isSavingMomo}>
              {isSavingMomo ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Payouts are processed via MoMo after each successful referral order is completed.
          </p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-2xl font-bold">{stats.total_referrals}</p>
              </div>
              <Users className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Successful</p>
                <p className="text-2xl font-bold text-green-600">{stats.successful_referrals}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earned</p>
                <p className="text-2xl font-bold">GH???{stats.total_earnings}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-green-600">GH???{stats.available_balance}</p>
              </div>
              <Wallet className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Referral History</CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length > 0 ? (
            <div className="space-y-3">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{referral.referred_email}</p>
                    <p className="text-xs text-muted-foreground">
                      {referral.created_at ? format(new Date(referral.created_at), "MMM d, yyyy") : 'Unknown'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {referral.status === "completed" && referral.reward_amount && (
                      <span className="text-green-600 font-medium">
                        +GH₵{referral.reward_amount}
                      </span>
                    )}
                    {getStatusBadge(referral.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No referrals yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Share your code to start earning!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ReferralProgram;

