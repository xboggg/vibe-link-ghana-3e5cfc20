-- Fix 1: Update get_order_by_id to require email verification
CREATE OR REPLACE FUNCTION public.get_order_by_id(
  order_id uuid,
  customer_email text DEFAULT NULL
)
RETURNS TABLE(
  id uuid, 
  event_title text, 
  event_type text, 
  event_date date, 
  package_name text, 
  total_price numeric, 
  order_status text, 
  payment_status text, 
  created_at timestamp with time zone, 
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
  WHERE o.id = order_id 
    AND (
      customer_email IS NOT NULL 
      AND LOWER(o.client_email) = LOWER(customer_email)
    );
$$;

-- Fix 2: Restrict reference-images bucket to authenticated users only
UPDATE storage.buckets SET public = false WHERE id = 'reference-images';

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can upload reference images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view reference images" ON storage.objects;

-- Create restricted policies for reference images
CREATE POLICY "Authenticated users can upload reference images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'reference-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can view reference images"
ON storage.objects FOR SELECT
USING (bucket_id = 'reference-images' AND EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Admins can delete reference images"
ON storage.objects FOR DELETE
USING (bucket_id = 'reference-images' AND EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
));