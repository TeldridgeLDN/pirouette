/**
 * Railway Express Server
 * Handles analysis job requests and health checks
 */

import express from 'express';
import { analyzeWebsite, validateUrl } from './analyzer';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'pirouette-analysis-worker',
    timestamp: new Date().toISOString(),
  });
});

// Analysis endpoint (will be called by BullMQ worker in production)
app.post('/analyze', async (req, res) => {
  try {
    const { jobId, url, userId } = req.body;

    if (!jobId || !url || !userId) {
      return res.status(400).json({
        error: 'Missing required fields: jobId, url, userId',
      });
    }

    // Validate URL
    const validation = validateUrl(url);
    if (!validation.valid) {
      return res.status(400).json({
        error: validation.error,
      });
    }

    // Run analysis
    const report = await analyzeWebsite(
      { jobId, url, userId },
      async (progress) => {
        // In production, this would update Supabase
        console.log('[Server] Progress:', progress);
      }
    );

    res.status(200).json({
      success: true,
      report,
    });

  } catch (error) {
    console.error('[Server] Analysis error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Analysis failed',
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`[Server] Railway worker listening on port ${PORT}`);
  console.log(`[Server] Health check: http://localhost:${PORT}/health`);
});

export default app;



