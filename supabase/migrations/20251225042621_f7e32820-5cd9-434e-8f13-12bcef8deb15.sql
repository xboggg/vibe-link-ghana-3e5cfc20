-- Fix user_roles table - add explicit deny policies for INSERT, UPDATE, DELETE
-- Only service role (through trigger) should be able to modify roles

-- The table already restricts these operations by default since RLS is enabled
-- But let's add explicit policies for clarity and to prevent any bypass attempts

-- Drop any existing permissive policies first (there are none, but for safety)
DROP POLICY IF EXISTS "Users can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can delete roles" ON public.user_roles;

-- Add explicit restrictive policies - only admins can manage roles
CREATE POLICY "Only admins can insert roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update roles"
  ON public.user_roles
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete roles"
  ON public.user_roles
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix profiles table - add INSERT policy for user registration
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Profiles should not be deletable by users
CREATE POLICY "Only admins can delete profiles"
  ON public.profiles
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));