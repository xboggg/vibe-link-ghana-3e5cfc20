import { useState, useEffect } from "react";
import { Gift, Users, Wallet, TrendingUp, CheckCircle, Clock, RefreshCw, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface ReferralCode {
  id: string;
  code: string;
  owner_email: string;
  owner_name: string;
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
  created_at: string;
  completed_at: string | null;
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
              <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Owner</TableHead><TableHead>Referrals</TableHead><TableHead>Successful</TableHead><TableHead>Earnings</TableHead><TableHead>Balance</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {codes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell><span className="font-mono font-bold">{code.code}</span></TableCell>
                    <TableCell><div><p className="font-medium">{code.owner_name}</p><p className="text-xs text-muted-foreground">{code.owner_email}</p></div></TableCell>
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
        <CardHeader><CardTitle>Recent Referrals</CardTitle><CardDescription>Latest referral activity</CardDescription></CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-8"><p className="text-muted-foreground">No referrals yet</p></div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Referrer</TableHead><TableHead>Referred</TableHead><TableHead>Code</TableHead><TableHead>Status</TableHead><TableHead>Reward</TableHead></TableRow></TableHeader>
              <TableBody>
                {referrals.map((ref) => (
                  <TableRow key={ref.id}>
                    <TableCell>{format(new Date(ref.created_at), "MMM d, yyyy")}</TableCell>
                    <TableCell>{ref.referrer_email}</TableCell>
                    <TableCell>{ref.referred_email}</TableCell>
                    <TableCell className="font-mono">{ref.referral_code}</TableCell>
                    <TableCell>{getStatusBadge(ref.status)}</TableCell>
                    <TableCell>{ref.status === "completed" ? "GHS " + ref.reward_amount : "--"}</TableCell>
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
