-- Fix revision request submission
-- The INSERT to order_revisions works, but UPDATE to orders fails due to RLS
-- Create secure function to handle both operations

CREATE OR REPLACE FUNCTION public.submit_revision_request(
  p_order_id UUID,
  p_request_text TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_revision_id UUID;
BEGIN
  -- Insert the revision request
  INSERT INTO public.order_revisions (
    order_id,
    request_text,
    status
  ) VALUES (
    p_order_id,
    p_request_text,
    'pending'
  )
  RETURNING id INTO new_revision_id;

  -- Update order status to revision
  UPDATE public.orders
  SET order_status = 'revision',
      updated_at = NOW()
  WHERE id = p_order_id;

  RETURN new_revision_id;
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.submit_revision_request TO anon;
GRANT EXECUTE ON FUNCTION public.submit_revision_request TO authenticated;
