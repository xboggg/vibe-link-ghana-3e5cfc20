-- Create function to increment open count
CREATE OR REPLACE FUNCTION increment_campaign_open_count(campaign_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE newsletter_campaigns
  SET open_count = COALESCE(open_count, 0) + 1
  WHERE id = campaign_uuid;
END;
$$;

-- Create function to increment click count
CREATE OR REPLACE FUNCTION increment_campaign_click_count(campaign_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE newsletter_campaigns
  SET click_count = COALESCE(click_count, 0) + 1
  WHERE id = campaign_uuid;
END;
$$;