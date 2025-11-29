/**
 * Retry Failed Jobs
 * 
 * Finds analysis jobs that failed and retries them:
 * 1. Queries for jobs with 'failed' status
 * 2. Checks if retry limit hasn't been exceeded
 * 3. Re-queues eligible jobs
 * 
 * Runs every 30 minutes
 */

import { getSupabaseClient } from '../utils/supabase';

const supabase = getSupabaseClient();

// ============================================================================
// Types
// ============================================================================

interface FailedJob {
  id: string;
  url: string;
  user_id: string;
  retry_count: number;
  created_at: string;
  error_message: string | null;
}

interface RetryResult {
  success: boolean;
  jobsFound: number;
  jobsRetried: number;
  jobsSkipped: number;
  errors: string[];
  duration: number;
}

// ============================================================================
// Configuration
// ============================================================================

const MAX_RETRY_COUNT = 3;
const RETRY_DELAY_MINUTES = 5;
const MIN_AGE_FOR_RETRY_MINUTES = 10; // Don't retry jobs that failed less than 10 mins ago

// ============================================================================
// Main Retry Function
// ============================================================================

export async function retryFailedJobs(): Promise<RetryResult> {
  const startTime = Date.now();
  const result: RetryResult = {
    success: true,
    jobsFound: 0,
    jobsRetried: 0,
    jobsSkipped: 0,
    errors: [],
    duration: 0,
  };

  try {
    console.log('[RETRY] Checking for failed jobs...');

    // Calculate minimum age for retry (jobs must be at least X minutes old)
    const minAgeTime = new Date(Date.now() - MIN_AGE_FOR_RETRY_MINUTES * 60 * 1000).toISOString();

    // 1. Find failed jobs eligible for retry
    const { data: failedJobs, error: fetchError } = await supabase
      .from('jobs')
      .select('id, url, user_id, retry_count, created_at, error_message')
      .eq('status', 'failed')
      .lt('retry_count', MAX_RETRY_COUNT)
      .lt('updated_at', minAgeTime)
      .order('created_at', { ascending: true })
      .limit(10) as { data: FailedJob[] | null; error: Error | null };

    if (fetchError) {
      result.errors.push(`Failed to fetch jobs: ${fetchError.message}`);
      result.success = false;
      result.duration = Date.now() - startTime;
      return result;
    }

    if (!failedJobs || failedJobs.length === 0) {
      console.log('[RETRY] No failed jobs found');
      result.duration = Date.now() - startTime;
      return result;
    }

    result.jobsFound = failedJobs.length;
    console.log(`[RETRY] Found ${failedJobs.length} failed jobs to retry`);

    // 2. Process each failed job
    for (const job of failedJobs) {
      try {
        // Check if job should be retried based on error type
        if (shouldSkipRetry(job)) {
          console.log(`[RETRY] Skipping job ${job.id}: non-retryable error`);
          result.jobsSkipped++;
          continue;
        }

        // Update job status to 'pending' for retry
        const { error: updateError } = await supabase
          .from('jobs')
          .update({
            status: 'pending',
            retry_count: (job.retry_count || 0) + 1,
            error_message: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', job.id);

        if (updateError) {
          result.errors.push(`Failed to retry job ${job.id}: ${updateError.message}`);
          result.jobsSkipped++;
        } else {
          console.log(`[RETRY] Job ${job.id} queued for retry (attempt ${(job.retry_count || 0) + 1})`);
          result.jobsRetried++;
        }
      } catch (jobError) {
        result.errors.push(`Error processing job ${job.id}: ${jobError}`);
        result.jobsSkipped++;
      }
    }

    result.success = result.errors.length === 0;
    result.duration = Date.now() - startTime;

    console.log('[RETRY] Retry check completed:', {
      found: result.jobsFound,
      retried: result.jobsRetried,
      skipped: result.jobsSkipped,
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

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Determine if a job should be skipped for retry based on error type
 */
function shouldSkipRetry(job: FailedJob): boolean {
  const errorMessage = job.error_message?.toLowerCase() || '';

  // Don't retry for these error types:
  const nonRetryableErrors = [
    'invalid url',
    'blocked by robots.txt',
    'site not found',
    'dns resolution failed',
    'user cancelled',
    'quota exceeded',
  ];

  return nonRetryableErrors.some(err => errorMessage.includes(err));
}

