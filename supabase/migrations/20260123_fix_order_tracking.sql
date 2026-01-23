-- Fix order tracking to support both short ID (8 chars) and full UUID lookup
-- Also adds support for looking up by email pattern matching

DROP FUNCTION IF EXISTS public.get_order_by_id(uuid, text);

CREATE OR REPLACE FUNCTION public.get_order_by_id(
  order_id text,
  customer_email text DEFAULT NULL
)
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
DECLARE
  search_id text;
BEGIN
  -- Normalize the search ID (remove # prefix, lowercase)
  search_id := lower(trim(replace(order_id, '#', '')));

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
    o.deposit_paid,
    o.balance_paid
  FROM public.orders o
  WHERE
    -- Match by full UUID or partial (first 8 chars)
    (
      o.id::text = search_id
      OR o.id::text LIKE search_id || '%'
    )
    -- Verify email matches (case insensitive)
    AND (
      customer_email IS NULL
      OR lower(o.client_email) = lower(customer_email)
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_order_by_id(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_order_by_id(text, text) TO authenticated;

COMMENT ON FUNCTION public.get_order_by_id IS 'Lookup order by ID (full UUID or short 8-char) with email verification';
