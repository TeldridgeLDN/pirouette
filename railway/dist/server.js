"use strict";
/**
 * Railway Express Server
 *
 * HTTP server for:
 * - Receiving analysis job requests
 * - Health checks
 * - Queue status monitoring
 *
 * Jobs are added to the BullMQ queue for processing by the worker.
 * In development mode, can also process jobs directly without Redis.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const analyzer_1 = require("./analyzer");
const config_1 = require("./queue/config");
const cron_1 = require("./cron");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const USE_QUEUE = process.env.USE_QUEUE !== 'false'; // Default to using queue
app.use(express_1.default.json());
// Initialize queue if enabled
let queue = null;
if (USE_QUEUE) {
    try {
        queue = (0, config_1.createAnalysisQueue)();
        console.log('[Server] Queue mode enabled');
    }
    catch (error) {
        console.warn('[Server] Failed to initialize queue, falling back to direct mode:', error);
    }
}
// ============================================================================
// Health Check
// ============================================================================
app.get('/health', async (req, res) => {
    const status = {
        status: 'healthy',
        service: 'pirouette-analysis-worker',
        timestamp: new Date().toISOString(),
        mode: queue ? 'queue' : 'direct',
    };
    // Add queue stats if available
    if (queue) {
        try {
            status.queue = await (0, config_1.getQueueStats)(queue);
        }
        catch (error) {
            console.error('[Server] Failed to get queue stats:', error);
        }
    }
    res.status(200).json(status);
});
// ============================================================================
// Queue Status Endpoint
// ============================================================================
app.get('/queue/stats', async (req, res) => {
    if (!queue) {
        return res.status(503).json({
            error: 'Queue not available',
            mode: 'direct',
        });
    }
    try {
        const stats = await (0, config_1.getQueueStats)(queue);
        res.status(200).json({
            success: true,
            stats,
        });
    }
    catch (error) {
        console.error('[Server] Failed to get queue stats:', error);
        res.status(500).json({
            error: 'Failed to get queue stats',
        });
    }
});
// ============================================================================
// Analysis Endpoint
// ============================================================================
app.post('/analyze', async (req, res) => {
    try {
        const { jobId, url, userId, weeklyTraffic } = req.body;
        if (!jobId || !url) {
            return res.status(400).json({
                error: 'Missing required fields: jobId, url',
            });
        }
        // Validate URL
        const validation = (0, analyzer_1.validateUrl)(url);
        if (!validation.valid) {
            return res.status(400).json({
                error: validation.error,
            });
        }
        // If queue is available, add job to queue
        if (queue) {
            const jobData = {
                jobId,
                url,
                userId: userId || 'anonymous',
                weeklyTraffic,
                createdAt: new Date().toISOString(),
            };
            await (0, config_1.addAnalysisJob)(queue, jobData);
            return res.status(202).json({
                success: true,
                message: 'Job queued for processing',
                jobId,
                mode: 'queued',
            });
        }
        // Direct processing mode (development without Redis)
        console.log('[Server] Processing job directly (no queue)');
        const report = await (0, analyzer_1.analyzeWebsite)({ jobId, url, userId: userId || 'anonymous' }, async (progress) => {
            console.log('[Server] Progress:', progress);
        });
        res.status(200).json({
            success: true,
            report,
            mode: 'direct',
        });
    }
    catch (error) {
        console.error('[Server] Analysis error:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Analysis failed',
        });
    }
});
// ============================================================================
// Manual Job Retry (Admin)
// ============================================================================
app.post('/queue/retry/:jobId', async (req, res) => {
    if (!queue) {
        return res.status(503).json({
            error: 'Queue not available',
        });
    }
    const { jobId } = req.params;
    try {
        const job = await queue.getJob(jobId);
        if (!job) {
            return res.status(404).json({
                error: 'Job not found',
            });
        }
        // Move to waiting state if failed
        const state = await job.getState();
        if (state === 'failed') {
            await job.retry();
            return res.status(200).json({
                success: true,
                message: 'Job queued for retry',
            });
        }
        res.status(400).json({
            error: `Cannot retry job in state: ${state}`,
        });
    }
    catch (error) {
        console.error('[Server] Retry error:', error);
        res.status(500).json({
            error: 'Failed to retry job',
        });
    }
});
// ============================================================================
// Cron Job Endpoints (Admin)
// ============================================================================
app.post('/cron/run/:jobName', async (req, res) => {
    const { jobName } = req.params;
    if (!['refresh', 'retry', 'cleanup'].includes(jobName)) {
        return res.status(400).json({
            error: `Invalid job name: ${jobName}. Valid names: refresh, retry, cleanup`,
        });
    }
    try {
        console.log(`[Server] Manually triggering cron job: ${jobName}`);
        const result = await (0, cron_1.runJobManually)(jobName);
        res.status(200).json({
            success: true,
            job: jobName,
            result,
        });
    }
    catch (error) {
        console.error(`[Server] Cron job ${jobName} failed:`, error);
        res.status(500).json({
            error: `Cron job failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
    }
});
// ============================================================================
// Server Lifecycle
// ============================================================================
const ENABLE_CRON = process.env.ENABLE_CRON !== 'false'; // Default to enabled
const server = app.listen(PORT, () => {
    console.log(`[Server] Railway worker listening on port ${PORT}`);
    console.log(`[Server] Mode: ${queue ? 'queue' : 'direct'}`);
    console.log(`[Server] Health check: http://localhost:${PORT}/health`);
    // Initialize cron jobs
    if (ENABLE_CRON) {
        (0, cron_1.initCronJobs)();
    }
    else {
        console.log('[Server] Cron jobs disabled via ENABLE_CRON=false');
    }
});
// Graceful shutdown
async function gracefulShutdown(signal) {
    console.log(`\n[Server] Received ${signal}, shutting down...`);
    // Stop cron jobs first
    if (ENABLE_CRON) {
        (0, cron_1.stopCronJobs)();
    }
    server.close(async () => {
        console.log('[Server] HTTP server closed');
        if (queue) {
            await (0, config_1.closeQueue)(queue);
            await (0, config_1.closeConnection)();
        }
        console.log('[Server] Shutdown complete');
        process.exit(0);
    });
    // Force exit after 30 seconds
    setTimeout(() => {
        console.error('[Server] Forced shutdown after timeout');
        process.exit(1);
    }, 30000);
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
exports.default = app;
