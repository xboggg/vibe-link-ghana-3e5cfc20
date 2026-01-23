-- Create function to get detailed order information for the order details page
-- This returns more fields than the basic get_order_by_id function

DROP FUNCTION IF EXISTS public.get_order_details_by_id(text, text);

CREATE OR REPLACE FUNCTION public.get_order_details_by_id(
  order_id text,
  customer_email text
)
RETURNS TABLE (
  id uuid,
  event_title text,
  event_type text,
  event_date date,
  event_time text,
  event_venue text,
  package_name text,
  total_price numeric,
  order_status text,
  payment_status text,
  created_at timestamptz,
  preferred_delivery_date date,
  client_email text,
  client_name text,
  client_phone text,
  color_palette text,
  style_preference text,
  add_ons text[]
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
    o.event_time,
    o.event_venue,
    o.package_name,
    o.total_price,
    o.order_status::text,
    o.payment_status::text,
    o.created_at,
    o.preferred_delivery_date,
    o.client_email,
    o.client_name,
    o.client_phone,
    o.color_palette,
    o.style_preference,
    o.selected_add_ons as add_ons
  FROM public.orders o
  WHERE
    -- Match by full UUID or partial (first 8 chars)
    (
      o.id::text = search_id
      OR o.id::text LIKE search_id || '%'
    )
    -- Require email verification
    AND customer_email IS NOT NULL
    AND lower(o.client_email) = lower(customer_email);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_order_details_by_id(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_order_details_by_id(text, text) TO authenticated;

COMMENT ON FUNCTION public.get_order_details_by_id IS 'Get detailed order information by ID with email verification for the order details page';
