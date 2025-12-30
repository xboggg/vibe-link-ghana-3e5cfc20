-- Create payment_history table to track all payments
CREATE TABLE public.payment_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('deposit', 'balance')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('paystack', 'bank_transfer', 'cash', 'mobile_money', 'other')),
  amount NUMERIC NOT NULL,
  reference TEXT,
  recorded_by TEXT, -- 'system' for Paystack, or admin email for manual
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all payment history
CREATE POLICY "Admins can view all payment history"
ON public.payment_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to insert payment history
CREATE POLICY "Admins can insert payment history"
ON public.payment_history
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow service role to insert (for edge functions)
CREATE POLICY "Service role can insert payment history"
ON public.payment_history
FOR INSERT
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_payment_history_order_id ON public.payment_history(order_id);
CREATE INDEX idx_payment_history_created_at ON public.payment_history(created_at DESC);