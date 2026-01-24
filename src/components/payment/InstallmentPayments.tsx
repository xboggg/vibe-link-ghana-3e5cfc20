import { useState, useEffect } from "react";
import {
  CreditCard, Calendar, CheckCircle, Clock, AlertTriangle,
  Loader2, ChevronRight, Receipt, Wallet
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, addDays, addWeeks } from "date-fns";

interface PaymentPlan {
  id: string;
  name: string;
  installments: number;
  interval_days: number;
  first_payment_percent: number;
  description: string;
  is_active: boolean;
}

interface InstallmentSchedule {
  installment_number: number;
  amount: number;
  due_date: Date;
  status: "pending" | "paid" | "overdue";
  paid_at?: Date;
}

interface OrderInstallment {
  id: string;
  order_id: string;
  plan_id: string | null;
  total_amount: number;
  installments: unknown;
  created_at: string | null;
}

interface InstallmentPaymentSelectorProps {
  orderTotal: number;
  onSelectPlan: (planId: string | null, schedule: InstallmentSchedule[] | null) => void;
  selectedPlanId?: string;
}

// Default payment plans
const defaultPlans: PaymentPlan[] = [
  {
    id: "full",
    name: "Pay in Full",
    installments: 1,
    interval_days: 0,
    first_payment_percent: 100,
    description: "Pay the full amount now",
    is_active: true
  },
  {
    id: "2-installments",
    name: "50/50 Split",
    installments: 2,
    interval_days: 0,
    first_payment_percent: 50,
    description: "50% before work starts, 50% after draft review",
    is_active: true
  },
  {
    id: "3-installments",
    name: "40/60 Split",
    installments: 2,
    interval_days: 0,
    first_payment_percent: 40,
    description: "40% before work starts, 60% after draft review",
    is_active: true
  },
  {
    id: "deposit-balance",
    name: "30/70 Split",
    installments: 2,
    interval_days: 0, // Balance due before delivery
    first_payment_percent: 30,
    description: "30% before work starts, 70% after draft review",
    is_active: true
  }
];

export function InstallmentPaymentSelector({
  orderTotal,
  onSelectPlan,
  selectedPlanId = "full"
}: InstallmentPaymentSelectorProps) {
  const [plans, setPlans] = useState<PaymentPlan[]>(defaultPlans);
  const [selectedPlan, setSelectedPlan] = useState<string>(selectedPlanId);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_plans")
        .select("*")
        .eq("is_active", true)
        .order("installments", { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        setPlans(data);
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
      // Use default plans if fetch fails
    }
  };

  const calculateSchedule = (plan: PaymentPlan): InstallmentSchedule[] => {
    const schedule: InstallmentSchedule[] = [];
    const firstPayment = (orderTotal * plan.first_payment_percent) / 100;
    const remaining = orderTotal - firstPayment;
    const remainingInstallments = plan.installments - 1;

    // First payment
    schedule.push({
      installment_number: 1,
      amount: firstPayment,
      due_date: new Date(),
      status: "pending"
    });

    // Remaining installments
    if (remainingInstallments > 0) {
      const perInstallment = remaining / remainingInstallments;
      for (let i = 0; i < remainingInstallments; i++) {
        const dueDate = plan.interval_days > 0
          ? addDays(new Date(), plan.interval_days * (i + 1))
          : new Date(); // For deposit-balance, will be set to delivery date

        schedule.push({
          installment_number: i + 2,
          amount: perInstallment,
          due_date: dueDate,
          status: "pending"
        });
      }
    }

    return schedule;
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    const plan = plans.find(p => p.id === planId);

    if (plan) {
      const schedule = calculateSchedule(plan);
      onSelectPlan(planId === "full" ? null : planId, planId === "full" ? null : schedule);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Payment Options
        </CardTitle>
        <CardDescription>
          Choose how you'd like to pay for your order
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedPlan} onValueChange={handlePlanSelect}>
          <div className="space-y-3">
            {plans.map((plan) => {
              const schedule = calculateSchedule(plan);
              const isSelected = selectedPlan === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`relative border rounded-lg p-4 cursor-pointer transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value={plan.id} id={plan.id} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={plan.id} className="font-medium cursor-pointer">
                        {plan.name}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {plan.description}
                      </p>

                      {isSelected && plan.installments > 1 && (
                        <div className="mt-3 pt-3 border-t space-y-2">
                          {schedule.map((inst) => (
                            <div
                              key={inst.installment_number}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-muted-foreground">
                                {inst.installment_number === 1 ? "Due now" : format(inst.due_date, "MMM d, yyyy")}
                              </span>
                              <span className="font-medium">
                                GH₵{inst.amount.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        GH₵{schedule[0].amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {plan.installments === 1 ? "Total" : "Due now"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

// Customer's installment tracker component
export function InstallmentTracker({ orderId }: { orderId: string }) {
  const [installment, setInstallment] = useState<OrderInstallment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInstallment();
  }, [orderId]);

  const fetchInstallment = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("order_installments")
        .select("*")
        .eq("order_id", orderId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      if (data) {
        setInstallment({
          ...data,
          installments: Array.isArray(data.installments) ? data.installments : []
        } as OrderInstallment);
      }
    } catch (err) {
      console.error("Error fetching installment:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!installment) {
    return null; // No installment plan for this order
  }

  const installmentsList = (Array.isArray(installment.installments) ? installment.installments : []) as InstallmentSchedule[];
  const paidCount = installmentsList.filter(i => i.status === "paid").length;
  const totalCount = installmentsList.length;
  const paidAmount = installmentsList
    .filter(i => i.status === "paid")
    .reduce((sum, i) => sum + i.amount, 0);
  const progressPercent = installment.total_amount > 0 ? (paidAmount / installment.total_amount) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Payment Progress
        </CardTitle>
        <CardDescription>
          {paidCount} of {totalCount} payments completed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>GH₵{paidAmount.toFixed(2)} paid</span>
            <span>GH₵{installment.total_amount.toFixed(2)} total</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <div className="space-y-2">
          {installmentsList.map((inst) => {
            const isOverdue = inst.status === "pending" && new Date(inst.due_date) < new Date();

            return (
              <div
                key={inst.installment_number}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  inst.status === "paid"
                    ? "bg-green-50 border-green-200 dark:bg-green-950/20"
                    : isOverdue
                    ? "bg-red-50 border-red-200 dark:bg-red-950/20"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  {inst.status === "paid" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : isOverdue ? (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">Payment {inst.installment_number}</p>
                    <p className="text-xs text-muted-foreground">
                      {inst.status === "paid"
                        ? `Paid on ${format(new Date(inst.paid_at!), "MMM d, yyyy")}`
                        : `Due ${format(new Date(inst.due_date), "MMM d, yyyy")}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">GH₵{inst.amount.toFixed(2)}</p>
                  {inst.status === "paid" ? (
                    <Badge className="bg-green-500">Paid</Badge>
                  ) : isOverdue ? (
                    <Badge variant="destructive">Overdue</Badge>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {installmentsList.some(i => i.status === "pending") && (
          <Button className="w-full">
            <CreditCard className="h-4 w-4 mr-2" />
            Pay Next Installment
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default InstallmentPaymentSelector;

