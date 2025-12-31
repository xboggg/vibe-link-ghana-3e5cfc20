-- Enhanced Analytics Migration
-- Run this in Supabase SQL Editor

-- Add new columns to page_views table
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS device_type TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS browser TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS os TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS screen_width INTEGER;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS screen_height INTEGER;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS time_spent INTEGER;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS city TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_page_views_device ON page_views(device_type);
CREATE INDEX IF NOT EXISTS idx_page_views_browser ON page_views(browser);
CREATE INDEX IF NOT EXISTS idx_page_views_country ON page_views(country);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);

-- Done
SELECT 'Enhanced analytics migration completed!' as status;
