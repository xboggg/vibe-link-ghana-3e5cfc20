-- Drop existing functions and recreate with new return type
DROP FUNCTION IF EXISTS public.get_order_by_id(uuid);
DROP FUNCTION IF EXISTS public.get_order_by_id(uuid, text);

-- Recreate the function with payment fields
CREATE FUNCTION public.get_order_by_id(order_id uuid, customer_email text DEFAULT NULL)
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
  preferred_delivery_date date,
  client_email text,
  deposit_paid boolean,
  balance_paid boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
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
    o.preferred_delivery_date,
    o.client_email,
    COALESCE(o.deposit_paid, false),
    COALESCE(o.balance_paid, false)
  FROM public.orders o
  WHERE o.id = get_order_by_id.order_id 
    AND (
      get_order_by_id.customer_email IS NOT NULL 
      AND LOWER(o.client_email) = LOWER(get_order_by_id.customer_email)
    );
END;
$$;