-- Add referral_code column to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS referral_code TEXT;

-- Create index for referral code lookups
CREATE INDEX IF NOT EXISTS idx_orders_referral_code ON public.orders(referral_code);

-- Comment for documentation
COMMENT ON COLUMN public.orders.referral_code IS 'Referral code used when placing this order';
