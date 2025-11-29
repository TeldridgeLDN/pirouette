/**
 * Cleanup Stale Jobs
 * 
 * Handles jobs that have been stuck in processing:
 * 1. Finds jobs stuck in 'processing' status for too long
 * 2. Marks them as failed or retries them
 * 3. Cleans up orphaned data
 * 
 * Runs every hour
 */

import { getSupabaseClient } from '../utils/supabase';

const supabase = getSupabaseClient();

// ============================================================================
// Types
// ============================================================================

interface StaleJob {
  id: string;
  url: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  retry_count: number;
}

interface CleanupResult {
  success: boolean;
  staleJobsFound: number;
  jobsMarkedFailed: number;
  jobsRetried: number;
  oldJobsArchived: number;
  errors: string[];
  duration: number;
}

// ============================================================================
// Configuration
// ============================================================================

const STALE_THRESHOLD_MINUTES = 30; // Jobs processing for more than 30 mins are stale
const ARCHIVE_AGE_DAYS = 90; // Archive jobs older than 90 days
const MAX_RETRY_COUNT = 3;

// ============================================================================
// Main Cleanup Function
// ============================================================================

export async function cleanupStaleJobs(): Promise<CleanupResult> {
  const startTime = Date.now();
  const result: CleanupResult = {
    success: true,
    staleJobsFound: 0,
    jobsMarkedFailed: 0,
    jobsRetried: 0,
    oldJobsArchived: 0,
    errors: [],
    duration: 0,
  };

  try {
    console.log('[CLEANUP] Starting stale job cleanup...');

    // 1. Find stale jobs (stuck in 'processing')
    const staleThreshold = new Date(Date.now() - STALE_THRESHOLD_MINUTES * 60 * 1000).toISOString();

    const { data: staleJobs, error: fetchError } = await supabase
      .from('jobs')
      .select('id, url, user_id, status, created_at, updated_at, retry_count')
      .eq('status', 'processing')
      .lt('updated_at', staleThreshold)
      .limit(20) as { data: StaleJob[] | null; error: Error | null };

    if (fetchError) {
      result.errors.push(`Failed to fetch stale jobs: ${fetchError.message}`);
    } else if (staleJobs && staleJobs.length > 0) {
      result.staleJobsFound = staleJobs.length;
      console.log(`[CLEANUP] Found ${staleJobs.length} stale jobs`);

      // Process each stale job
      for (const job of staleJobs) {
        try {
          const retryCount = job.retry_count || 0;

          if (retryCount < MAX_RETRY_COUNT) {
            // Retry the job
            const { error: updateError } = await supabase
              .from('jobs')
              .update({
                status: 'pending',
                retry_count: retryCount + 1,
                error_message: 'Stale job - automatically retried',
                updated_at: new Date().toISOString(),
              })
              .eq('id', job.id);

            if (updateError) {
              result.errors.push(`Failed to retry stale job ${job.id}`);
            } else {
              result.jobsRetried++;
              console.log(`[CLEANUP] Retried stale job ${job.id}`);
            }
          } else {
            // Mark as failed (exceeded retry limit)
            const { error: failError } = await supabase
              .from('jobs')
              .update({
                status: 'failed',
                error_message: 'Job timed out after maximum retries',
                updated_at: new Date().toISOString(),
              })
              .eq('id', job.id);

            if (failError) {
              result.errors.push(`Failed to mark job ${job.id} as failed`);
            } else {
              result.jobsMarkedFailed++;
              console.log(`[CLEANUP] Marked job ${job.id} as failed (max retries)`);
            }
          }
        } catch (jobError) {
          result.errors.push(`Error processing job ${job.id}: ${jobError}`);
        }
      }
    } else {
      console.log('[CLEANUP] No stale jobs found');
    }

    // 2. Archive old completed jobs (optional - for data cleanup)
    // Note: This just counts old jobs for now, actual archiving would need
    // a separate archive table or external storage
    const archiveThreshold = new Date(Date.now() - ARCHIVE_AGE_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const { count: oldJobCount, error: countError } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .in('status', ['completed', 'failed'])
      .lt('created_at', archiveThreshold);

    if (!countError && oldJobCount) {
      console.log(`[CLEANUP] Found ${oldJobCount} jobs older than ${ARCHIVE_AGE_DAYS} days`);
      // In production, you might archive these to cold storage
    }

    result.success = result.errors.length === 0;
    result.duration = Date.now() - startTime;

    console.log('[CLEANUP] Cleanup completed:', {
      staleFound: result.staleJobsFound,
      retried: result.jobsRetried,
      failed: result.jobsMarkedFailed,
      errors: result.errors.length,
      duration: `${result.duration}ms`,
    });

    return result;
  } catch (error) {
    result.success = false;
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    result.duration = Date.now() - startTime;
    return result;
  }
}

