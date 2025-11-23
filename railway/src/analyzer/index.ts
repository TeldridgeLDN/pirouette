/**
 * Main Analyzer Entry Point
 * Railway Analysis Worker
 * 
 * Coordinates between Playwright browser automation and
 * the imported visual design analysis algorithms
 */

import { PlaywrightBrowser } from '../utils/browser';
import { analyzeLandingPage, loadDefaultPatterns } from '../../../src/lib/analysis';
import type { AnalysisReport, PatternLibrary } from '../../../src/lib/analysis';

export interface AnalysisJob {
  jobId: string;
  url: string;
  userId: string;
}

export interface AnalysisProgress {
  jobId: string;
  progress: number; // 0-100
  step: string;
  message: string;
}

export type ProgressCallback = (progress: AnalysisProgress) => Promise<void>;

/**
 * Main analysis function
 * This orchestrates the full 7-dimensional analysis pipeline
 */
export async function analyzeWebsite(
  job: AnalysisJob,
  onProgress?: ProgressCallback
): Promise<AnalysisReport> {
  const { jobId, url, userId } = job;
  
  console.log(`[Analyzer] Starting analysis for job ${jobId}: ${url}`);
  
  const reportProgress = async (progress: number, step: string, message: string) => {
    if (onProgress) {
      await onProgress({ jobId, progress, step, message });
    }
    console.log(`[Analyzer] ${progress}% - ${step}: ${message}`);
  };

  try {
    // Step 1: Load pattern library (5%)
    await reportProgress(5, 'initialization', 'Loading pattern library...');
    const patterns = loadDefaultPatterns();
    console.log(`[Analyzer] Loaded ${patterns.meta.designsExtracted} design patterns`);

    // Step 2: Launch browser (10%)
    await reportProgress(10, 'browser', 'Launching browser...');
    const browser = new PlaywrightBrowser({
      headless: true,
      timeout: 30000,
    });
    
    await browser.launch();
    const page = await browser.newPage();

    try {
      // Step 3: Navigate to URL (20%)
      await reportProgress(20, 'navigation', `Loading ${url}...`);
      const navigationSuccess = await browser.navigateToUrl(page, url);
      
      if (!navigationSuccess) {
        throw new Error(`Failed to load URL: ${url}`);
      }

      // Step 4: Capture screenshot (30%)
      await reportProgress(30, 'screenshot', 'Capturing screenshot...');
      const screenshotBuffer = await browser.captureScreenshot(page);
      console.log(`[Analyzer] Screenshot captured: ${screenshotBuffer.length} bytes`);

      // TODO: Upload screenshot to Supabase Storage
      const screenshotUrl = undefined; // Will implement in next step

      // Step 5: Extract raw data from page (40%)
      await reportProgress(40, 'extraction', 'Extracting design data...');
      
      const [colors, typography, elementCount, ctas] = await Promise.all([
        browser.extractColors(page),
        browser.extractTypography(page),
        browser.countElements(page),
        browser.findCTAs(page),
      ]);

      console.log(`[Analyzer] Extracted data:`, {
        colorsFound: colors.length,
        fontsFound: typography.fontFamilies.length,
        elements: elementCount,
        ctasFound: ctas.length,
      });

      // Step 6: Run 7-dimensional analysis (60%)
      await reportProgress(60, 'analysis', 'Analyzing 7 dimensions...');
      
      // For now, use the mock implementation from index.ts
      // TODO: Integrate actual visual-design-analyzer.ts logic
      const report = await analyzeLandingPage({
        url,
        patterns,
        options: {
          verbose: true,
          skipScreenshot: true, // We already have it
        },
      });

      // Enhance report with captured data
      report.screenshot = screenshotUrl;
      
      // Step 7: Generate recommendations (80%)
      await reportProgress(80, 'recommendations', 'Generating recommendations...');
      // Recommendations are generated as part of analyzeLandingPage
      
      // Step 8: Finalize report (90%)
      await reportProgress(90, 'finalization', 'Finalizing report...');
      
      console.log(`[Analyzer] Analysis complete:`, {
        overallScore: report.overallScore,
        dimensions: Object.keys(report.dimensionScores).length,
        recommendations: report.recommendations.length,
      });

      // Step 9: Complete (100%)
      await reportProgress(100, 'complete', 'Analysis complete!');
      
      return report;

    } finally {
      // Always close browser
      await browser.cleanup();
    }

  } catch (error) {
    console.error(`[Analyzer] Analysis failed for ${jobId}:`, error);
    await reportProgress(0, 'error', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

/**
 * Validate URL before analysis
 */
export function validateUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url);
    
    // Must be http or https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'URL must use HTTP or HTTPS protocol' };
    }

    // Must have a hostname
    if (!parsed.hostname) {
      return { valid: false, error: 'Invalid hostname' };
    }

    // Block localhost in production
    if (process.env.NODE_ENV === 'production' && 
        (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')) {
      return { valid: false, error: 'Cannot analyze localhost URLs' };
    }

    return { valid: true };

  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Estimate analysis time based on URL
 */
export function estimateAnalysisTime(url: string): number {
  // Base time: 30 seconds
  // Add time for complex sites
  // This is a rough estimate
  return 30000; // 30 seconds in milliseconds
}

export default {
  analyzeWebsite,
  validateUrl,
  estimateAnalysisTime,
};

