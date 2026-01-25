-- Fix RLS policies for coupons table to allow admin access
-- The issue is that admins couldn't read all coupons due to restrictive policies
-- This migration was applied manually via Supabase SQL Editor on 2026-01-24

-- NOTE: The coupons table and policies were created manually.
-- This file is kept for reference and future deployments.


-- Fix RLS policies for abandoned_carts table (similar issue)
DROP POLICY IF EXISTS "Admins can read abandoned carts" ON abandoned_carts;
DROP POLICY IF EXISTS "Anyone can insert abandoned carts" ON abandoned_carts;
DROP POLICY IF EXISTS "Anyone can update own cart" ON abandoned_carts;

-- Allow public to insert/update abandoned carts (for tracking)
CREATE POLICY "Public can insert abandoned carts" ON abandoned_carts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update abandoned carts" ON abandoned_carts
  FOR UPDATE USING (true);

-- Allow authenticated users to read all abandoned carts (for admin)
CREATE POLICY "Authenticated can read abandoned carts" ON abandoned_carts
  FOR SELECT USING (auth.role() = 'authenticated');


-- Fix RLS policies for payment_plans table
DROP POLICY IF EXISTS "Anyone can read active payment plans" ON payment_plans;
DROP POLICY IF EXISTS "Admins can manage payment plans" ON payment_plans;

-- Allow public to read active payment plans
CREATE POLICY "Public can read active payment plans" ON payment_plans
  FOR SELECT USING (is_active = true);

-- Allow authenticated users to manage all payment plans
CREATE POLICY "Authenticated can manage payment plans" ON payment_plans
  FOR ALL USING (auth.role() = 'authenticated');


-- Fix RLS policies for app_settings table
DROP POLICY IF EXISTS "Admins can manage settings" ON app_settings;

-- Allow authenticated users to manage app settings
CREATE POLICY "Authenticated can manage app settings" ON app_settings
  FOR ALL USING (auth.role() = 'authenticated');
