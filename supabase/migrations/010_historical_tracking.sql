-- ================================================================
-- Historical Tracking Enhancement Migration
-- ================================================================
-- Created: 2025-11-30
-- Purpose: Add fields to support historical tracking visualization
-- 
-- Changes:
--   1. Add previous_analysis_id to link analyses for same URL
--   2. Add version counter to track analysis sequence
--   3. Add normalized_url for efficient URL matching
--   4. Create indexes for performance
-- ================================================================

-- ================================================================
-- 1. ADD NEW COLUMNS TO REPORTS TABLE
-- ================================================================

-- Previous analysis link (creates a linked list of analyses for same URL)
ALTER TABLE reports
ADD COLUMN IF NOT EXISTS previous_analysis_id UUID REFERENCES reports(id) ON DELETE SET NULL;

-- Version counter (1 = first analysis, increments for each re-analysis)
ALTER TABLE reports
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- Normalized URL for efficient matching (removes www, trailing slashes, etc.)
ALTER TABLE reports
ADD COLUMN IF NOT EXISTS normalized_url TEXT;

-- ================================================================
-- 2. CREATE FUNCTION TO NORMALIZE URLs
-- ================================================================

CREATE OR REPLACE FUNCTION normalize_url(url TEXT)
RETURNS TEXT AS $$
DECLARE
  parsed_url TEXT;
  hostname TEXT;
  pathname TEXT;
BEGIN
  -- Handle URLs without protocol
  IF url !~ '^https?://' THEN
    url := 'https://' || url;
  END IF;
  
  -- Extract hostname (remove www. prefix)
  hostname := regexp_replace(
    substring(url FROM 'https?://([^/]+)'),
    '^www\.',
    ''
  );
  
  -- Extract pathname (remove trailing slash)
  pathname := coalesce(
    regexp_replace(
      substring(url FROM 'https?://[^/]+(.*)'),
      '/$',
      ''
    ),
    ''
  );
  
  -- Return normalized URL
  IF pathname = '' OR pathname IS NULL THEN
    pathname := '/';
  END IF;
  
  RETURN hostname || pathname;
EXCEPTION WHEN OTHERS THEN
  -- Fallback: lowercase and trim
  RETURN lower(trim(url));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION normalize_url IS 'Normalizes URLs for consistent matching (removes www, trailing slashes)';

-- ================================================================
-- 3. BACKFILL NORMALIZED URLs FOR EXISTING REPORTS
-- ================================================================

UPDATE reports
SET normalized_url = normalize_url(url)
WHERE normalized_url IS NULL;

-- ================================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ================================================================

-- Index on previous_analysis_id for chain traversal
CREATE INDEX IF NOT EXISTS idx_reports_previous_analysis_id 
ON reports(previous_analysis_id);

-- Index on normalized_url for history queries
CREATE INDEX IF NOT EXISTS idx_reports_normalized_url 
ON reports(normalized_url);

-- Composite index for user + normalized_url queries (most common pattern)
CREATE INDEX IF NOT EXISTS idx_reports_user_normalized_url 
ON reports(user_id, normalized_url);

-- Index on version for sorting
CREATE INDEX IF NOT EXISTS idx_reports_version 
ON reports(version);

-- ================================================================
-- 5. CREATE TRIGGER TO AUTO-SET NORMALIZED URL AND VERSION
-- ================================================================

CREATE OR REPLACE FUNCTION set_report_normalized_url_and_version()
RETURNS TRIGGER AS $$
DECLARE
  prev_report RECORD;
  next_version INTEGER;
BEGIN
  -- Always set normalized URL
  NEW.normalized_url := normalize_url(NEW.url);
  
  -- Find the most recent previous analysis for this URL by this user
  SELECT id, version INTO prev_report
  FROM reports
  WHERE user_id = NEW.user_id
    AND normalized_url = NEW.normalized_url
    AND id != NEW.id
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF prev_report IS NOT NULL THEN
    -- Link to previous and increment version
    NEW.previous_analysis_id := prev_report.id;
    NEW.version := COALESCE(prev_report.version, 1) + 1;
  ELSE
    -- First analysis for this URL
    NEW.previous_analysis_id := NULL;
    NEW.version := 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (drop first if exists to avoid duplicates)
DROP TRIGGER IF EXISTS set_report_metadata ON reports;

CREATE TRIGGER set_report_metadata
  BEFORE INSERT ON reports
  FOR EACH ROW
  EXECUTE FUNCTION set_report_normalized_url_and_version();

-- ================================================================
-- 6. BACKFILL VERSION AND PREVIOUS_ANALYSIS_ID FOR EXISTING DATA
-- ================================================================

-- This CTE-based update links existing reports in chronological order
WITH ranked_reports AS (
  SELECT 
    id,
    user_id,
    normalized_url,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, normalized_url 
      ORDER BY created_at ASC
    ) as version_num,
    LAG(id) OVER (
      PARTITION BY user_id, normalized_url 
      ORDER BY created_at ASC
    ) as prev_id
  FROM reports
  WHERE normalized_url IS NOT NULL
)
UPDATE reports r
SET 
  version = rr.version_num,
  previous_analysis_id = rr.prev_id
FROM ranked_reports rr
WHERE r.id = rr.id;

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================
-- Run these after migration to verify:
--
-- SELECT id, url, normalized_url, version, previous_analysis_id, created_at
-- FROM reports
-- ORDER BY normalized_url, created_at;
--
-- SELECT normalized_url, COUNT(*) as analysis_count, MAX(version) as max_version
-- FROM reports
-- GROUP BY normalized_url
-- HAVING COUNT(*) > 1
-- ORDER BY analysis_count DESC;
-- ================================================================

