-- ================================================================
-- Pirouette Database Schema - Anonymous Analyses
-- ================================================================
-- Created: 2025-11-28
-- Purpose: Enable anonymous users to try the analysis feature
-- 
-- PRD Requirement: "No signup required for first analysis (reduce friction)"
-- Rate Limit: 1 analysis per IP per day for anonymous users
--
-- Tables:
--   1. anonymous_analyses - Track anonymous analysis requests by IP
--
-- Note: Anonymous jobs still go through the regular jobs table,
--       but with user_id nullable. This table tracks rate limits.
-- ================================================================

-- ================================================================
-- 1. ANONYMOUS ANALYSES TABLE (Rate Limiting for Anonymous Users)
-- ================================================================
-- Purpose: Track anonymous analysis submissions by IP address
-- Used for: IP-based rate limiting (1/day for anonymous users)
-- Access: Internal only (service role)

CREATE TABLE IF NOT EXISTS anonymous_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  url TEXT NOT NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  
  -- Fingerprint for more accurate tracking (optional)
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for rate limit queries
CREATE INDEX IF NOT EXISTS idx_anonymous_analyses_ip 
  ON anonymous_analyses(ip_address);
CREATE INDEX IF NOT EXISTS idx_anonymous_analyses_ip_created 
  ON anonymous_analyses(ip_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_anonymous_analyses_created 
  ON anonymous_analyses(created_at DESC);

-- Comments
COMMENT ON TABLE anonymous_analyses IS 'Tracks anonymous analysis requests for IP-based rate limiting';
COMMENT ON COLUMN anonymous_analyses.ip_address IS 'Client IP address (from x-forwarded-for header)';
COMMENT ON COLUMN anonymous_analyses.job_id IS 'Reference to the analysis job (nullable if job deleted)';

-- ================================================================
-- 2. MODIFY JOBS TABLE - Allow Nullable user_id
-- ================================================================
-- Purpose: Allow anonymous users to create jobs
-- Change: user_id becomes nullable, add ip_address field

-- First, drop the NOT NULL constraint on user_id
ALTER TABLE jobs 
  ALTER COLUMN user_id DROP NOT NULL;

-- Add ip_address column for anonymous tracking
ALTER TABLE jobs 
  ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- Add index for IP-based queries
CREATE INDEX IF NOT EXISTS idx_jobs_ip_address 
  ON jobs(ip_address) 
  WHERE user_id IS NULL;

-- Update comments
COMMENT ON COLUMN jobs.user_id IS 'User ID (nullable for anonymous analyses)';
COMMENT ON COLUMN jobs.ip_address IS 'Client IP for anonymous analyses';

-- ================================================================
-- 3. MODIFY REPORTS TABLE - Allow Nullable user_id
-- ================================================================
-- Purpose: Anonymous users can also receive reports

-- Drop the NOT NULL constraint on user_id
ALTER TABLE reports 
  ALTER COLUMN user_id DROP NOT NULL;

-- Add ip_address column for anonymous tracking
ALTER TABLE reports 
  ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- Add email_captured flag for conversion tracking
ALTER TABLE reports 
  ADD COLUMN IF NOT EXISTS email_captured BOOLEAN DEFAULT FALSE;

-- Add captured_email for when users provide email after viewing report
ALTER TABLE reports 
  ADD COLUMN IF NOT EXISTS captured_email TEXT;

-- Update comments
COMMENT ON COLUMN reports.user_id IS 'User ID (nullable for anonymous analyses)';
COMMENT ON COLUMN reports.ip_address IS 'Client IP for anonymous analyses';
COMMENT ON COLUMN reports.email_captured IS 'Whether user provided email after viewing report';
COMMENT ON COLUMN reports.captured_email IS 'Email address if captured after anonymous analysis';

-- ================================================================
-- 4. RLS POLICIES FOR ANONYMOUS ACCESS
-- ================================================================

-- Allow anonymous users to view their own reports by job_id (passed in URL)
-- Note: This is handled at the application level for security

-- ================================================================
-- 5. CLEANUP FUNCTION
-- ================================================================
-- Purpose: Delete old anonymous tracking data (GDPR compliance)
-- Run: Via cron job (e.g., pg_cron or external scheduler)

CREATE OR REPLACE FUNCTION cleanup_old_anonymous_analyses()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete anonymous tracking records older than 30 days
  DELETE FROM anonymous_analyses 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_anonymous_analyses IS 'Removes anonymous tracking data older than 30 days for GDPR compliance';

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================
-- Run these after migration to verify changes:
--
-- Check anonymous_analyses table exists:
-- SELECT * FROM anonymous_analyses LIMIT 0;
--
-- Verify jobs.user_id is nullable:
-- SELECT column_name, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'jobs' AND column_name = 'user_id';
--
-- Verify reports.user_id is nullable:
-- SELECT column_name, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'reports' AND column_name = 'user_id';
-- ================================================================

