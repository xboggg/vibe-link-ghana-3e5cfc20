import { useState, useEffect } from "react";
import {
  Gift, Copy, Share2, Users, Wallet, CheckCircle,
  Loader2, TrendingUp, Award
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

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

  const copyReferralLink = () => {
    const link = `https://vibelinkgh.com/get-started?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    toast.success("Referral link copied!");
  };

  const shareReferral = async () => {
    const link = `https://vibelinkgh.com/get-started?ref=${referralCode}`;
    const text = `Get 10% off your first order at VibeLink Ghana! Use my referral link: ${link}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "VibeLink Ghana Referral",
          text: text,
          url: link
        });
      } catch (err) {
        copyReferralLink();
      }
    } else {
      copyReferralLink();
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
            Share your code and earn 10% of each successful referral order!
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
          <p className="text-sm text-muted-foreground">
            Your friends get 10% off their first order, you earn 10% commission!
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

