-- Fix order insert with select returning
-- Error 42501 occurs because .insert().select() requires SELECT permission
-- but current RLS only allows admins to SELECT

-- Option 1: Allow anyone to SELECT the row they just inserted
-- This is secure because you can only see the row you created

-- Create a function to insert order and return the ID securely
CREATE OR REPLACE FUNCTION public.insert_order(
  p_event_type TEXT,
  p_event_title TEXT,
  p_event_date DATE,
  p_event_time TEXT,
  p_venue_name TEXT,
  p_venue_address TEXT,
  p_couple_names TEXT,
  p_special_message TEXT,
  p_color_palette TEXT,
  p_custom_colors TEXT[],
  p_style_preferences TEXT[],
  p_package_id TEXT,
  p_package_name TEXT,
  p_package_price DECIMAL,
  p_add_ons JSONB,
  p_delivery_type TEXT,
  p_preferred_delivery_date DATE,
  p_special_requests TEXT,
  p_client_name TEXT,
  p_client_email TEXT,
  p_client_phone TEXT,
  p_client_whatsapp TEXT,
  p_total_price DECIMAL,
  p_referral_code TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_order_id UUID;
BEGIN
  INSERT INTO public.orders (
    event_type,
    event_title,
    event_date,
    event_time,
    venue_name,
    venue_address,
    couple_names,
    special_message,
    color_palette,
    custom_colors,
    style_preferences,
    package_id,
    package_name,
    package_price,
    add_ons,
    delivery_type,
    preferred_delivery_date,
    special_requests,
    client_name,
    client_email,
    client_phone,
    client_whatsapp,
    total_price,
    referral_code
  ) VALUES (
    p_event_type,
    p_event_title,
    p_event_date,
    p_event_time,
    p_venue_name,
    p_venue_address,
    p_couple_names,
    p_special_message,
    p_color_palette,
    p_custom_colors,
    p_style_preferences,
    p_package_id,
    p_package_name,
    p_package_price,
    p_add_ons,
    p_delivery_type,
    p_preferred_delivery_date,
    p_special_requests,
    p_client_name,
    p_client_email,
    p_client_phone,
    p_client_whatsapp,
    p_total_price,
    p_referral_code
  )
  RETURNING id INTO new_order_id;

  RETURN new_order_id;
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.insert_order TO anon;
GRANT EXECUTE ON FUNCTION public.insert_order TO authenticated;
