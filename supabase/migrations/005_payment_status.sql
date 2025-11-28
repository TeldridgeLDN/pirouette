-- Migration: Add payment status fields to users table
-- Purpose: Track payment failures and dunning state for subscription recovery

-- Add payment status fields
ALTER TABLE users
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'active' CHECK (payment_status IN ('active', 'pending', 'failed')),
ADD COLUMN IF NOT EXISTS payment_failed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_retry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_payment_attempt TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN users.payment_status IS 'Payment status: active (ok), pending (grace period), failed (suspended)';
COMMENT ON COLUMN users.payment_failed_at IS 'Timestamp when payment first failed';
COMMENT ON COLUMN users.payment_retry_count IS 'Number of retry attempts for failed payment';
COMMENT ON COLUMN users.last_payment_attempt IS 'Timestamp of most recent payment attempt';

-- Create index for querying users with payment issues
CREATE INDEX IF NOT EXISTS idx_users_payment_status ON users(payment_status) WHERE payment_status != 'active';

