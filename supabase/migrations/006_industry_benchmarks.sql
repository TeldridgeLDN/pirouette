-- Migration: Create industry_benchmarks table
-- Purpose: Store aggregate statistics for industry benchmarking

-- Create industry_benchmarks table
CREATE TABLE IF NOT EXISTS industry_benchmarks (
  industry TEXT PRIMARY KEY,
  total_analyses INTEGER NOT NULL DEFAULT 0,
  avg_overall_score NUMERIC(5,2),
  avg_colors_score NUMERIC(5,2),
  avg_typography_score NUMERIC(5,2),
  avg_whitespace_score NUMERIC(5,2),
  avg_complexity_score NUMERIC(5,2),
  avg_layout_score NUMERIC(5,2),
  avg_cta_score NUMERIC(5,2),
  avg_hierarchy_score NUMERIC(5,2),
  min_overall_score NUMERIC(5,2),
  max_overall_score NUMERIC(5,2),
  score_std_dev NUMERIC(5,2),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE industry_benchmarks IS 'Aggregate statistics for industry benchmarking. Updated after each analysis.';
COMMENT ON COLUMN industry_benchmarks.industry IS 'Industry category: saas, ecommerce, agency, blog, marketplace, finance, health, education, other';
COMMENT ON COLUMN industry_benchmarks.total_analyses IS 'Number of analyses in this industry (used for confidence)';
COMMENT ON COLUMN industry_benchmarks.score_std_dev IS 'Standard deviation of overall scores (for percentile calculation)';

-- Insert initial industry rows (will be updated as analyses come in)
INSERT INTO industry_benchmarks (industry) VALUES 
  ('saas'),
  ('ecommerce'),
  ('agency'),
  ('blog'),
  ('marketplace'),
  ('finance'),
  ('health'),
  ('education'),
  ('other')
ON CONFLICT (industry) DO NOTHING;

-- Add industry column to reports table (if not exists)
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS industry TEXT DEFAULT 'other';

-- Add industry column to jobs table (if not exists)
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS industry TEXT DEFAULT 'other';

-- Create index for industry lookups
CREATE INDEX IF NOT EXISTS idx_reports_industry ON reports(industry);
CREATE INDEX IF NOT EXISTS idx_jobs_industry ON jobs(industry);

-- Enable RLS on industry_benchmarks (read-only for all)
ALTER TABLE industry_benchmarks ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read benchmarks
CREATE POLICY "Anyone can read benchmarks"
  ON industry_benchmarks FOR SELECT
  USING (true);

-- Policy: Only service role can update benchmarks
CREATE POLICY "Service role can update benchmarks"
  ON industry_benchmarks FOR ALL
  USING (auth.role() = 'service_role');

