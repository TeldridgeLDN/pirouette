-- Migration: Create referrals system
-- Purpose: Enable referral tracking and rewards

-- Add referral_code to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS referral_rewards_earned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS referral_rewards_used INTEGER DEFAULT 0;

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'signed_up', 'upgraded', 'rewarded'
  reward_applied BOOLEAN DEFAULT FALSE,
  referee_email TEXT, -- Stored before they sign up
  created_at TIMESTAMPTZ DEFAULT NOW(),
  signed_up_at TIMESTAMPTZ,
  upgraded_at TIMESTAMPTZ,
  rewarded_at TIMESTAMPTZ
);

-- Create referral_clicks table for analytics
CREATE TABLE IF NOT EXISTS referral_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code TEXT NOT NULL,
  referrer_id UUID REFERENCES users(id),
  ip_hash TEXT, -- Hashed for privacy
  user_agent TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee ON referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_code ON referral_clicks(referral_code);

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_clicks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referrals
CREATE POLICY "Users can view their own referrals as referrer"
  ON referrals FOR SELECT
  USING (referrer_id = auth.uid());

CREATE POLICY "Users can view referrals where they are referee"
  ON referrals FOR SELECT
  USING (referee_id = auth.uid());

CREATE POLICY "Service role can manage all referrals"
  ON referrals FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for referral_clicks (write-only for tracking)
CREATE POLICY "Anyone can insert referral clicks"
  ON referral_clicks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can read referral clicks"
  ON referral_clicks FOR SELECT
  USING (auth.role() = 'service_role');

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- No I, O, 0, 1 for clarity
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate referral code for new users
CREATE OR REPLACE FUNCTION set_user_referral_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  -- Only set if not already set
  IF NEW.referral_code IS NULL THEN
    LOOP
      new_code := generate_referral_code();
      SELECT EXISTS(SELECT 1 FROM users WHERE referral_code = new_code) INTO code_exists;
      EXIT WHEN NOT code_exists;
    END LOOP;
    NEW.referral_code := new_code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_referral_code
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_user_referral_code();

-- Generate referral codes for existing users
UPDATE users 
SET referral_code = generate_referral_code()
WHERE referral_code IS NULL;

-- Comments
COMMENT ON TABLE referrals IS 'Tracks referral relationships and reward status';
COMMENT ON COLUMN referrals.status IS 'pending = link shared, signed_up = referee registered, upgraded = referee became Pro, rewarded = referrer got credit';
COMMENT ON TABLE referral_clicks IS 'Analytics for referral link clicks';

