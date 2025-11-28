/**
 * Cron Jobs Manager
 * 
 * Schedules and executes recurring tasks:
 * - Pattern library refresh (daily at 3am)
 * - Failed job retry (every 30 minutes)
 * - Stale job cleanup (every hour)
 */

import { CronJob } from 'cron';
import { refreshPatterns } from './refresh-patterns';
import { retryFailedJobs } from './retry-failed';
import { cleanupStaleJobs } from './cleanup-stale';

// ============================================================================
// Cron Schedule Configuration
// ============================================================================

const SCHEDULES = {
  // Daily at 3:00 AM UTC - refresh pattern library
  REFRESH_PATTERNS: '0 3 * * *',
  
  // Every 30 minutes - retry failed jobs
  RETRY_FAILED: '*/30 * * * *',
  
  // Every hour - cleanup stale jobs
  CLEANUP_STALE: '0 * * * *',
};

// ============================================================================
// Cron Jobs
// ============================================================================

const jobs: CronJob[] = [];

/**
 * Initialize all cron jobs
 */
export function initCronJobs() {
  console.log('[CRON] Initializing cron jobs...');

  // Pattern refresh job
  const patternJob = new CronJob(
    SCHEDULES.REFRESH_PATTERNS,
    async () => {
      console.log('[CRON] Starting pattern refresh...');
      const startTime = Date.now();
      try {
        const result = await refreshPatterns();
        const duration = Date.now() - startTime;
        console.log(`[CRON] Pattern refresh completed in ${duration}ms:`, result);
      } catch (error) {
        console.error('[CRON] Pattern refresh failed:', error);
      }
    },
    null,
    false,
    'UTC'
  );
  jobs.push(patternJob);

  // Retry failed jobs
  const retryJob = new CronJob(
    SCHEDULES.RETRY_FAILED,
    async () => {
      console.log('[CRON] Checking for failed jobs to retry...');
      const startTime = Date.now();
      try {
        const result = await retryFailedJobs();
        const duration = Date.now() - startTime;
        console.log(`[CRON] Retry check completed in ${duration}ms:`, result);
      } catch (error) {
        console.error('[CRON] Retry failed jobs error:', error);
      }
    },
    null,
    false,
    'UTC'
  );
  jobs.push(retryJob);

  // Cleanup stale jobs
  const cleanupJob = new CronJob(
    SCHEDULES.CLEANUP_STALE,
    async () => {
      console.log('[CRON] Cleaning up stale jobs...');
      const startTime = Date.now();
      try {
        const result = await cleanupStaleJobs();
        const duration = Date.now() - startTime;
        console.log(`[CRON] Cleanup completed in ${duration}ms:`, result);
      } catch (error) {
        console.error('[CRON] Cleanup failed:', error);
      }
    },
    null,
    false,
    'UTC'
  );
  jobs.push(cleanupJob);

  // Start all jobs
  jobs.forEach(job => job.start());

  console.log('[CRON] Cron jobs initialized:');
  console.log(`  - Pattern refresh: ${SCHEDULES.REFRESH_PATTERNS}`);
  console.log(`  - Retry failed: ${SCHEDULES.RETRY_FAILED}`);
  console.log(`  - Cleanup stale: ${SCHEDULES.CLEANUP_STALE}`);
}

/**
 * Stop all cron jobs
 */
export function stopCronJobs() {
  console.log('[CRON] Stopping all cron jobs...');
  jobs.forEach(job => job.stop());
  console.log('[CRON] All cron jobs stopped');
}

/**
 * Run a specific job manually (for testing)
 */
export async function runJobManually(jobName: 'refresh' | 'retry' | 'cleanup') {
  console.log(`[CRON] Manually running job: ${jobName}`);
  
  switch (jobName) {
    case 'refresh':
      return refreshPatterns();
    case 'retry':
      return retryFailedJobs();
    case 'cleanup':
      return cleanupStaleJobs();
    default:
      throw new Error(`Unknown job: ${jobName}`);
  }
}

