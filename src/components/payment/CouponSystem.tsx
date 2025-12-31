import { useState } from "react";
import { Tag, Check, X, Loader2, Percent, Gift } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CouponDetails {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount?: number;
  max_discount?: number;
  description?: string;
  valid_until?: string;
}

interface CouponSystemProps {
  orderTotal: number;
  onApplyCoupon: (discount: number, couponCode: string) => void;
  onRemoveCoupon: () => void;
  appliedCoupon?: string;
}

export function CouponSystem({
  orderTotal,
  onApplyCoupon,
  onRemoveCoupon,
  appliedCoupon
}: CouponSystemProps) {
  const [couponCode, setCouponCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [appliedDetails, setAppliedDetails] = useState<CouponDetails | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsValidating(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase())
        .eq("is_active", true)
        .single();

      if (error || !data) {
        toast.error("Invalid coupon code");
        return;
      }

      // Check validity
      if (data.valid_until && new Date(data.valid_until) < new Date()) {
        toast.error("This coupon has expired");
        return;
      }

      if (data.usage_limit && data.times_used >= data.usage_limit) {
        toast.error("This coupon has reached its usage limit");
        return;
      }

      if (data.min_order_amount && orderTotal < data.min_order_amount) {
        toast.error(`Minimum order amount is GH???${data.min_order_amount}`);
        return;
      }

      // Calculate discount
      let discount = 0;
      if (data.discount_type === "percentage") {
        discount = (orderTotal * data.discount_value) / 100;
        if (data.max_discount && discount > data.max_discount) {
          discount = data.max_discount;
        }
      } else {
        discount = data.discount_value;
      }

      setAppliedDetails(data);
      setDiscountAmount(discount);
      onApplyCoupon(discount, data.code);
      toast.success(`Coupon applied! You save GH???${discount.toFixed(2)}`);
    } catch (err) {
      console.error("Coupon validation error:", err);
      toast.error("Failed to validate coupon");
    } finally {
      setIsValidating(false);
    }
  };

  const removeCoupon = () => {
    setAppliedDetails(null);
    setDiscountAmount(0);
    setCouponCode("");
    onRemoveCoupon();
    toast.info("Coupon removed");
  };

  if (appliedDetails) {
    return (
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-green-700 dark:text-green-400">
                  {appliedDetails.code}
                </span>
                <Tag className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm text-green-600 dark:text-green-400">
                {appliedDetails.discount_type === "percentage"
                  ? `${appliedDetails.discount_value}% off`
                  : `GH???${appliedDetails.discount_value} off`}
                {" ?? "}You save GH???{discountAmount.toFixed(2)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={removeCoupon}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && validateCoupon()}
            className="pl-10 uppercase"
          />
        </div>
        <Button
          variant="outline"
          onClick={validateCoupon}
          disabled={isValidating}
        >
          {isValidating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Apply"
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Have a promo code? Enter it above to get a discount!
      </p>
    </div>
  );
}

// Admin component for managing coupons
export function CouponManager() {
  const [coupons, setCoupons] = useState<CouponDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: 10,
    min_order_amount: 0,
    max_discount: 0,
    usage_limit: 0,
    valid_until: "",
    description: ""
  });

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (err) {
      console.error("Error fetching coupons:", err);
      toast.error("Failed to load coupons");
    } finally {
      setIsLoading(false);
    }
  };

  const createCoupon = async () => {
    if (!newCoupon.code || !newCoupon.discount_value) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const { error } = await supabase
        .from("coupons")
        .insert({
          ...newCoupon,
          code: newCoupon.code.toUpperCase(),
          is_active: true,
          times_used: 0
        });

      if (error) throw error;

      toast.success("Coupon created!");
      setShowCreateForm(false);
      setNewCoupon({
        code: "",
        discount_type: "percentage",
        discount_value: 10,
        min_order_amount: 0,
        max_discount: 0,
        usage_limit: 0,
        valid_until: "",
        description: ""
      });
      fetchCoupons();
    } catch (err) {
      console.error("Error creating coupon:", err);
      toast.error("Failed to create coupon");
    }
  };

  const toggleCouponStatus = async (couponId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("coupons")
        .update({ is_active: !isActive })
        .eq("id", couponId);

      if (error) throw error;

      toast.success(`Coupon ${isActive ? "deactivated" : "activated"}`);
      fetchCoupons();
    } catch (err) {
      console.error("Error toggling coupon:", err);
      toast.error("Failed to update coupon");
    }
  };

  return { coupons, isLoading, fetchCoupons, createCoupon, toggleCouponStatus, showCreateForm, setShowCreateForm, newCoupon, setNewCoupon };
}

export default CouponSystem;

