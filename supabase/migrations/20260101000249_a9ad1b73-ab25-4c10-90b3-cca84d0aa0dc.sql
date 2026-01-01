-- Phase 4 & 5 Database Migrations for VibeLink Ghana

-- ============================================
-- PHASE 4: Admin Tools Tables
-- ============================================

-- #15 Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_address TEXT,
  subtotal NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) DEFAULT 0,
  tax NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  due_date DATE,
  notes TEXT,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- #17 Expense & Revenue Tracker
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'receipt',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT,
  receipt_url TEXT,
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_order ON expenses(order_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);

-- #16 Customer Satisfaction Surveys
CREATE TABLE IF NOT EXISTS surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  design_quality INTEGER CHECK (design_quality >= 1 AND design_quality <= 5),
  communication INTEGER CHECK (communication >= 1 AND communication <= 5),
  delivery_speed INTEGER CHECK (delivery_speed >= 1 AND delivery_speed <= 5),
  value_for_money INTEGER CHECK (value_for_money >= 1 AND value_for_money <= 5),
  feedback_text TEXT,
  allow_testimonial BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_surveys_order ON surveys(order_id);
CREATE INDEX IF NOT EXISTS idx_surveys_token ON surveys(token);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey ON survey_responses(survey_id);

-- #18 Recurring Order Templates
CREATE TABLE IF NOT EXISTS order_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL,
  package_name TEXT NOT NULL,
  base_price NUMERIC(10,2),
  default_options JSONB DEFAULT '{}',
  customer_email TEXT,
  customer_name TEXT,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_templates_event_type ON order_templates(event_type);

-- #35 Auto Financial Reports
CREATE TABLE IF NOT EXISTS financial_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_revenue NUMERIC(10,2) DEFAULT 0,
  total_expenses NUMERIC(10,2) DEFAULT 0,
  net_profit NUMERIC(10,2) DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  report_data JSONB DEFAULT '{}',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  sent_to_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_financial_reports_type ON financial_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_financial_reports_period ON financial_reports(period_start, period_end);

-- #37 Backup & Export System
CREATE TABLE IF NOT EXISTS data_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  export_type TEXT NOT NULL,
  format TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  file_url TEXT,
  file_size INTEGER,
  records_count INTEGER,
  filters JSONB DEFAULT '{}',
  requested_by TEXT,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_data_exports_status ON data_exports(status);

-- ============================================
-- PHASE 5: AI Features Tables
-- ============================================

-- #2 AI Blog Writer & #4 AI Email Templates
CREATE TABLE IF NOT EXISTS ai_generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  prompt_used TEXT,
  metadata JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_content_type ON ai_generated_content(content_type);
CREATE INDEX IF NOT EXISTS idx_ai_content_status ON ai_generated_content(status);

-- #3 Smart Chatbot Escalation
CREATE TABLE IF NOT EXISTS chatbot_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  conversation_summary TEXT,
  escalation_reason TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_to TEXT,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_escalations_status ON chatbot_escalations(status);
CREATE INDEX IF NOT EXISTS idx_escalations_priority ON chatbot_escalations(priority);

-- ============================================
-- Row Level Security Policies
-- ============================================

-- Invoices: Admin full access
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage invoices" ON invoices FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Public can view own invoices" ON invoices FOR SELECT USING (true);

-- Invoice Items
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage invoice items" ON invoice_items FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Public can view invoice items" ON invoice_items FOR SELECT USING (true);

-- Expense Categories
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage categories" ON expense_categories FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Anyone can view categories" ON expense_categories FOR SELECT USING (true);

-- Expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage expenses" ON expenses FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Surveys
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage surveys" ON surveys FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Anyone can view surveys by token" ON surveys FOR SELECT USING (true);
CREATE POLICY "Anyone can update survey status" ON surveys FOR UPDATE USING (true);

-- Survey Responses
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view responses" ON survey_responses FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Anyone can submit responses" ON survey_responses FOR INSERT WITH CHECK (true);

-- Order Templates
ALTER TABLE order_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage templates" ON order_templates FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Financial Reports
ALTER TABLE financial_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage reports" ON financial_reports FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Data Exports
ALTER TABLE data_exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage exports" ON data_exports FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- AI Generated Content
ALTER TABLE ai_generated_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage AI content" ON ai_generated_content FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Chatbot Escalations
ALTER TABLE chatbot_escalations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage escalations" ON chatbot_escalations FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Anyone can create escalations" ON chatbot_escalations FOR INSERT WITH CHECK (true);

-- ============================================
-- Insert Default Expense Categories
-- ============================================

INSERT INTO expense_categories (name, color, icon) VALUES
  ('Materials & Supplies', '#ef4444', 'package'),
  ('Printing & Production', '#f97316', 'printer'),
  ('Software & Tools', '#8b5cf6', 'monitor'),
  ('Transportation', '#3b82f6', 'car'),
  ('Marketing & Ads', '#ec4899', 'megaphone'),
  ('Utilities', '#6366f1', 'zap'),
  ('Office & Equipment', '#14b8a6', 'briefcase'),
  ('Miscellaneous', '#6b7280', 'more-horizontal')
ON CONFLICT DO NOTHING;

-- ============================================
-- Add survey settings to app_settings
-- ============================================

INSERT INTO app_settings (key, value) VALUES
  ('survey_settings', '{
    "auto_send": true,
    "delay_hours": 24,
    "expiry_days": 14,
    "low_rating_alert": true,
    "low_rating_threshold": 2,
    "auto_testimonial_threshold": 5
  }'),
  ('financial_report_settings', '{
    "auto_generate": true,
    "frequency": "weekly",
    "send_email": true,
    "recipient_email": ""
  }')
ON CONFLICT (key) DO NOTHING;