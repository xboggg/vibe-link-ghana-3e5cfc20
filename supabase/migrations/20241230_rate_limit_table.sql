-- Rate Limit Logs Table
-- Used for server-side rate limiting

CREATE TABLE IF NOT EXISTS rate_limit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  action TEXT NOT NULL,
  client_ip TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_rate_limit_identifier_created 
  ON rate_limit_logs(identifier, created_at DESC);

-- Index for cleanup
CREATE INDEX IF NOT EXISTS idx_rate_limit_created_at 
  ON rate_limit_logs(created_at);

-- RLS Policies
ALTER TABLE rate_limit_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can access
CREATE POLICY "Service role can manage rate limits" ON rate_limit_logs
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Cleanup function for old logs (run daily via cron)
CREATE OR REPLACE FUNCTION cleanup_rate_limit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limit_logs 
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment for reference
COMMENT ON TABLE rate_limit_logs IS 'Stores rate limiting request logs for abuse prevention';
