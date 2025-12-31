-- Add priority field to orders table
-- Priority levels: 1 (urgent), 2 (high), 3 (normal), 4 (low)

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS priority_reason TEXT,
ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(4,1);

-- Create index for priority ordering
CREATE INDEX IF NOT EXISTS idx_orders_priority_status 
  ON orders(priority, order_status, created_at);

CREATE INDEX IF NOT EXISTS idx_orders_due_date 
  ON orders(due_date) WHERE due_date IS NOT NULL;

-- Add check constraint for priority values
ALTER TABLE orders 
ADD CONSTRAINT check_priority_range 
CHECK (priority >= 1 AND priority <= 4);

-- Function to auto-calculate priority based on event date
CREATE OR REPLACE FUNCTION calculate_order_priority()
RETURNS TRIGGER AS $$
DECLARE
  days_until_event INTEGER;
BEGIN
  -- Only auto-set priority if not manually set
  IF NEW.priority IS NULL OR NEW.priority = 3 THEN
    IF NEW.event_date IS NOT NULL THEN
      days_until_event := EXTRACT(DAY FROM (NEW.event_date::timestamp - NOW()));
      
      IF days_until_event <= 3 THEN
        NEW.priority := 1; -- Urgent
        NEW.priority_reason := 'Event in ' || days_until_event || ' days';
      ELSIF days_until_event <= 7 THEN
        NEW.priority := 2; -- High
        NEW.priority_reason := 'Event within a week';
      ELSIF days_until_event <= 14 THEN
        NEW.priority := 3; -- Normal
        NEW.priority_reason := 'Event within 2 weeks';
      ELSE
        NEW.priority := 4; -- Low
        NEW.priority_reason := 'Event more than 2 weeks away';
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-priority
DROP TRIGGER IF EXISTS auto_priority_trigger ON orders;
CREATE TRIGGER auto_priority_trigger
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION calculate_order_priority();

-- Comment for reference
COMMENT ON COLUMN orders.priority IS 'Priority level: 1=urgent, 2=high, 3=normal, 4=low';
