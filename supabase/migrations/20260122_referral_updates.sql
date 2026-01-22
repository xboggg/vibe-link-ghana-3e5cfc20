-- Add MoMo number and payout tracking columns for referral system

-- Add MoMo number to referral_codes table
ALTER TABLE referral_codes
ADD COLUMN IF NOT EXISTS owner_momo_number TEXT;

-- Add payout tracking columns to referrals table
ALTER TABLE referrals
ADD COLUMN IF NOT EXISTS package_name TEXT,
ADD COLUMN IF NOT EXISTS payout_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Add constraint for payout_status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'referrals_payout_status_check'
  ) THEN
    ALTER TABLE referrals
    ADD CONSTRAINT referrals_payout_status_check
    CHECK (payout_status IN ('pending', 'paid'));
  END IF;
END $$;

-- Create index for faster payout queries
CREATE INDEX IF NOT EXISTS idx_referrals_payout_status ON referrals(payout_status);
