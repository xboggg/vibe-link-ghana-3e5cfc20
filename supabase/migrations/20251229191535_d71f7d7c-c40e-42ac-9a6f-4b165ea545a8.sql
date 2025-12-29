-- Add payment tracking columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS deposit_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS deposit_paid boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS deposit_reference text,
ADD COLUMN IF NOT EXISTS deposit_paid_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS balance_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS balance_paid boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS balance_reference text,
ADD COLUMN IF NOT EXISTS balance_paid_at timestamp with time zone;