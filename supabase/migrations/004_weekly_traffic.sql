-- ================================================================
-- Pirouette Database Schema - Weekly Traffic Support
-- ================================================================
-- Created: 2025-11-28
-- Purpose: Add weekly traffic field for contextual recommendations
-- 
-- PRD Reference: Task 28 - Traffic-Based Conditional Recommendations
-- "Implement context-aware advice that adapts based on user's traffic volume"
--
-- Usage:
--   - Users can optionally provide their weekly visitor count
--   - This data is used to:
--     - Adjust revenue estimate confidence levels
--     - Provide traffic-appropriate testing strategies
--     - Sort recommendations by ease (for very low traffic) or ROI
--     - Set realistic validation timeframes
-- ================================================================

-- ================================================================
-- 1. ADD weekly_traffic TO JOBS TABLE
-- ================================================================
-- Purpose: Store traffic data when analysis job is created
-- Type: INTEGER (weekly visitor count)
-- Nullable: Yes (optional field)

ALTER TABLE jobs 
  ADD COLUMN IF NOT EXISTS weekly_traffic INTEGER CHECK (weekly_traffic >= 0);

CREATE INDEX IF NOT EXISTS idx_jobs_weekly_traffic 
  ON jobs(weekly_traffic) 
  WHERE weekly_traffic IS NOT NULL;

COMMENT ON COLUMN jobs.weekly_traffic IS 'Weekly visitor count for traffic-aware recommendations';

-- ================================================================
-- 2. ADD weekly_traffic TO REPORTS TABLE
-- ================================================================
-- Purpose: Store traffic data with report for historical context
-- Copied from job when report is created

ALTER TABLE reports 
  ADD COLUMN IF NOT EXISTS weekly_traffic INTEGER CHECK (weekly_traffic >= 0);

CREATE INDEX IF NOT EXISTS idx_reports_weekly_traffic 
  ON reports(weekly_traffic) 
  WHERE weekly_traffic IS NOT NULL;

COMMENT ON COLUMN reports.weekly_traffic IS 'Weekly visitor count at time of analysis';

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================
-- Run these after migration to verify changes:
--
-- Check jobs.weekly_traffic exists:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'jobs' AND column_name = 'weekly_traffic';
--
-- Check reports.weekly_traffic exists:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'reports' AND column_name = 'weekly_traffic';
-- ================================================================


