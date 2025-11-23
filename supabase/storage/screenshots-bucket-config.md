# Screenshots Storage Bucket Configuration

This document details the configuration for the `screenshots` storage bucket in Supabase.

---

## Bucket Settings

**Name:** `screenshots`  
**Access:** Private (RLS policies control access)  
**File Size Limit:** 10 MB  
**Allowed MIME Types:** `image/png`, `image/jpeg`, `image/webp`

---

## Folder Structure

Screenshots are organized by user ID and job ID:

```
screenshots/
  ├── {user_id}/
  │   ├── {job_id_1}.png
  │   ├── {job_id_2}.png
  │   └── {job_id_3}.png
  └── {another_user_id}/
      └── {job_id_4}.png
```

**Example:**
```
screenshots/
  └── 550e8400-e29b-41d4-a716-446655440000/
      └── 7c9e6679-7425-40de-944b-e07fc1f90ae7.png
```

---

## Storage Policies

### Policy 1: Users can view their own screenshots

**Policy Name:** `Users can view own screenshots`  
**Operation:** SELECT  
**Policy Definition:**

```sql
(bucket_id = 'screenshots'::text) 
AND ((storage.foldername(name))[1] = (auth.uid())::text)
```

**Explanation:**
- Users can only access files in folders matching their user ID
- Clerk JWT provides `auth.uid()` via Supabase auth
- Prevents users from viewing other users' screenshots

---

### Policy 2: Service role can manage all files

**Handled automatically via service_role key**

The Railway worker uses `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS policies.  
This allows the worker to:
- Upload screenshots to any user's folder
- Delete old screenshots for cleanup
- Access all files for admin operations

**Security Note:** Never expose the service_role key to the browser!

---

## Upload Process (Railway Worker)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Bypasses RLS
);

async function uploadScreenshot(
  userId: string,
  jobId: string,
  buffer: Buffer
): Promise<string> {
  const fileName = `${userId}/${jobId}.png`;

  const { data, error } = await supabase.storage
    .from('screenshots')
    .upload(fileName, buffer, {
      contentType: 'image/png',
      cacheControl: '3600', // Cache for 1 hour
      upsert: true, // Overwrite if exists
    });

  if (error) throw error;

  // Get public URL (signed URL for private buckets)
  const { data: { publicUrl } } = supabase.storage
    .from('screenshots')
    .getPublicUrl(fileName);

  return publicUrl;
}
```

---

## Download Process (Frontend)

```typescript
import { createAuthenticatedClient } from '@/lib/supabase/client';
import { useAuth } from '@clerk/nextjs';

function useScreenshot(jobId: string) {
  const { getToken } = useAuth();
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchScreenshot() {
      const token = await getToken({ template: 'supabase' });
      const supabase = createAuthenticatedClient(token);

      // Get signed URL (valid for 1 hour)
      const { data } = await supabase.storage
        .from('screenshots')
        .createSignedUrl(`${userId}/${jobId}.png`, 3600);

      if (data) setUrl(data.signedUrl);
    }

    fetchScreenshot();
  }, [jobId]);

  return url;
}
```

---

## File Retention Policy

### Free Plan Users
- Screenshots retained for **30 days**
- Automatic cleanup via cron job (Task 18)
- Users notified before deletion

### Pro Plan Users
- Screenshots retained **indefinitely**
- Or until user deletes account
- Optional download as ZIP (future feature)

---

## Storage Quotas

### Free Tier (Supabase)
- **Storage:** 1 GB total
- **Bandwidth:** 2 GB/month
- **Requests:** 50k/month

### Projected Usage
- **Screenshot size:** ~200-500 KB each
- **Free tier capacity:** ~2,000-5,000 screenshots
- **Sufficient for MVP:** Yes (100-200 users)

### Scaling Strategy
If storage limits are reached:
1. Implement aggressive cleanup (7-day retention for free users)
2. Compress screenshots (WebP format, 80% quality)
3. Upgrade to Supabase Pro ($25/mo = 100 GB)
4. Consider Cloudflare R2 for cost optimization (future)

---

## Backup Strategy

### Automatic Backups
- Supabase automatically backs up storage with database
- Retained for 7 days (free tier)

### Manual Backup
```bash
# Using Supabase CLI
supabase storage ls screenshots --recursive > screenshot-list.txt

# Download all screenshots
supabase storage download screenshots/ --recursive
```

---

## Monitoring

### Dashboard Metrics
Monitor in Supabase dashboard → **Storage**:
- Total storage used
- Bandwidth consumed
- Request count
- Top files by size

### Alerts
Set up alerts for:
- Storage >80% of quota
- Bandwidth >80% of quota
- Unusual upload patterns (potential abuse)

---

## Security Considerations

### Best Practices
✅ Always use RLS policies (never make bucket public)  
✅ Use signed URLs for temporary access  
✅ Validate file types before upload  
✅ Scan for malicious content (future: ClamAV integration)  
✅ Rate limit uploads (prevent abuse)

### Threat Mitigation
- **DoS via large files:** File size limit (10 MB)
- **Storage exhaustion:** Usage quotas per user
- **Malicious files:** MIME type whitelist + future scanning
- **Unauthorized access:** RLS policies + JWT authentication

---

## Troubleshooting

### Issue: "Bucket not found"
**Solution:** Verify bucket name is `screenshots` (case-sensitive)

### Issue: "Access denied"
**Solution:** Check RLS policies and JWT token validity

### Issue: "File too large"
**Solution:** Reduce screenshot quality or compress before upload

### Issue: "MIME type not allowed"
**Solution:** Ensure file is PNG, JPEG, or WebP format

---

## CLI Commands

```bash
# List files in bucket
supabase storage ls screenshots

# List files in user folder
supabase storage ls screenshots/USER_ID

# Upload file
supabase storage upload screenshots/USER_ID/JOB_ID.png ./screenshot.png

# Download file
supabase storage download screenshots/USER_ID/JOB_ID.png

# Delete file
supabase storage rm screenshots/USER_ID/JOB_ID.png

# Get bucket info
supabase storage info screenshots
```

---

## Next Steps

After bucket setup:
1. ✅ Update Railway worker to use this structure
2. ✅ Implement cleanup cron job (Task 18)
3. ✅ Add download feature to dashboard (Task 14)
4. ⏳ Optional: Implement compression pipeline

---

**Configuration Complete! 📸**

Your screenshots bucket is ready for production use.

