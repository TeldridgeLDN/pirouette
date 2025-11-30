-- Competitor Analyses table
-- Stores competitor analysis results for Pro users' comparison feature

CREATE TABLE IF NOT EXISTS competitor_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  
  -- Competitor info
  competitor_url TEXT NOT NULL,
  competitor_name TEXT, -- Optional friendly name
  
  -- Analysis scores (same dimensions as main report)
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  colors_score INTEGER CHECK (colors_score >= 0 AND colors_score <= 100),
  whitespace_score INTEGER CHECK (whitespace_score >= 0 AND whitespace_score <= 100),
  complexity_score INTEGER CHECK (complexity_score >= 0 AND complexity_score <= 100),
  typography_score INTEGER CHECK (typography_score >= 0 AND typography_score <= 100),
  layout_score INTEGER CHECK (layout_score >= 0 AND layout_score <= 100),
  cta_score INTEGER CHECK (cta_score >= 0 AND cta_score <= 100),
  hierarchy_score INTEGER CHECK (hierarchy_score >= 0 AND hierarchy_score <= 100),
  
  -- Full analysis results (stored as JSONB for detailed data)
  dimensions JSONB NOT NULL DEFAULT '{}',
  screenshot_url TEXT,
  
  -- Job tracking
  job_id TEXT, -- Reference to Railway analysis job
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for fast lookups
CREATE INDEX idx_competitor_analyses_report_id ON competitor_analyses(report_id);
CREATE INDEX idx_competitor_analyses_user_id ON competitor_analyses(user_id);
CREATE INDEX idx_competitor_analyses_job_id ON competitor_analyses(job_id);
CREATE INDEX idx_competitor_analyses_status ON competitor_analyses(status);

-- Compound index for finding competitors by report
CREATE INDEX idx_competitor_analyses_report_user ON competitor_analyses(report_id, user_id);

-- RLS Policies
ALTER TABLE competitor_analyses ENABLE ROW LEVEL SECURITY;

-- Users can view their own competitor analyses
CREATE POLICY "Users can view own competitor analyses"
  ON competitor_analyses
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Users can insert competitor analyses for their reports
CREATE POLICY "Users can insert own competitor analyses"
  ON competitor_analyses
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

-- Users can update their own competitor analyses
CREATE POLICY "Users can update own competitor analyses"
  ON competitor_analyses
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Users can delete their own competitor analyses
CREATE POLICY "Users can delete own competitor analyses"
  ON competitor_analyses
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Service role can do everything (for API routes)
CREATE POLICY "Service role full access"
  ON competitor_analyses
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_competitor_analyses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_competitor_analyses_updated_at
  BEFORE UPDATE ON competitor_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_competitor_analyses_updated_at();

-- Comment on table
COMMENT ON TABLE competitor_analyses IS 'Stores competitor analysis results for Pro users to compare their site against up to 3 competitors';


