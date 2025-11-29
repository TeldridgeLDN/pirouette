-- Designer's Eye Reviews table
-- Stores AI-generated qualitative design feedback for Pro users

CREATE TABLE IF NOT EXISTS designers_eye_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  
  -- Review content
  overall_impression TEXT NOT NULL,
  visual_appeal_rating INTEGER NOT NULL CHECK (visual_appeal_rating >= 1 AND visual_appeal_rating <= 10),
  visual_appeal_explanation TEXT NOT NULL,
  first_impression_feedback TEXT NOT NULL,
  
  -- Structured data (stored as JSONB)
  insights JSONB NOT NULL DEFAULT '[]',
  missing_elements JSONB NOT NULL DEFAULT '[]',
  emotional_impact JSONB NOT NULL DEFAULT '{}',
  top_priorities JSONB NOT NULL DEFAULT '[]',
  
  -- Metadata
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- One review per report
  UNIQUE(report_id)
);

-- Index for fast lookups
CREATE INDEX idx_designers_eye_reviews_report_id ON designers_eye_reviews(report_id);
CREATE INDEX idx_designers_eye_reviews_user_id ON designers_eye_reviews(user_id);

-- RLS Policies
ALTER TABLE designers_eye_reviews ENABLE ROW LEVEL SECURITY;

-- Users can view their own reviews
CREATE POLICY "Users can view own reviews"
  ON designers_eye_reviews
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Users can insert reviews for their reports
CREATE POLICY "Users can insert own reviews"
  ON designers_eye_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
  ON designers_eye_reviews
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Service role can do everything (for API routes)
CREATE POLICY "Service role full access"
  ON designers_eye_reviews
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_designers_eye_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_designers_eye_reviews_updated_at
  BEFORE UPDATE ON designers_eye_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_designers_eye_reviews_updated_at();

-- Comment on table
COMMENT ON TABLE designers_eye_reviews IS 'Stores Designer''s Eye Review feedback for Pro users - qualitative design analysis';

