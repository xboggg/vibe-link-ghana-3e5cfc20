import { useState, useEffect } from "react";
import { Gift, Users, Wallet, TrendingUp, CheckCircle, Clock, RefreshCw, Loader2, Phone, BanknoteIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

// Fixed referral rewards by package
const REFERRAL_REWARDS: Record<string, number> = {
  "Classic Vibe": 100,
  "Prestige Vibe": 200,
  "Royal Vibe": 500,
};

interface ReferralCode {
  id: string;
  code: string;
  owner_email: string;
  owner_name: string;
  owner_momo_number: string | null;
  reward_percentage: number;
  total_referrals: number;
  successful_referrals: number;
  pending_referrals: number;
  total_earnings: number;
  available_balance: number;
  is_active: boolean;
  created_at: string;
}

interface Referral {
  id: string;
  referrer_email: string;
  referred_email: string;
  referral_code: string;
  status: string;
  reward_amount: number;
  package_name: string | null;
  payout_status: string;
  created_at: string;
  completed_at: string | null;
  paid_at: string | null;
}

export function ReferralsAdmin() {
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [codesRes, refsRes] = await Promise.all([
        supabase.from("referral_codes").select("*").order("created_at", { ascending: false }),
        supabase.from("referrals").select("*").order("created_at", { ascending: false }).limit(50)
      ]);
      if (codesRes.error) throw codesRes.error;
      if (refsRes.error) throw refsRes.error;
      setCodes(codesRes.data || []);
      setReferrals(refsRes.data || []);
    } catch (err) {
      console.error("Error fetching referral data:", err);
      toast.error("Failed to load referral data");
    } finally {
      setIsLoading(false);
    }
  };

  const totalEarnings = codes.reduce((sum, c) => sum + c.total_earnings, 0);
  const totalReferrals = codes.reduce((sum, c) => sum + c.total_referrals, 0);
  const successfulReferrals = codes.reduce((sum, c) => sum + c.successful_referrals, 0);
  const pendingPayouts = codes.reduce((sum, c) => sum + c.available_balance, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge className="bg-green-500">Completed</Badge>;
      case "pending": return <Badge className="bg-yellow-500">Pending</Badge>;
      case "expired": return <Badge variant="secondary">Expired</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getPayoutBadge = (status: string) => {
    switch (status) {
      case "paid": return <Badge className="bg-green-500">Paid</Badge>;
      case "pending": return <Badge className="bg-orange-500">Unpaid</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const markAsPaid = async (referral: Referral) => {
    try {
      // Update referral payout status
      const { error: refError } = await supabase
        .from("referrals")
        .update({
          payout_status: "paid",
          paid_at: new Date().toISOString()
        })
        .eq("id", referral.id);

      if (refError) throw refError;

      // Update referrer's available balance
      const { error: codeError } = await supabase
        .from("referral_codes")
        .update({
          available_balance: supabase.rpc ? 0 : 0 // Will be handled by trigger or manual
        })
        .eq("owner_email", referral.referrer_email);

      toast.success(`Marked as paid! Send GHS ${referral.reward_amount} to referrer.`);
      fetchData();
    } catch (err) {
      console.error("Error marking as paid:", err);
      toast.error("Failed to update payout status");
    }
  };

  // Get referrer's MoMo number
  const getReferrerMomo = (referrerEmail: string) => {
    const code = codes.find(c => c.owner_email === referrerEmail);
    return code?.owner_momo_number || "Not provided";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Referral Program</h2><p className="text-muted-foreground">Track referral codes and commissions</p></div>
        <Button variant="outline" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Referrals</p><p className="text-2xl font-bold">{totalReferrals}</p></div><Users className="h-8 w-8 text-primary/50" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Successful</p><p className="text-2xl font-bold text-green-600">{successfulReferrals}</p></div><CheckCircle className="h-8 w-8 text-green-500/50" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Earned</p><p className="text-2xl font-bold">GHS {totalEarnings.toLocaleString()}</p></div><TrendingUp className="h-8 w-8 text-blue-500/50" /></div></CardContent></Card>
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Pending Payouts</p><p className="text-2xl font-bold text-orange-600">GHS {pendingPayouts.toLocaleString()}</p></div><Wallet className="h-8 w-8 text-orange-500/50" /></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Referral Codes</CardTitle><CardDescription>All active referral codes and their performance</CardDescription></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : codes.length === 0 ? (
            <div className="text-center py-12"><Gift className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">No referral codes yet</p></div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Owner</TableHead><TableHead>MoMo</TableHead><TableHead>Referrals</TableHead><TableHead>Successful</TableHead><TableHead>Earnings</TableHead><TableHead>Balance</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {codes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell><span className="font-mono font-bold">{code.code}</span></TableCell>
                    <TableCell><div><p className="font-medium">{code.owner_name}</p><p className="text-xs text-muted-foreground">{code.owner_email}</p></div></TableCell>
                    <TableCell>
                      {code.owner_momo_number ? (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-green-600" />
                          <span className="text-sm">{code.owner_momo_number}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>{code.total_referrals}</TableCell>
                    <TableCell className="text-green-600">{code.successful_referrals}</TableCell>
                    <TableCell>GHS {code.total_earnings.toLocaleString()}</TableCell>
                    <TableCell className="text-orange-600">GHS {code.available_balance.toLocaleString()}</TableCell>
                    <TableCell>{code.is_active ? <Badge className="bg-green-500">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Referrals</CardTitle><CardDescription>Latest referral activity - Mark payouts as paid after sending MoMo</CardDescription></CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-8"><p className="text-muted-foreground">No referrals yet</p></div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Referrer</TableHead><TableHead>MoMo</TableHead><TableHead>Package</TableHead><TableHead>Status</TableHead><TableHead>Reward</TableHead><TableHead>Payout</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
              <TableBody>
                {referrals.map((ref) => (
                  <TableRow key={ref.id}>
                    <TableCell>{format(new Date(ref.created_at), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{ref.referrer_email}</p>
                        <p className="text-xs text-muted-foreground">→ {ref.referred_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{getReferrerMomo(ref.referrer_email)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{ref.package_name || "N/A"}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(ref.status)}</TableCell>
                    <TableCell className="font-semibold">
                      {ref.status === "completed" ? "GHS " + ref.reward_amount : "--"}
                    </TableCell>
                    <TableCell>{ref.status === "completed" ? getPayoutBadge(ref.payout_status || "pending") : "--"}</TableCell>
                    <TableCell>
                      {ref.status === "completed" && ref.payout_status !== "paid" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">
                              <BanknoteIcon className="h-4 w-4 mr-1" />
                              Mark Paid
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Payout</AlertDialogTitle>
                              <AlertDialogDescription className="space-y-2">
                                <p>Have you sent <strong>GHS {ref.reward_amount}</strong> to:</p>
                                <p className="font-medium">{ref.referrer_email}</p>
                                <p className="text-sm">MoMo: {getReferrerMomo(ref.referrer_email)}</p>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => markAsPaid(ref)} className="bg-green-600 hover:bg-green-700">
                                Yes, Mark as Paid
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      {ref.payout_status === "paid" && (
                        <span className="text-xs text-muted-foreground">
                          {ref.paid_at ? format(new Date(ref.paid_at), "MMM d") : "Paid"}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ReferralsAdmin;
