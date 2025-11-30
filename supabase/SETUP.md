# Supabase Setup Guide for Pirouette

This guide walks you through setting up Supabase for the Pirouette project, including database schema, RLS policies, and storage buckets.

---

## Table of Contents

1. [Create Supabase Project](#1-create-supabase-project)
2. [Run Database Migrations](#2-run-database-migrations)
3. [Create Storage Bucket](#3-create-storage-bucket)
4. [Configure Environment Variables](#4-configure-environment-variables)
5. [Verify Setup](#5-verify-setup)
6. [Troubleshooting](#troubleshooting)

---

## 1. Create Supabase Project

### Step 1.1: Sign Up / Log In
1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account

### Step 1.2: Create New Project
1. Click **"New Project"**
2. Fill in project details:
   - **Name:** `pirouette` (or your preferred name)
   - **Database Password:** Generate a strong password (save it securely!)
   - **Region:** Choose closest to your users (e.g., `US West`, `EU Central`)
   - **Pricing Plan:** Free tier is sufficient for MVP
3. Click **"Create new project"**
4. Wait 2-3 minutes for provisioning

### Step 1.3: Get API Keys
1. Navigate to **Settings** → **API**
2. Copy these values (you'll need them later):
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **Anon (public) key** (safe to expose in frontend)
   - **Service role key** (⚠️ NEVER expose publicly!)

---

## 2. Run Database Migrations

### Option A: SQL Editor (Recommended)

1. Navigate to **SQL Editor** in the Supabase dashboard
2. Click **"New query"**
3. Copy contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into editor
5. Click **"Run"**
6. Verify success (should show "Success. No rows returned")
7. Repeat for `supabase/migrations/002_rls_policies.sql`

### Option B: Supabase CLI

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

### Verify Tables Created

Run this query in SQL Editor to verify:

```sql
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;
```

You should see tables: `users`, `jobs`, `reports`, `patterns`

---

## 3. Create Storage Bucket

### Step 3.1: Create Bucket

1. Navigate to **Storage** in the Supabase dashboard
2. Click **"New bucket"**
3. Configure bucket:
   - **Name:** `screenshots`
   - **Public bucket:** ❌ No (private, controlled access)
   - **File size limit:** 10 MB (sufficient for screenshots)
   - **Allowed MIME types:** `image/png`, `image/jpeg`, `image/webp`
4. Click **"Create bucket"**

### Step 3.2: Configure Storage Policies

Navigate to **Storage** → **Policies** → **screenshots bucket**

#### Policy 1: Users can view their own screenshots
```sql
-- Policy name: Users can view own screenshots
-- Operation: SELECT
-- Policy definition:
(bucket_id = 'screenshots'::text) 
AND ((storage.foldername(name))[1] = (auth.uid())::text)
```

#### Policy 2: Service role can upload/manage all screenshots
(This is handled automatically via service_role key, no explicit policy needed)

---

## 4. Configure Environment Variables

### Step 4.1: Next.js Environment Variables

Create/update `.env.local` in project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Service Role (Server-side only, NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

⚠️ **Security Notes:**
- `NEXT_PUBLIC_*` variables are safe to expose (included in client bundle)
- `SUPABASE_SERVICE_ROLE_KEY` should NEVER have `NEXT_PUBLIC_` prefix
- Add `.env.local` to `.gitignore` (never commit secrets!)

### Step 4.2: Railway Environment Variables

In Railway dashboard, add these environment variables for the worker:

```bash
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 4.3: Vercel Environment Variables (When Deploying)

In Vercel project settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Set for: **Production**, **Preview**, **Development**

---

## 5. Verify Setup

### Step 5.1: Test Database Connection

Run this in SQL Editor:

```sql
-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
-- All tables should have rowsecurity = true

-- Check policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
-- Should see multiple policies for users, jobs, reports

-- Check indexes
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename;
-- Should see multiple indexes for performance
```

### Step 5.2: Test Storage Bucket

1. Navigate to **Storage** → **screenshots**
2. Try uploading a test image manually
3. Verify you can view/download it

### Step 5.3: Test from Next.js

Create a test API route:

```typescript
// pages/api/test-supabase.ts
import { supabaseAdmin } from '@/lib/supabase/server';

export default async function handler(req, res) {
  try {
    // Test query
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);

    if (error) throw error;

    res.status(200).json({ 
      success: true, 
      message: 'Supabase connection successful!',
      data 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
```

Visit: `http://localhost:3000/api/test-supabase`

Expected response:
```json
{
  "success": true,
  "message": "Supabase connection successful!",
  "data": [{ "count": 0 }]
}
```

---

## Troubleshooting

### Issue: "relation 'users' does not exist"
**Solution:** Run migrations again. Make sure `001_initial_schema.sql` executed successfully.

### Issue: "JWT verification failed"
**Solution:** 
1. Check that Clerk JWT is being passed correctly
2. Verify JWT issuer URL matches in Supabase settings
3. Navigate to **Authentication** → **Settings** → **JWT Settings**
4. Set JWT secret to match Clerk (or use Clerk's JWKS endpoint)

### Issue: "Row level security policy violation"
**Solution:**
1. Verify RLS policies are enabled: `SELECT * FROM pg_policies WHERE schemaname = 'public';`
2. Check that user authentication is working
3. Temporarily disable RLS for testing: `ALTER TABLE tablename DISABLE ROW LEVEL SECURITY;`
4. Re-enable after debugging: `ALTER TABLE tablename ENABLE ROW LEVEL SECURITY;`

### Issue: "Storage bucket not found"
**Solution:**
1. Verify bucket name is exactly `screenshots` (case-sensitive)
2. Check bucket was created in correct project
3. Verify Storage API is enabled in project settings

### Issue: "Cannot upload to storage"
**Solution:**
1. Check file size is under limit (10 MB)
2. Verify MIME type is allowed (`image/png`, `image/jpeg`, `image/webp`)
3. Ensure using service_role key for uploads (RLS bypassed)
4. Check storage policies are configured correctly

### Issue: "Connection string not working in Railway"
**Solution:**
1. Use the Supabase API URL, not the direct PostgreSQL connection string
2. Format: `https://YOUR_PROJECT_REF.supabase.co`
3. Don't include `:5432` or database name

---

## Additional Resources

- **Supabase Documentation:** https://supabase.com/docs
- **Row Level Security Guide:** https://supabase.com/docs/guides/auth/row-level-security
- **Storage Guide:** https://supabase.com/docs/guides/storage
- **Supabase CLI:** https://supabase.com/docs/guides/cli

---

## Next Steps

After completing this setup:

1. ✅ Database schema is ready
2. ✅ RLS policies protect user data
3. ✅ Storage bucket for screenshots is configured
4. ✅ Environment variables are set

You can now:
- Integrate Clerk authentication (Task 4)
- Build Next.js API routes (Task 10)
- Deploy Railway worker (Task 16)

---

## Backup & Maintenance

### Daily Backups
Supabase automatically backs up your database daily (retained for 7 days on free tier).

### Manual Backup
```bash
# Using Supabase CLI
supabase db dump -f backup.sql
```

### Schema Changes
1. Create new migration file: `supabase/migrations/003_your_change.sql`
2. Test locally
3. Apply to production via SQL Editor or CLI

### Monitoring
1. Navigate to **Reports** in Supabase dashboard
2. Monitor database size, query performance, API usage
3. Set up alerts for quota limits (paid plans)

---

**Setup Complete! 🎉**

Your Supabase project is now ready for Pirouette development.




