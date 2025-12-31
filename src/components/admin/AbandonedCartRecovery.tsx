import { useState, useEffect } from "react";
import {
  ShoppingCart, Mail, Clock, TrendingUp, RefreshCw,
  Send, Eye, CheckCircle, XCircle, Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";

interface AbandonedCart {
  id: string;
  session_id: string;
  customer_email?: string;
  customer_name?: string;
  event_type: string;
  package_name: string;
  total_price: number;
  cart_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  reminder_sent: boolean;
  reminder_sent_at?: string;
  recovered: boolean;
  recovered_at?: string;
}

interface RecoveryStats {
  total_abandoned: number;
  reminders_sent: number;
  recovered: number;
  recovery_rate: number;
  potential_revenue: number;
  recovered_revenue: number;
}

export function AbandonedCartRecovery() {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [stats, setStats] = useState<RecoveryStats>({
    total_abandoned: 0,
    reminders_sent: 0,
    recovered: 0,
    recovery_rate: 0,
    potential_revenue: 0,
    recovered_revenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [autoReminders, setAutoReminders] = useState(true);
  const [reminderDelay, setReminderDelay] = useState(24); // hours

  useEffect(() => {
    fetchAbandonedCarts();
    fetchSettings();
  }, []);

  const fetchAbandonedCarts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("abandoned_carts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      setCarts(data || []);

      // Calculate stats
      const total = data?.length || 0;
      const sent = data?.filter(c => c.reminder_sent).length || 0;
      const recovered = data?.filter(c => c.recovered).length || 0;
      const potentialRev = data?.reduce((sum, c) => sum + (c.total_price || 0), 0) || 0;
      const recoveredRev = data?.filter(c => c.recovered).reduce((sum, c) => sum + (c.total_price || 0), 0) || 0;

      setStats({
        total_abandoned: total,
        reminders_sent: sent,
        recovered: recovered,
        recovery_rate: total > 0 ? Math.round((recovered / total) * 100) : 0,
        potential_revenue: potentialRev,
        recovered_revenue: recoveredRev
      });
    } catch (err) {
      console.error("Error fetching abandoned carts:", err);
      toast.error("Failed to load abandoned carts");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data } = await supabase
        .from("app_settings")
        .select("*")
        .eq("key", "abandoned_cart_settings")
        .single();

      if (data?.value) {
        setAutoReminders(data.value.auto_reminders ?? true);
        setReminderDelay(data.value.reminder_delay_hours ?? 24);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  };

  const saveSettings = async () => {
    try {
      const { error } = await supabase
        .from("app_settings")
        .upsert({
          key: "abandoned_cart_settings",
          value: {
            auto_reminders: autoReminders,
            reminder_delay_hours: reminderDelay
          }
        });

      if (error) throw error;
      toast.success("Settings saved!");
    } catch (err) {
      console.error("Error saving settings:", err);
      toast.error("Failed to save settings");
    }
  };

  const sendReminder = async (cart: AbandonedCart) => {
    if (!cart.customer_email) {
      toast.error("No email address for this cart");
      return;
    }

    try {
      const { error } = await supabase.functions.invoke("send-cart-reminder", {
        body: {
          cartId: cart.id,
          email: cart.customer_email,
          name: cart.customer_name,
          eventType: cart.event_type,
          packageName: cart.package_name,
          totalPrice: cart.total_price
        }
      });

      if (error) throw error;

      // Update cart as reminder sent
      await supabase
        .from("abandoned_carts")
        .update({
          reminder_sent: true,
          reminder_sent_at: new Date().toISOString()
        })
        .eq("id", cart.id);

      toast.success("Reminder sent!");
      fetchAbandonedCarts();
    } catch (err) {
      console.error("Error sending reminder:", err);
      toast.error("Failed to send reminder");
    }
  };

  const runBulkReminders = async () => {
    const eligibleCarts = carts.filter(
      c => c.customer_email && !c.reminder_sent && !c.recovered
    );

    if (eligibleCarts.length === 0) {
      toast.info("No eligible carts for reminders");
      return;
    }

    toast.info(`Sending ${eligibleCarts.length} reminders...`);

    for (const cart of eligibleCarts) {
      await sendReminder(cart);
      await new Promise(r => setTimeout(r, 500)); // Rate limit
    }

    toast.success(`Sent ${eligibleCarts.length} reminders`);
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Abandoned Carts</p>
                <p className="text-2xl font-bold">{stats.total_abandoned}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-orange-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reminders Sent</p>
                <p className="text-2xl font-bold">{stats.reminders_sent}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recovery Rate</p>
                <p className="text-2xl font-bold text-green-600">{stats.recovery_rate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recovered Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  GH₵{stats.recovered_revenue.toLocaleString()}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings & Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Recovery Settings</CardTitle>
          <CardDescription>
            Configure automated cart recovery reminders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatic Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Automatically send recovery emails
              </p>
            </div>
            <Switch
              checked={autoReminders}
              onCheckedChange={setAutoReminders}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label>Reminder Delay (hours)</Label>
              <Input
                type="number"
                value={reminderDelay}
                onChange={(e) => setReminderDelay(Number(e.target.value))}
                min={1}
                max={168}
              />
            </div>
            <Button onClick={saveSettings} className="mt-6">
              Save Settings
            </Button>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={fetchAbandonedCarts}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={runBulkReminders}>
              <Send className="h-4 w-4 mr-2" />
              Send All Reminders
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Abandoned Carts List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Abandoned Carts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : carts.length > 0 ? (
            <div className="space-y-3">
              {carts.map((cart) => (
                <div
                  key={cart.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {cart.customer_email || "Anonymous"}
                      </span>
                      {cart.recovered && (
                        <Badge className="bg-green-500">Recovered</Badge>
                      )}
                      {cart.reminder_sent && !cart.recovered && (
                        <Badge variant="secondary">Reminder Sent</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {cart.event_type} ?? {cart.package_name} ?? GH₵{cart.total_price}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {formatDistanceToNow(new Date(cart.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!cart.recovered && cart.customer_email && !cart.reminder_sent && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendReminder(cart)}
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Send Reminder
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No abandoned carts yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Client-side cart tracking hook
export function useCartTracking() {
  const saveCart = async (cartData: {
    sessionId: string;
    email?: string;
    name?: string;
    eventType: string;
    packageName: string;
    totalPrice: number;
    formData: Record<string, unknown>;
  }) => {
    try {
      await supabase
        .from("abandoned_carts")
        .upsert({
          session_id: cartData.sessionId,
          customer_email: cartData.email?.toLowerCase(),
          customer_name: cartData.name,
          event_type: cartData.eventType,
          package_name: cartData.packageName,
          total_price: cartData.totalPrice,
          cart_data: cartData.formData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: "session_id"
        });
    } catch (err) {
      console.error("Error saving cart:", err);
    }
  };

  const markAsRecovered = async (sessionId: string) => {
    try {
      await supabase
        .from("abandoned_carts")
        .update({
          recovered: true,
          recovered_at: new Date().toISOString()
        })
        .eq("session_id", sessionId);
    } catch (err) {
      console.error("Error marking cart as recovered:", err);
    }
  };

  return { saveCart, markAsRecovered };
}

export default AbandonedCartRecovery;

