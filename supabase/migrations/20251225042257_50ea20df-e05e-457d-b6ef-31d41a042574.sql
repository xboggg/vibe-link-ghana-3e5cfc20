-- Fix critical security issue: Orders should only be viewable by exact ID match
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view their order by ID or email" ON public.orders;

-- Create a secure policy that requires the exact order ID
-- This works with the track order page where users enter their order ID
CREATE POLICY "Users can view order by exact ID match"
  ON public.orders
  FOR SELECT
  USING (true);
  
-- Note: The actual ID filtering happens at the application level via .eq('id', orderId)
-- RLS ensures no bulk data exposure since queries must specify an ID
-- For true row-level security, we use a function-based approach

-- Actually, let's create a more secure approach using a custom claim or RPC
-- For now, the safest approach is to keep SELECT restricted to admins only
-- and create a secure RPC function for order lookup

DROP POLICY IF EXISTS "Users can view order by exact ID match" ON public.orders;

-- Only admins can SELECT orders directly
CREATE POLICY "Only admins can view orders"
  ON public.orders
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create a secure function for public order lookup by ID
CREATE OR REPLACE FUNCTION public.get_order_by_id(order_id uuid)
RETURNS TABLE (
  id uuid,
  event_title text,
  event_type text,
  event_date date,
  package_name text,
  total_price numeric,
  order_status text,
  payment_status text,
  created_at timestamptz,
  preferred_delivery_date date
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    o.id,
    o.event_title,
    o.event_type,
    o.event_date,
    o.package_name,
    o.total_price,
    o.order_status::text,
    o.payment_status::text,
    o.created_at,
    o.preferred_delivery_date
  FROM public.orders o
  WHERE o.id = order_id;
$$;

-- Fix payment_reminder_logs INSERT policy - restrict to service role only
DROP POLICY IF EXISTS "Service role can insert reminder logs" ON public.payment_reminder_logs;

-- No public INSERT policy needed - edge functions use service role key which bypasses RLS