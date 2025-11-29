"use strict";
/**
 * Queue Module Exports
 *
 * Re-exports all queue-related functionality for easy importing.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkerHealth = exports.closeWorker = exports.createAnalysisWorker = exports.closeQueue = exports.getQueueStats = exports.addAnalysisJob = exports.createQueueEvents = exports.createAnalysisQueue = exports.closeConnection = exports.getSharedConnection = exports.createRedisConnection = exports.JOB_TIMEOUT = exports.WORKER_CONCURRENCY = exports.DEFAULT_JOB_OPTIONS = exports.QUEUE_NAME = void 0;
var config_1 = require("./config");
// Config
Object.defineProperty(exports, "QUEUE_NAME", { enumerable: true, get: function () { return config_1.QUEUE_NAME; } });
Object.defineProperty(exports, "DEFAULT_JOB_OPTIONS", { enumerable: true, get: function () { return config_1.DEFAULT_JOB_OPTIONS; } });
Object.defineProperty(exports, "WORKER_CONCURRENCY", { enumerable: true, get: function () { return config_1.WORKER_CONCURRENCY; } });
Object.defineProperty(exports, "JOB_TIMEOUT", { enumerable: true, get: function () { return config_1.JOB_TIMEOUT; } });
// Connection
Object.defineProperty(exports, "createRedisConnection", { enumerable: true, get: function () { return config_1.createRedisConnection; } });
Object.defineProperty(exports, "getSharedConnection", { enumerable: true, get: function () { return config_1.getSharedConnection; } });
Object.defineProperty(exports, "closeConnection", { enumerable: true, get: function () { return config_1.closeConnection; } });
// Queue
Object.defineProperty(exports, "createAnalysisQueue", { enumerable: true, get: function () { return config_1.createAnalysisQueue; } });
Object.defineProperty(exports, "createQueueEvents", { enumerable: true, get: function () { return config_1.createQueueEvents; } });
Object.defineProperty(exports, "addAnalysisJob", { enumerable: true, get: function () { return config_1.addAnalysisJob; } });
Object.defineProperty(exports, "getQueueStats", { enumerable: true, get: function () { return config_1.getQueueStats; } });
Object.defineProperty(exports, "closeQueue", { enumerable: true, get: function () { return config_1.closeQueue; } });
var worker_1 = require("./worker");
// Worker
Object.defineProperty(exports, "createAnalysisWorker", { enumerable: true, get: function () { return worker_1.createAnalysisWorker; } });
Object.defineProperty(exports, "closeWorker", { enumerable: true, get: function () { return worker_1.closeWorker; } });
Object.defineProperty(exports, "getWorkerHealth", { enumerable: true, get: function () { return worker_1.getWorkerHealth; } });
