-- Create all missing tables for VibeLink Admin Panel
-- Run this in Supabase SQL Editor to create tables that don't exist

-- ============================================
-- ABANDONED CARTS TABLE
-- ============================================
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

ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert abandoned carts" ON abandoned_carts;
DROP POLICY IF EXISTS "Public can update abandoned carts" ON abandoned_carts;
DROP POLICY IF EXISTS "Authenticated can read abandoned carts" ON abandoned_carts;

CREATE POLICY "Public can insert abandoned carts" ON abandoned_carts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update abandoned carts" ON abandoned_carts FOR UPDATE USING (true);
CREATE POLICY "Authenticated can read abandoned carts" ON abandoned_carts FOR SELECT USING (auth.role() = 'authenticated');


-- ============================================
-- AI GENERATED CONTENT TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ai_generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  prompt_used TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_generated_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can manage ai content" ON ai_generated_content;
CREATE POLICY "Authenticated can manage ai content" ON ai_generated_content FOR ALL USING (auth.role() = 'authenticated');


-- ============================================
-- APP SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can manage app settings" ON app_settings;
CREATE POLICY "Authenticated can manage app settings" ON app_settings FOR ALL USING (auth.role() = 'authenticated');


-- ============================================
-- CHATBOT ESCALATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chatbot_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  escalation_reason TEXT NOT NULL,
  conversation_summary TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  assigned_to TEXT,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chatbot_escalations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can create escalations" ON chatbot_escalations;
DROP POLICY IF EXISTS "Authenticated can manage escalations" ON chatbot_escalations;

CREATE POLICY "Public can create escalations" ON chatbot_escalations FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can manage escalations" ON chatbot_escalations FOR ALL USING (auth.role() = 'authenticated');


-- ============================================
-- DATA EXPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS data_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  export_type TEXT NOT NULL,
  format TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  filters JSONB DEFAULT '{}',
  file_url TEXT,
  file_size INTEGER,
  records_count INTEGER,
  requested_by TEXT,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE data_exports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can manage exports" ON data_exports;
CREATE POLICY "Authenticated can manage exports" ON data_exports FOR ALL USING (auth.role() = 'authenticated');


-- ============================================
-- EXPENSE CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can manage expense categories" ON expense_categories;
CREATE POLICY "Authenticated can manage expense categories" ON expense_categories FOR ALL USING (auth.role() = 'authenticated');

-- Insert default expense categories
INSERT INTO expense_categories (name, icon, color) VALUES
  ('Design Tools', 'palette', '#8B5CF6'),
  ('Marketing', 'megaphone', '#F59E0B'),
  ('Software', 'code', '#3B82F6'),
  ('Operations', 'settings', '#10B981'),
  ('Other', 'more-horizontal', '#6B7280')
ON CONFLICT DO NOTHING;


-- ============================================
-- EXPENSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  category_id UUID REFERENCES expense_categories(id),
  order_id UUID REFERENCES orders(id),
  expense_date DATE DEFAULT CURRENT_DATE,
  payment_method TEXT,
  receipt_url TEXT,
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can manage expenses" ON expenses;
CREATE POLICY "Authenticated can manage expenses" ON expenses FOR ALL USING (auth.role() = 'authenticated');


-- ============================================
-- FINANCIAL REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS financial_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_revenue NUMERIC(10,2),
  total_expenses NUMERIC(10,2),
  net_profit NUMERIC(10,2),
  orders_count INTEGER,
  report_data JSONB DEFAULT '{}',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  sent_to_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE financial_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can manage reports" ON financial_reports;
CREATE POLICY "Authenticated can manage reports" ON financial_reports FOR ALL USING (auth.role() = 'authenticated');


-- ============================================
-- FOLLOW UP SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS follow_up_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follow_up_type TEXT NOT NULL UNIQUE,
  enabled BOOLEAN DEFAULT TRUE,
  days_after INTEGER DEFAULT 3,
  email_subject TEXT NOT NULL,
  email_template TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE follow_up_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can manage follow up settings" ON follow_up_settings;
CREATE POLICY "Authenticated can manage follow up settings" ON follow_up_settings FOR ALL USING (auth.role() = 'authenticated');

-- Insert default follow-up settings
INSERT INTO follow_up_settings (follow_up_type, email_subject, email_template, days_after) VALUES
  ('order_confirmation', 'Thank you for your order!', 'Your order has been received and we are working on it.', 0),
  ('payment_reminder', 'Payment Reminder - Your VibeLink Order', 'Just a friendly reminder about your pending payment.', 3),
  ('feedback_request', 'How was your experience?', 'We hope you loved your invitation! Please share your feedback.', 7)
ON CONFLICT (follow_up_type) DO NOTHING;


-- ============================================
-- INVOICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  order_id UUID REFERENCES orders(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_address TEXT,
  subtotal NUMERIC(10,2) NOT NULL,
  tax NUMERIC(10,2) DEFAULT 0,
  discount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'draft',
  due_date DATE,
  notes TEXT,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_order ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can manage invoices" ON invoices;
CREATE POLICY "Authenticated can manage invoices" ON invoices FOR ALL USING (auth.role() = 'authenticated');


-- ============================================
-- INVOICE ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);

ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can manage invoice items" ON invoice_items;
CREATE POLICY "Authenticated can manage invoice items" ON invoice_items FOR ALL USING (auth.role() = 'authenticated');


-- ============================================
-- ORDER TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS order_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL,
  package_name TEXT NOT NULL,
  base_price NUMERIC(10,2),
  default_options JSONB DEFAULT '{}',
  customer_name TEXT,
  customer_email TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE order_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can manage templates" ON order_templates;
CREATE POLICY "Authenticated can manage templates" ON order_templates FOR ALL USING (auth.role() = 'authenticated');


-- ============================================
-- SURVEYS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_surveys_token ON surveys(token);
CREATE INDEX IF NOT EXISTS idx_surveys_order ON surveys(order_id);

ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view own survey" ON surveys;
DROP POLICY IF EXISTS "Authenticated can manage surveys" ON surveys;

CREATE POLICY "Public can view own survey" ON surveys FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage surveys" ON surveys FOR ALL USING (auth.role() = 'authenticated');


-- ============================================
-- SURVEY RESPONSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  overall_rating INTEGER NOT NULL,
  design_quality INTEGER,
  delivery_speed INTEGER,
  communication INTEGER,
  value_for_money INTEGER,
  feedback_text TEXT,
  allow_testimonial BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_survey_responses_survey ON survey_responses(survey_id);

ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit response" ON survey_responses;
DROP POLICY IF EXISTS "Authenticated can read responses" ON survey_responses;

CREATE POLICY "Public can submit response" ON survey_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can read responses" ON survey_responses FOR SELECT USING (auth.role() = 'authenticated');


-- ============================================
-- PAYMENT PLANS TABLE
-- ============================================
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

ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active plans" ON payment_plans;
DROP POLICY IF EXISTS "Authenticated can manage plans" ON payment_plans;

CREATE POLICY "Public can read active plans" ON payment_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated can manage plans" ON payment_plans FOR ALL USING (auth.role() = 'authenticated');

-- Insert default payment plans
INSERT INTO payment_plans (name, installments, interval_days, first_payment_percent, description) VALUES
  ('Pay in Full', 1, 0, 100, 'Pay the full amount now'),
  ('2 Installments', 2, 14, 50, '50% now, 50% in 2 weeks'),
  ('3 Installments', 3, 7, 40, '40% now, then 30% weekly'),
  ('Deposit + Balance', 2, 0, 30, '30% deposit now, 70% before delivery')
ON CONFLICT DO NOTHING;


-- ============================================
-- PAGE VIEWS TABLE (Analytics)
-- ============================================
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  session_id TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  country TEXT,
  city TEXT,
  screen_width INTEGER,
  screen_height INTEGER,
  time_spent INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert page views" ON page_views;
DROP POLICY IF EXISTS "Authenticated can read page views" ON page_views;

CREATE POLICY "Public can insert page views" ON page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can read page views" ON page_views FOR SELECT USING (auth.role() = 'authenticated');


-- ============================================
-- TEAM MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  bio TEXT,
  photo_url TEXT,
  social_facebook TEXT,
  social_twitter TEXT,
  social_instagram TEXT,
  social_linkedin TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active members" ON team_members;
DROP POLICY IF EXISTS "Authenticated can manage members" ON team_members;

CREATE POLICY "Public can read active members" ON team_members FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated can manage members" ON team_members FOR ALL USING (auth.role() = 'authenticated');


-- ============================================
-- TESTIMONIALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  quote TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  image_url TEXT,
  featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read testimonials" ON testimonials;
DROP POLICY IF EXISTS "Authenticated can manage testimonials" ON testimonials;

CREATE POLICY "Public can read testimonials" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage testimonials" ON testimonials FOR ALL USING (auth.role() = 'authenticated');


-- ============================================
-- Success message
-- ============================================
SELECT 'All tables created successfully!' as status;
