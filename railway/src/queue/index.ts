/**
 * Queue Module Exports
 * 
 * Re-exports all queue-related functionality for easy importing.
 */

export {
  // Config
  QUEUE_NAME,
  DEFAULT_JOB_OPTIONS,
  WORKER_CONCURRENCY,
  JOB_TIMEOUT,
  
  // Connection
  createRedisConnection,
  getSharedConnection,
  closeConnection,
  
  // Queue
  createAnalysisQueue,
  createQueueEvents,
  addAnalysisJob,
  getQueueStats,
  closeQueue,
  
  // Types
  type AnalysisJobData,
  type AnalysisJobResult,
} from './config';

export {
  // Worker
  createAnalysisWorker,
  closeWorker,
  getWorkerHealth,
  type WorkerHealth,
} from './worker';

