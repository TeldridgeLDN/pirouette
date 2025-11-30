"use strict";
/**
 * BullMQ Worker for Analysis Jobs
 *
 * Processes analysis jobs from the queue, running the full 7-dimensional
 * design analysis pipeline and updating Supabase with results.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAnalysisWorker = createAnalysisWorker;
exports.closeWorker = closeWorker;
exports.getWorkerHealth = getWorkerHealth;
const bullmq_1 = require("bullmq");
const config_1 = require("./config");
const analyzer_1 = require("../analyzer");
const supabase_1 = require("../utils/supabase");
// ============================================================================
// Worker Implementation
// ============================================================================
/**
 * Process a single analysis job
 */
async function processAnalysisJob(job) {
    const { jobId, url, userId, weeklyTraffic, isCompetitorAnalysis } = job.data;
    const startTime = Date.now();
    const jobType = isCompetitorAnalysis ? 'competitor' : 'standard';
    console.log(`[Worker] Processing ${jobType} job ${jobId}: ${url}`);
    console.log(`[Worker] Job attempt: ${job.attemptsMade + 1}/${job.opts.attempts || 3}`);
    try {
        // Update job to show it's being processed
        await job.updateProgress({ status: 'starting', progress: 0 });
        // For competitor analysis, update the competitor_analyses table
        if (isCompetitorAnalysis) {
            await (0, supabase_1.updateCompetitorProgress)(jobId, 'processing');
        }
        // Run the analysis
        const report = await (0, analyzer_1.analyzeWebsite)({ jobId, url, userId }, async (progress) => {
            // Update BullMQ job progress
            await job.updateProgress({
                status: progress.step,
                progress: progress.progress,
                message: progress.message,
            });
        });
        const analysisTime = Date.now() - startTime;
        // Save results differently based on job type
        if (isCompetitorAnalysis) {
            // Save to competitor_analyses table
            await (0, supabase_1.saveCompetitorAnalysis)(jobId, report);
            console.log(`[Worker] Competitor analysis ${jobId} saved successfully in ${analysisTime}ms`);
        }
        else {
            // Standard job - report is already saved by analyzeWebsite
            console.log(`[Worker] Job ${jobId} completed successfully in ${analysisTime}ms`);
        }
        console.log(`[Worker] Overall score: ${report.overallScore}`);
        return {
            success: true,
            reportId: report.id,
            overallScore: report.overallScore,
            analysisTime,
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[Worker] Job ${jobId} failed:`, errorMessage);
        // Update job status to failed in appropriate table
        if (isCompetitorAnalysis) {
            await (0, supabase_1.updateCompetitorProgress)(jobId, 'failed', errorMessage);
        }
        else {
            await (0, supabase_1.updateJobStatus)(jobId, 'failed', errorMessage);
        }
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
function isRetryableError(error) {
    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        // Network/timeout errors are retryable
        if (message.includes('timeout') ||
            message.includes('network') ||
            message.includes('econnrefused') ||
            message.includes('econnreset') ||
            message.includes('navigation failed')) {
            return true;
        }
        // Resource errors might be temporary
        if (message.includes('out of memory') ||
            message.includes('browser has disconnected')) {
            return true;
        }
        // Invalid URL or blocked sites shouldn't be retried
        if (message.includes('invalid url') ||
            message.includes('blocked') ||
            message.includes('forbidden')) {
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
function createAnalysisWorker() {
    const connection = (0, config_1.getSharedConnection)();
    const worker = new bullmq_1.Worker(config_1.QUEUE_NAME, processAnalysisJob, {
        connection,
        concurrency: config_1.WORKER_CONCURRENCY,
        lockDuration: config_1.JOB_TIMEOUT,
        stalledInterval: 30000, // Check for stalled jobs every 30 seconds
        maxStalledCount: 2, // Allow 2 stalls before failing
        limiter: {
            max: 10, // Max 10 jobs per minute
            duration: 60000,
        },
    });
    // Worker event handlers
    worker.on('ready', () => {
        console.log(`[Worker] Ready to process jobs (concurrency: ${config_1.WORKER_CONCURRENCY})`);
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
        const data = progress;
        console.log(`[Worker] Job ${job.id} progress: ${data.progress}% - ${data.status}`);
    });
    console.log('[Worker] Analysis worker created');
    return worker;
}
/**
 * Graceful shutdown for worker
 */
async function closeWorker(worker) {
    console.log('[Worker] Shutting down worker...');
    // Wait for current jobs to complete (max 30 seconds)
    await worker.close();
    console.log('[Worker] Worker shut down complete');
}
/**
 * Get worker health status
 */
function getWorkerHealth(worker) {
    return {
        running: worker.isRunning(),
        concurrency: config_1.WORKER_CONCURRENCY,
        activeJobs: 0, // BullMQ doesn't expose this directly
    };
}
exports.default = {
    createAnalysisWorker,
    closeWorker,
    getWorkerHealth,
};
