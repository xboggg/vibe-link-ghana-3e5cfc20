-- =====================================================
-- SECURITY FIX: Restrict access to sensitive data
-- Created: 2025-12-30
-- =====================================================

-- 1. FIX: Orders table - Remove overly permissive policy that exposes all customer data
-- The policy "Anyone can view their order by ID or email" with USING (true) allows
-- anyone to read ALL orders, exposing customer emails, phones, and names
DROP POLICY IF EXISTS "Anyone can view their order by ID or email" ON public.orders;

-- We keep the secure RPC function get_order_by_id which requires email verification
-- Admins can still view all orders via their existing policy

-- 2. FIX: Newsletter tracking - restrict insert to service role only
DROP POLICY IF EXISTS "Anyone can insert tracking events" ON public.newsletter_tracking;

CREATE POLICY "Service role can insert tracking" ON public.newsletter_tracking
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- 3. FIX: Ensure newsletter_subscribers has no public read access
DROP POLICY IF EXISTS "Anyone can view subscribers" ON public.newsletter_subscribers;

-- 4. Create audit log table for security monitoring
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  user_id UUID,
  ip_address TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins can view audit logs" ON public.security_audit_log;
CREATE POLICY "Only admins can view audit logs" ON public.security_audit_log
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.security_audit_log;  
CREATE POLICY "Service role can insert audit logs" ON public.security_audit_log
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE INDEX IF NOT EXISTS idx_security_audit_created 
  ON public.security_audit_log(created_at DESC);

-- 5. FIX: Reference images - make bucket private, only accessible via signed URLs
-- Note: This needs to be done in Supabase dashboard or via API
-- UPDATE storage.buckets SET public = false WHERE id = 'reference-images';

COMMENT ON TABLE public.security_audit_log IS 'Audit trail for security-sensitive operations';
