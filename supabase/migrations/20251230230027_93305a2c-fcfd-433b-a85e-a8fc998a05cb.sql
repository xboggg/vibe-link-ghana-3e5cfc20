-- Phase 2 & 3 Database Migrations for VibeLink Ghana

-- ============================================
-- PHASE 2: Customer Experience Tables
-- ============================================

-- Order Timeline Events
CREATE TABLE IF NOT EXISTS order_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_timeline_order_id ON order_timeline(order_id);

-- Order Revisions
CREATE TABLE IF NOT EXISTS order_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  request_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_revisions_order_id ON order_revisions(order_id);

-- Validation trigger for order_revisions status
CREATE OR REPLACE FUNCTION validate_revision_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status NOT IN ('pending', 'in_progress', 'completed') THEN
    RAISE EXCEPTION 'Invalid revision status. Must be pending, in_progress, or completed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_revision_status
  BEFORE INSERT OR UPDATE ON order_revisions
  FOR EACH ROW EXECUTE FUNCTION validate_revision_status();

-- Saved Designs/Favorites
CREATE TABLE IF NOT EXISTS saved_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  design_type TEXT NOT NULL,
  design_name TEXT NOT NULL,
  design_url TEXT,
  preview_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_designs_email ON saved_designs(customer_email);

-- Customer OTP for portal login
CREATE TABLE IF NOT EXISTS customer_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_otps_email ON customer_otps(email);

-- ============================================
-- PHASE 3: Revenue & Marketing Tables
-- ============================================

-- Referral Codes
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  owner_email TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  reward_percentage NUMERIC(5,2) DEFAULT 10,
  total_referrals INTEGER DEFAULT 0,
  successful_referrals INTEGER DEFAULT 0,
  pending_referrals INTEGER DEFAULT 0,
  total_earnings NUMERIC(10,2) DEFAULT 0,
  available_balance NUMERIC(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_email ON referral_codes(owner_email);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);

-- Referrals tracking
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_email TEXT NOT NULL,
  referred_email TEXT NOT NULL,
  referral_code TEXT NOT NULL,
  order_id UUID REFERENCES orders(id),
  status TEXT NOT NULL DEFAULT 'pending',
  reward_amount NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_email);

-- Validation trigger for referrals status
CREATE OR REPLACE FUNCTION validate_referral_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status NOT IN ('pending', 'completed', 'expired') THEN
    RAISE EXCEPTION 'Invalid referral status. Must be pending, completed, or expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_referral_status
  BEFORE INSERT OR UPDATE ON referrals
  FOR EACH ROW EXECUTE FUNCTION validate_referral_status();

-- Coupons/Promo Codes
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL,
  discount_value NUMERIC(10,2) NOT NULL,
  min_order_amount NUMERIC(10,2),
  max_discount NUMERIC(10,2),
  description TEXT,
  usage_limit INTEGER,
  times_used INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- Validation trigger for coupons discount_type
CREATE OR REPLACE FUNCTION validate_coupon_type()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.discount_type NOT IN ('percentage', 'fixed') THEN
    RAISE EXCEPTION 'Invalid discount type. Must be percentage or fixed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_coupon_type
  BEFORE INSERT OR UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION validate_coupon_type();

-- Abandoned Carts
CREATE TABLE IF NOT EXISTS abandoned_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  customer_email TEXT,
  customer_name TEXT,
  event_type TEXT,
  package_name TEXT,
  total_price NUMERIC(10,2),
  cart_data JSONB DEFAULT '{}',
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_sent_at TIMESTAMPTZ,
  recovered BOOLEAN DEFAULT FALSE,
  recovered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_abandoned_carts_email ON abandoned_carts(customer_email);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_session ON abandoned_carts(session_id);

-- Payment Plans
CREATE TABLE IF NOT EXISTS payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  installments INTEGER NOT NULL,
  interval_days INTEGER NOT NULL,
  first_payment_percent NUMERIC(5,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Installments
CREATE TABLE IF NOT EXISTS order_installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES payment_plans(id),
  total_amount NUMERIC(10,2) NOT NULL,
  installments JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_installments_order_id ON order_installments(order_id);

-- App Settings
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Row Level Security Policies
-- ============================================

-- Order Timeline
ALTER TABLE order_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read order timeline" ON order_timeline
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert timeline" ON order_timeline
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update timeline" ON order_timeline
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete timeline" ON order_timeline
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Order Revisions
ALTER TABLE order_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read revisions" ON order_revisions
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create revisions" ON order_revisions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update revisions" ON order_revisions
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Saved Designs
ALTER TABLE saved_designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can manage saved designs" ON saved_designs
  FOR ALL USING (true);

-- Customer OTPs
ALTER TABLE customer_otps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service can manage OTPs" ON customer_otps
  FOR ALL USING (true);

-- Referral Codes
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read referral codes" ON referral_codes
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create referral codes" ON referral_codes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update own referral code" ON referral_codes
  FOR UPDATE USING (true);

-- Referrals
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read referrals" ON referrals
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create referrals" ON referrals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update referrals" ON referrals
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- Coupons
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active coupons" ON coupons
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can read all coupons" ON coupons
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert coupons" ON coupons
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update coupons" ON coupons
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete coupons" ON coupons
  FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Abandoned Carts
ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read abandoned carts" ON abandoned_carts
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert abandoned carts" ON abandoned_carts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update own cart" ON abandoned_carts
  FOR UPDATE USING (true);

-- Payment Plans
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active payment plans" ON payment_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage payment plans" ON payment_plans
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Order Installments
ALTER TABLE order_installments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read installments" ON order_installments
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage installments" ON order_installments
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- App Settings
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage settings" ON app_settings
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- ============================================
-- Insert Default Payment Plans
-- ============================================

INSERT INTO payment_plans (id, name, installments, interval_days, first_payment_percent, description)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Pay in Full', 1, 0, 100, 'Pay the full amount now'),
  ('00000000-0000-0000-0000-000000000002', '2 Installments', 2, 14, 50, '50% now, 50% in 2 weeks'),
  ('00000000-0000-0000-0000-000000000003', '3 Installments', 3, 7, 40, '40% now, then 30% weekly'),
  ('00000000-0000-0000-0000-000000000004', 'Deposit + Balance', 2, 0, 30, '30% deposit now, 70% before delivery')
ON CONFLICT DO NOTHING;

-- ============================================
-- Insert Sample Coupons
-- ============================================

INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, description, valid_until)
VALUES
  ('WELCOME10', 'percentage', 10, 100, 'Welcome discount - 10% off', NOW() + INTERVAL '1 year'),
  ('NEWYEAR2025', 'percentage', 15, 200, 'New Year 2025 Special', '2025-01-31'),
  ('FLAT50', 'fixed', 50, 300, 'GH₵50 off orders above GH₵300', NOW() + INTERVAL '6 months')
ON CONFLICT DO NOTHING;