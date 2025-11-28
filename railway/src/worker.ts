/**
 * BullMQ Worker Entry Point
 * 
 * Starts the analysis worker to process jobs from the Redis queue.
 * Run this as a separate process from the HTTP server.
 * 
 * Usage:
 *   npm run worker     # Start the worker
 *   npm run dev:worker # Start worker in dev mode
 */

import 'dotenv/config';
import { createAnalysisWorker, closeWorker } from './queue/worker';
import { createQueueEvents, closeConnection, getQueueStats, createAnalysisQueue } from './queue/config';

// ============================================================================
// Startup
// ============================================================================

console.log('='.repeat(60));
console.log('Pirouette Analysis Worker');
console.log('='.repeat(60));
console.log(`[Worker] Starting at ${new Date().toISOString()}`);
console.log(`[Worker] Node version: ${process.version}`);
console.log(`[Worker] Environment: ${process.env.NODE_ENV || 'development'}`);
console.log('='.repeat(60));

// Verify required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
];

// Redis URL is optional in development (defaults to localhost)
if (process.env.NODE_ENV === 'production') {
  requiredEnvVars.push('REDIS_URL');
}

const missingEnvVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingEnvVars.length > 0) {
  console.error('[Worker] Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

// Create worker and queue events
const worker = createAnalysisWorker();
const queueEvents = createQueueEvents();
const queue = createAnalysisQueue();

// Log queue stats periodically
const statsInterval = setInterval(async () => {
  try {
    const stats = await getQueueStats(queue);
    console.log('[Worker] Queue stats:', stats);
  } catch (error) {
    console.error('[Worker] Failed to get queue stats:', error);
  }
}, 60000); // Every minute

// ============================================================================
// Graceful Shutdown
// ============================================================================

let isShuttingDown = false;

async function gracefulShutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    console.log('[Worker] Shutdown already in progress...');
    return;
  }
  
  isShuttingDown = true;
  console.log(`\n[Worker] Received ${signal}, starting graceful shutdown...`);
  
  // Clear stats interval
  clearInterval(statsInterval);
  
  try {
    // Close worker (waits for active jobs)
    await closeWorker(worker);
    
    // Close queue events
    await queueEvents.close();
    
    // Close queue
    await queue.close();
    
    // Close Redis connection
    await closeConnection();
    
    console.log('[Worker] Graceful shutdown complete');
    process.exit(0);
    
  } catch (error) {
    console.error('[Worker] Error during shutdown:', error);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('[Worker] Uncaught exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Worker] Unhandled rejection:', reason);
  // Don't exit for unhandled rejections, just log
});

console.log('[Worker] Worker is running. Press Ctrl+C to stop.');

