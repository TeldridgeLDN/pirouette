-- ================================================================
-- Pirouette Database Schema - Initial Migration
-- ================================================================
-- Created: 2025-11-23
-- Purpose: Set up core tables for Pirouette landing page analyzer
-- 
-- Tables:
--   1. users - User accounts (synced from Clerk)
--   2. jobs - Analysis job queue and status
--   3. reports - Completed analysis reports with scores
--   4. patterns - Pattern library cache (for future use)
--
-- Storage:
--   - screenshots bucket (created separately via dashboard)
--
-- Security:
--   - RLS policies for user data isolation
--   - Service role for Railway worker operations
-- ================================================================

-- ================================================================
-- 1. USERS TABLE (Clerk-synced)
-- ================================================================
-- Purpose: Store user profile and subscription data
-- Sync: Created/updated via Clerk webhooks
-- Access: Users can read their own data only

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  
  -- Subscription & Plan
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro_29', 'pro_49', 'agency')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  -- Usage Tracking
  analyses_this_month INTEGER DEFAULT 0 CHECK (analyses_this_month >= 0),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts synced from Clerk authentication';
COMMENT ON COLUMN users.clerk_id IS 'Clerk user ID for authentication mapping';
COMMENT ON COLUMN users.plan IS 'Subscription tier: free (1/week), pro_29 (unlimited), pro_49 (priority), agency (bulk)';
COMMENT ON COLUMN users.analyses_this_month IS 'Usage counter, resets monthly';

-- ================================================================
-- 2. JOBS TABLE (Analysis Queue)
-- ================================================================
-- Purpose: Track analysis job lifecycle from submission to completion
-- Flow: queued → processing → completed/failed
-- Access: Users can view their own jobs, Railway worker can update all

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  
  -- Job Status
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  current_step TEXT, -- e.g., 'screenshot', 'analysis', 'upload'
  
  -- Error Handling
  error TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_user_status ON jobs(user_id, status); -- Composite for dashboard queries

-- Comments
COMMENT ON TABLE jobs IS 'Analysis job queue and status tracking';
COMMENT ON COLUMN jobs.status IS 'Job lifecycle: queued → processing → completed/failed';
COMMENT ON COLUMN jobs.progress IS 'Analysis progress percentage (0-100)';
COMMENT ON COLUMN jobs.current_step IS 'Current analysis step for user feedback';

-- ================================================================
-- 3. REPORTS TABLE (Completed Analyses)
-- ================================================================
-- Purpose: Store complete analysis results with scores and recommendations
-- Created: When Railway worker completes analysis
-- Access: Users can view their own reports

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID UNIQUE NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  screenshot_url TEXT, -- Supabase Storage URL
  
  -- Individual Dimension Scores (0-100)
  overall_score INTEGER CHECK (overall_score BETWEEN 0 AND 100),
  colors_score INTEGER CHECK (colors_score BETWEEN 0 AND 100),
  whitespace_score INTEGER CHECK (whitespace_score BETWEEN 0 AND 100),
  complexity_score INTEGER CHECK (complexity_score BETWEEN 0 AND 100),
  typography_score INTEGER CHECK (typography_score BETWEEN 0 AND 100),
  layout_score INTEGER CHECK (layout_score BETWEEN 0 AND 100),
  cta_score INTEGER CHECK (cta_score BETWEEN 0 AND 100),
  hierarchy_score INTEGER CHECK (hierarchy_score BETWEEN 0 AND 100),
  
  -- Detailed Analysis Results (JSONB)
  dimensions JSONB NOT NULL, -- Full dimensional analysis with pattern matches
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb, -- Prioritized recommendations array
  
  -- Metadata
  analysis_time INTEGER, -- Milliseconds
  version TEXT DEFAULT '1.0.0', -- Analyzer version for backwards compatibility
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_job_id ON reports(job_id);
CREATE INDEX IF NOT EXISTS idx_reports_url ON reports(url);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_overall_score ON reports(overall_score); -- For leaderboards

-- JSONB indexes for faster queries on nested data
CREATE INDEX IF NOT EXISTS idx_reports_dimensions ON reports USING GIN (dimensions);
CREATE INDEX IF NOT EXISTS idx_reports_recommendations ON reports USING GIN (recommendations);

-- Comments
COMMENT ON TABLE reports IS 'Completed analysis reports with scores and recommendations';
COMMENT ON COLUMN reports.dimensions IS 'Full analysis results: colors, typography, CTAs, complexity, whitespace, layout, hierarchy';
COMMENT ON COLUMN reports.recommendations IS 'Array of prioritized recommendations with effort/impact estimates';
COMMENT ON COLUMN reports.analysis_time IS 'Time taken to complete analysis in milliseconds';

-- ================================================================
-- 4. PATTERNS TABLE (Pattern Library Cache)
-- ================================================================
-- Purpose: Cache design patterns extracted from award-winning sites
-- Updated: Weekly via Railway cron job (future feature)
-- Access: Public read, Railway worker write

CREATE TABLE IF NOT EXISTS patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dimension TEXT NOT NULL CHECK (dimension IN ('colors', 'whitespace', 'complexity', 'typography', 'layout', 'cta', 'hierarchy')),
  pattern_data JSONB NOT NULL,
  
  -- Source Metadata
  source TEXT, -- 'dribbble' | 'awwwards' | 'siteinspire' | 'manual'
  designs_analyzed INTEGER DEFAULT 0,
  prevalence NUMERIC(5,4) CHECK (prevalence BETWEEN 0 AND 1), -- 0.0 to 1.0
  
  -- Versioning
  version TEXT DEFAULT '1.0',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_patterns_dimension ON patterns(dimension);
CREATE INDEX IF NOT EXISTS idx_patterns_updated_at ON patterns(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_patterns_prevalence ON patterns(prevalence DESC); -- For popular patterns
CREATE INDEX IF NOT EXISTS idx_patterns_data ON patterns USING GIN (pattern_data); -- JSONB search

-- Comments
COMMENT ON TABLE patterns IS 'Design pattern library cache from award-winning sites';
COMMENT ON COLUMN patterns.dimension IS 'Analysis dimension this pattern belongs to';
COMMENT ON COLUMN patterns.prevalence IS 'How common this pattern is (0.0-1.0, higher = more common)';
COMMENT ON COLUMN patterns.designs_analyzed IS 'Number of sites this pattern was extracted from';

-- ================================================================
-- FUNCTIONS & TRIGGERS
-- ================================================================

-- Function: Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: jobs table
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: patterns table
CREATE TRIGGER update_patterns_updated_at
  BEFORE UPDATE ON patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- INITIAL DATA (Optional)
-- ================================================================

-- Seed with a test user (optional, can be created via Clerk)
-- INSERT INTO users (clerk_id, email, name, plan)
-- VALUES ('user_test123', 'test@example.com', 'Test User', 'free')
-- ON CONFLICT (clerk_id) DO NOTHING;

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================
-- Run these after migration to verify schema:
--
-- SELECT table_name, column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- ORDER BY table_name, ordinal_position;
--
-- SELECT tablename, indexname, indexdef 
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, indexname;
-- ================================================================



