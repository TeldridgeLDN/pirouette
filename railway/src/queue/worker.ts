/**
 * BullMQ Worker for Analysis Jobs
 * 
 * Processes analysis jobs from the queue, running the full 7-dimensional
 * design analysis pipeline and updating Supabase with results.
 */

import { Worker, Job } from 'bullmq';
import {
  QUEUE_NAME,
  WORKER_CONCURRENCY,
  JOB_TIMEOUT,
  getSharedConnection,
  type AnalysisJobData,
  type AnalysisJobResult,
} from './config';
import { analyzeWebsite } from '../analyzer';
import { updateJobStatus, updateJobProgress } from '../utils/supabase';

// ============================================================================
// Worker Implementation
// ============================================================================

/**
 * Process a single analysis job
 */
async function processAnalysisJob(
  job: Job<AnalysisJobData, AnalysisJobResult>
): Promise<AnalysisJobResult> {
  const { jobId, url, userId, weeklyTraffic } = job.data;
  const startTime = Date.now();
  
  console.log(`[Worker] Processing job ${jobId}: ${url}`);
  console.log(`[Worker] Job attempt: ${job.attemptsMade + 1}/${job.opts.attempts || 3}`);
  
  try {
    // Update job to show it's being processed
    await job.updateProgress({ status: 'starting', progress: 0 });
    
    // Run the analysis
    const report = await analyzeWebsite(
      { jobId, url, userId },
      async (progress) => {
        // Update BullMQ job progress
        await job.updateProgress({
          status: progress.step,
          progress: progress.progress,
          message: progress.message,
        });
      }
    );
    
    const analysisTime = Date.now() - startTime;
    
    console.log(`[Worker] Job ${jobId} completed successfully in ${analysisTime}ms`);
    console.log(`[Worker] Overall score: ${report.overallScore}`);
    
    return {
      success: true,
      reportId: report.id,
      overallScore: report.overallScore,
      analysisTime,
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Worker] Job ${jobId} failed:`, errorMessage);
    
    // Update job status to failed in Supabase
    await updateJobStatus(jobId, 'failed', errorMessage);
    
    // Determine if we should retry
    const isRetryable = isRetryableError(error);
    
    if (!isRetryable) {
      // Non-retryable error - fail immediately
      console.log(`[Worker] Job ${jobId} failed with non-retryable error`);
    }
    
    throw error; // Re-throw to let BullMQ handle retries
  }
}

/**
 * Determine if an error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Network/timeout errors are retryable
    if (
      message.includes('timeout') ||
      message.includes('network') ||
      message.includes('econnrefused') ||
      message.includes('econnreset') ||
      message.includes('navigation failed')
    ) {
      return true;
    }
    
    // Resource errors might be temporary
    if (
      message.includes('out of memory') ||
      message.includes('browser has disconnected')
    ) {
      return true;
    }
    
    // Invalid URL or blocked sites shouldn't be retried
    if (
      message.includes('invalid url') ||
      message.includes('blocked') ||
      message.includes('forbidden')
    ) {
      return false;
    }
  }
  
  // Default to retryable
  return true;
}

// ============================================================================
// Worker Factory
// ============================================================================

/**
 * Create and start the analysis worker
 */
export function createAnalysisWorker(): Worker<AnalysisJobData, AnalysisJobResult> {
  const connection = getSharedConnection();
  
  const worker = new Worker<AnalysisJobData, AnalysisJobResult>(
    QUEUE_NAME,
    processAnalysisJob,
    {
      connection,
      concurrency: WORKER_CONCURRENCY,
      lockDuration: JOB_TIMEOUT,
      stalledInterval: 30000, // Check for stalled jobs every 30 seconds
      maxStalledCount: 2, // Allow 2 stalls before failing
      limiter: {
        max: 10, // Max 10 jobs per minute
        duration: 60000,
      },
    }
  );
  
  // Worker event handlers
  worker.on('ready', () => {
    console.log(`[Worker] Ready to process jobs (concurrency: ${WORKER_CONCURRENCY})`);
  });
  
  worker.on('active', (job) => {
    console.log(`[Worker] Job ${job.id} is now active`);
  });
  
  worker.on('completed', (job, result) => {
    console.log(`[Worker] Job ${job.id} completed:`, {
      success: result.success,
      score: result.overallScore,
      time: `${result.analysisTime}ms`,
    });
  });
  
  worker.on('failed', (job, error) => {
    console.error(`[Worker] Job ${job?.id} failed:`, error.message);
    if (job) {
      console.log(`[Worker] Attempts: ${job.attemptsMade}/${job.opts.attempts}`);
    }
  });
  
  worker.on('stalled', (jobId) => {
    console.warn(`[Worker] Job ${jobId} has stalled`);
  });
  
  worker.on('error', (error) => {
    console.error('[Worker] Worker error:', error);
  });
  
  worker.on('progress', (job, progress) => {
    const data = progress as { status?: string; progress?: number; message?: string };
    console.log(`[Worker] Job ${job.id} progress: ${data.progress}% - ${data.status}`);
  });
  
  console.log('[Worker] Analysis worker created');
  
  return worker;
}

/**
 * Graceful shutdown for worker
 */
export async function closeWorker(worker: Worker): Promise<void> {
  console.log('[Worker] Shutting down worker...');
  
  // Wait for current jobs to complete (max 30 seconds)
  await worker.close();
  
  console.log('[Worker] Worker shut down complete');
}

// ============================================================================
// Worker Health Check
// ============================================================================

export interface WorkerHealth {
  running: boolean;
  concurrency: number;
  activeJobs: number;
}

/**
 * Get worker health status
 */
export function getWorkerHealth(worker: Worker): WorkerHealth {
  return {
    running: worker.isRunning(),
    concurrency: WORKER_CONCURRENCY,
    activeJobs: 0, // BullMQ doesn't expose this directly
  };
}

export default {
  createAnalysisWorker,
  closeWorker,
  getWorkerHealth,
};

