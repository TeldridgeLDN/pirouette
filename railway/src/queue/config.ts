/**
 * BullMQ Queue Configuration
 * 
 * Configures Redis connection and queue settings for the analysis job queue.
 * Supports both Railway's internal Redis and external Redis connections.
 */

import { Queue, Worker, QueueEvents, Job } from 'bullmq';
import IORedis from 'ioredis';

// ============================================================================
// Types
// ============================================================================

export interface AnalysisJobData {
  jobId: string;
  url: string;
  userId: string;
  weeklyTraffic?: number;
  createdAt: string;
  isCompetitorAnalysis?: boolean;
  reportId?: string; // Link back to user's report for competitor analysis
}

export interface AnalysisJobResult {
  success: boolean;
  reportId?: string;
  overallScore?: number;
  error?: string;
  analysisTime?: number;
}

// ============================================================================
// Redis Connection
// ============================================================================

/**
 * Get Redis connection configuration
 * Supports Railway's internal Redis URL or external Redis
 */
function getRedisConfig(): { host: string; port: number; password?: string; maxRetriesPerRequest: null } {
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
export function createRedisConnection(): IORedis {
  const config = getRedisConfig();
  
  console.log(`[Redis] Connecting to ${config.host}:${config.port}...`);
  
  const connection = new IORedis({
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

export const QUEUE_NAME = 'pirouette-analysis';

/**
 * Default job options for analysis jobs
 */
export const DEFAULT_JOB_OPTIONS = {
  attempts: 3, // Retry up to 3 times
  backoff: {
    type: 'exponential' as const,
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
export const WORKER_CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '2', 10);

/**
 * Job timeout - max time for a single analysis
 */
export const JOB_TIMEOUT = 120000; // 2 minutes

// ============================================================================
// Queue Factory Functions
// ============================================================================

let sharedConnection: IORedis | null = null;

/**
 * Get or create shared Redis connection
 */
export function getSharedConnection(): IORedis {
  if (!sharedConnection) {
    sharedConnection = createRedisConnection();
  }
  return sharedConnection;
}

/**
 * Create the analysis queue
 */
export function createAnalysisQueue(): Queue<AnalysisJobData, AnalysisJobResult> {
  const connection = getSharedConnection();
  
  const queue = new Queue<AnalysisJobData, AnalysisJobResult>(QUEUE_NAME, {
    connection,
    defaultJobOptions: DEFAULT_JOB_OPTIONS,
  });
  
  console.log(`[Queue] Analysis queue created: ${QUEUE_NAME}`);
  
  return queue;
}

/**
 * Create queue events listener for monitoring
 */
export function createQueueEvents(): QueueEvents {
  const connection = getSharedConnection();
  
  const queueEvents = new QueueEvents(QUEUE_NAME, {
    connection,
  });
  
  // Log job lifecycle events
  queueEvents.on('completed', ({ jobId, returnvalue }) => {
    // returnvalue is JSON string from BullMQ events
    let result: AnalysisJobResult | undefined;
    try {
      result = typeof returnvalue === 'string' 
        ? JSON.parse(returnvalue) 
        : returnvalue as unknown as AnalysisJobResult;
    } catch {
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
export async function addAnalysisJob(
  queue: Queue<AnalysisJobData, AnalysisJobResult>,
  data: AnalysisJobData,
  priority?: number
): Promise<Job<AnalysisJobData, AnalysisJobResult>> {
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
export async function getQueueStats(queue: Queue): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}> {
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
export async function closeQueue(queue: Queue): Promise<void> {
  console.log('[Queue] Closing queue...');
  await queue.close();
  console.log('[Queue] Queue closed');
}

export async function closeConnection(): Promise<void> {
  if (sharedConnection) {
    console.log('[Redis] Closing connection...');
    await sharedConnection.quit();
    sharedConnection = null;
    console.log('[Redis] Connection closed');
  }
}

