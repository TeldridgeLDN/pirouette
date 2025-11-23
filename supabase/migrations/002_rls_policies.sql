-- ================================================================
-- Pirouette Row Level Security (RLS) Policies
-- ================================================================
-- Created: 2025-11-23
-- Purpose: Implement data isolation and access control
--
-- Security Model:
--   - Users can only access their own data
--   - Railway worker uses service_role key (bypasses RLS)
--   - Clerk authentication via JWT
--
-- JWT Claims Structure:
--   {
--     "sub": "user_clerk_id",
--     "email": "user@example.com",
--     ...
--   }
-- ================================================================

-- ================================================================
-- ENABLE RLS ON ALL TABLES
-- ================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE patterns ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- HELPER FUNCTIONS
-- ================================================================

-- Get current user's UUID from Clerk JWT
CREATE OR REPLACE FUNCTION auth.current_user_id()
RETURNS UUID AS $$
  SELECT id FROM users 
  WHERE clerk_id = auth.jwt()->>'sub'
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if current user is authenticated
CREATE OR REPLACE FUNCTION auth.is_authenticated()
RETURNS BOOLEAN AS $$
  SELECT auth.jwt() IS NOT NULL 
  AND auth.jwt()->>'sub' IS NOT NULL;
$$ LANGUAGE SQL SECURITY DEFINER;

-- ================================================================
-- USERS TABLE POLICIES
-- ================================================================

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  USING (id = auth.current_user_id());

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  USING (id = auth.current_user_id())
  WITH CHECK (id = auth.current_user_id());

-- Policy: Service role can insert users (for Clerk webhook)
-- Note: This is handled via service_role key, which bypasses RLS
-- No explicit policy needed

-- Policy: Users can delete their own account
CREATE POLICY "Users can delete own account"
  ON users
  FOR DELETE
  USING (id = auth.current_user_id());

-- ================================================================
-- JOBS TABLE POLICIES
-- ================================================================

-- Policy: Users can view their own jobs
CREATE POLICY "Users can view own jobs"
  ON jobs
  FOR SELECT
  USING (user_id = auth.current_user_id());

-- Policy: Authenticated users can create jobs
CREATE POLICY "Authenticated users can create jobs"
  ON jobs
  FOR INSERT
  WITH CHECK (
    auth.is_authenticated() 
    AND user_id = auth.current_user_id()
  );

-- Policy: Users can update their own jobs (for cancel operation)
CREATE POLICY "Users can update own jobs"
  ON jobs
  FOR UPDATE
  USING (user_id = auth.current_user_id())
  WITH CHECK (user_id = auth.current_user_id());

-- Policy: Users can delete their own jobs
CREATE POLICY "Users can delete own jobs"
  ON jobs
  FOR DELETE
  USING (user_id = auth.current_user_id());

-- Note: Railway worker updates jobs via service_role key (bypasses RLS)

-- ================================================================
-- REPORTS TABLE POLICIES
-- ================================================================

-- Policy: Users can view their own reports
CREATE POLICY "Users can view own reports"
  ON reports
  FOR SELECT
  USING (user_id = auth.current_user_id());

-- Policy: Users can delete their own reports
CREATE POLICY "Users can delete own reports"
  ON reports
  FOR DELETE
  USING (user_id = auth.current_user_id());

-- Note: Railway worker creates reports via service_role key (bypasses RLS)
-- Users cannot create or update reports directly

-- ================================================================
-- PATTERNS TABLE POLICIES
-- ================================================================

-- Policy: Everyone can view patterns (public read)
CREATE POLICY "Anyone can view patterns"
  ON patterns
  FOR SELECT
  USING (true);

-- Note: Railway worker manages patterns via service_role key (bypasses RLS)
-- Users cannot create, update, or delete patterns

-- ================================================================
-- STORAGE BUCKET POLICIES (Applied via Dashboard)
-- ================================================================
-- Bucket: screenshots
-- 
-- Policy: Users can view their own screenshots
-- SELECT:
--   bucket_id = 'screenshots' 
--   AND (storage.foldername(name))[1] = auth.current_user_id()::text
--
-- Policy: Service role can upload screenshots
-- INSERT:
--   bucket_id = 'screenshots'
--   (Applied via service_role key, bypasses RLS)
--
-- Note: Screenshots are stored as: screenshots/{user_id}/{job_id}.png
-- ================================================================

-- ================================================================
-- SECURITY AUDIT QUERIES
-- ================================================================
-- Run these to verify RLS is properly configured:
--
-- Check which tables have RLS enabled:
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public';
--
-- List all policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public';
--
-- Test as user (replace 'user_xxx' with actual clerk_id):
-- SET request.jwt.claims.sub = 'user_xxx';
-- SELECT * FROM jobs;  -- Should only see own jobs
-- RESET request.jwt.claims.sub;
-- ================================================================

-- ================================================================
-- ADDITIONAL SECURITY CONSIDERATIONS
-- ================================================================

-- 1. Service Role Key Security:
--    - Store SUPABASE_SERVICE_ROLE_KEY securely in Railway env vars
--    - Never expose in client-side code
--    - Only Railway worker should use it

-- 2. Anon Key (Client-side):
--    - Safe to expose in Next.js frontend
--    - RLS policies prevent unauthorized access
--    - Used with Clerk JWT for authentication

-- 3. Rate Limiting:
--    - Implement in Next.js API routes
--    - Check analyses_this_month before creating jobs
--    - Reset counter monthly via cron job

-- 4. Input Validation:
--    - Validate URLs before creating jobs
--    - Sanitize user inputs in API routes
--    - Check constraints at database level

-- 5. Screenshot Access:
--    - Screenshots stored in private bucket
--    - Access controlled via RLS policies
--    - Public URLs generated with temporary tokens (optional)

-- ================================================================

