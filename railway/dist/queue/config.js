"use strict";
/**
 * BullMQ Queue Configuration
 *
 * Configures Redis connection and queue settings for the analysis job queue.
 * Supports both Railway's internal Redis and external Redis connections.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JOB_TIMEOUT = exports.WORKER_CONCURRENCY = exports.DEFAULT_JOB_OPTIONS = exports.QUEUE_NAME = void 0;
exports.createRedisConnection = createRedisConnection;
exports.getSharedConnection = getSharedConnection;
exports.createAnalysisQueue = createAnalysisQueue;
exports.createQueueEvents = createQueueEvents;
exports.addAnalysisJob = addAnalysisJob;
exports.getQueueStats = getQueueStats;
exports.closeQueue = closeQueue;
exports.closeConnection = closeConnection;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
// ============================================================================
// Redis Connection
// ============================================================================
/**
 * Get Redis connection configuration
 * Supports Railway's internal Redis URL or external Redis
 */
function getRedisConfig() {
    const redisUrl = process.env.REDIS_URL || process.env.REDIS_PRIVATE_URL;
    if (redisUrl) {
        // Parse Redis URL (format: redis://[:password@]host:port)
        const url = new URL(redisUrl);
        return {
            host: url.hostname,
            port: parseInt(url.port, 10) || 6379,
            password: url.password || undefined,
            maxRetriesPerRequest: null, // Required for BullMQ
        };
    }
    // Fallback to individual env vars
    return {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: null,
    };
}
/**
 * Create Redis connection instance
 */
function createRedisConnection() {
    const config = getRedisConfig();
    console.log(`[Redis] Connecting to ${config.host}:${config.port}...`);
    const connection = new ioredis_1.default({
        host: config.host,
        port: config.port,
        password: config.password,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        retryStrategy: (times) => {
            if (times > 10) {
                console.error('[Redis] Max retries reached, giving up');
                return null;
            }
            const delay = Math.min(times * 100, 3000);
            console.log(`[Redis] Retry attempt ${times}, waiting ${delay}ms`);
            return delay;
        },
    });
    connection.on('connect', () => {
        console.log('[Redis] Connected successfully');
    });
    connection.on('error', (error) => {
        console.error('[Redis] Connection error:', error.message);
    });
    connection.on('close', () => {
        console.log('[Redis] Connection closed');
    });
    return connection;
}
// ============================================================================
// Queue Configuration
// ============================================================================
exports.QUEUE_NAME = 'pirouette-analysis';
/**
 * Default job options for analysis jobs
 */
exports.DEFAULT_JOB_OPTIONS = {
    attempts: 3, // Retry up to 3 times
    backoff: {
        type: 'exponential',
        delay: 5000, // Start with 5 second delay
    },
    removeOnComplete: {
        count: 100, // Keep last 100 completed jobs
        age: 24 * 3600, // Keep for 24 hours
    },
    removeOnFail: {
        count: 50, // Keep last 50 failed jobs
        age: 7 * 24 * 3600, // Keep for 7 days
    },
};
/**
 * Worker concurrency - how many jobs to process simultaneously
 * Keep low to avoid memory issues with Playwright
 */
exports.WORKER_CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '2', 10);
/**
 * Job timeout - max time for a single analysis
 */
exports.JOB_TIMEOUT = 120000; // 2 minutes
// ============================================================================
// Queue Factory Functions
// ============================================================================
let sharedConnection = null;
/**
 * Get or create shared Redis connection
 */
function getSharedConnection() {
    if (!sharedConnection) {
        sharedConnection = createRedisConnection();
    }
    return sharedConnection;
}
/**
 * Create the analysis queue
 */
function createAnalysisQueue() {
    const connection = getSharedConnection();
    const queue = new bullmq_1.Queue(exports.QUEUE_NAME, {
        connection,
        defaultJobOptions: exports.DEFAULT_JOB_OPTIONS,
    });
    console.log(`[Queue] Analysis queue created: ${exports.QUEUE_NAME}`);
    return queue;
}
/**
 * Create queue events listener for monitoring
 */
function createQueueEvents() {
    const connection = getSharedConnection();
    const queueEvents = new bullmq_1.QueueEvents(exports.QUEUE_NAME, {
        connection,
    });
    // Log job lifecycle events
    queueEvents.on('completed', ({ jobId, returnvalue }) => {
        // returnvalue is JSON string from BullMQ events
        let result;
        try {
            result = typeof returnvalue === 'string'
                ? JSON.parse(returnvalue)
                : returnvalue;
        }
        catch {
            result = undefined;
        }
        console.log(`[Queue] Job ${jobId} completed:`, {
            success: result?.success,
            score: result?.overallScore,
        });
    });
    queueEvents.on('failed', ({ jobId, failedReason }) => {
        console.error(`[Queue] Job ${jobId} failed:`, failedReason);
    });
    queueEvents.on('stalled', ({ jobId }) => {
        console.warn(`[Queue] Job ${jobId} stalled - will be retried`);
    });
    queueEvents.on('progress', ({ jobId, data }) => {
        console.log(`[Queue] Job ${jobId} progress:`, data);
    });
    return queueEvents;
}
/**
 * Add a job to the analysis queue
 */
async function addAnalysisJob(queue, data, priority) {
    const job = await queue.add(`analyze-${data.jobId}`, data, {
        priority: priority ?? 0, // Lower number = higher priority
        jobId: data.jobId, // Use Supabase job ID as BullMQ job ID
    });
    console.log(`[Queue] Job added: ${job.id} for URL: ${data.url}`);
    return job;
}
/**
 * Get queue statistics
 */
async function getQueueStats(queue) {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
        queue.getDelayedCount(),
    ]);
    return { waiting, active, completed, failed, delayed };
}
/**
 * Graceful shutdown helper
 */
async function closeQueue(queue) {
    console.log('[Queue] Closing queue...');
    await queue.close();
    console.log('[Queue] Queue closed');
}
async function closeConnection() {
    if (sharedConnection) {
        console.log('[Redis] Closing connection...');
        await sharedConnection.quit();
        sharedConnection = null;
        console.log('[Redis] Connection closed');
    }
}
