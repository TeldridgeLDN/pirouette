/**
 * Main Analyzer Entry Point
 * Railway Analysis Worker
 * 
 * Coordinates between Playwright browser automation and
 * the imported visual design analysis algorithms
 */

import { PlaywrightBrowser } from '../utils/browser';
import { loadDefaultPatterns } from '../../../src/lib/analysis';
import {
  analyzeColors,
  analyzeTypography,
  analyzeCTAs,
  analyzeComplexity,
  analyzeWhitespace,
  analyzeLayout,
  analyzeImageTextRatio,
  analyzeHierarchy,
  generateRecommendations,
} from '../../../src/lib/analysis/analyzer-bridge';
import { uploadScreenshot, updateJobProgress, saveReport, updateJobStatus } from '../utils/supabase';
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
  const startTime = Date.now();
  
  console.log(`[Analyzer] Starting analysis for job ${jobId}: ${url}`);
  
  const reportProgress = async (progress: number, step: string, message: string) => {
    if (onProgress) {
      await onProgress({ jobId, progress, step, message });
    }
    // Update progress in Supabase
    await updateJobProgress(jobId, progress, step, message);
    console.log(`[Analyzer] ${progress}% - ${step}: ${message}`);
  };

  try {
    // Update job status to processing
    await updateJobStatus(jobId, 'processing');
    
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

      // Step 4.5: Upload screenshot to Supabase (35%)
      await reportProgress(35, 'upload', 'Uploading screenshot...');
      const screenshotUrl = await uploadScreenshot(jobId, screenshotBuffer);
      
      if (!screenshotUrl) {
        console.warn('[Analyzer] Screenshot upload failed, continuing without it');
      }

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

      // Step 6: Run 7-dimensional analysis (50-80%)
      await reportProgress(50, 'analysis', 'Analyzing colors...');
      const colorAnalysis = analyzeColors(colors, patterns);
      
      await reportProgress(55, 'analysis', 'Analyzing typography...');
      const typographyAnalysis = analyzeTypography(typography);
      
      await reportProgress(60, 'analysis', 'Analyzing CTAs...');
      const ctaAnalysis = analyzeCTAs(ctas, patterns);
      
      await reportProgress(65, 'analysis', 'Analyzing complexity...');
      const complexityAnalysis = analyzeComplexity(elementCount);
      
      await reportProgress(70, 'analysis', 'Analyzing whitespace...');
      const whitespaceAnalysis = analyzeWhitespace(patterns);
      
      await reportProgress(75, 'analysis', 'Analyzing layout...');
      const layoutAnalysis = analyzeLayout(patterns);
      
      const imageTextAnalysis = analyzeImageTextRatio();
      const hierarchyAnalysis = analyzeHierarchy();

      // Calculate overall score
      const dimensionScores = {
        colors: colorAnalysis.score,
        whitespace: whitespaceAnalysis.score,
        complexity: complexityAnalysis.score,
        imageText: imageTextAnalysis.score,
        typography: typographyAnalysis.score,
        layout: layoutAnalysis.score,
        ctaProminence: ctaAnalysis.score,
        hierarchy: hierarchyAnalysis.score,
      };

      const overallScore = Math.round(
        Object.values(dimensionScores).reduce((a, b) => a + b, 0) / 
        Object.values(dimensionScores).length
      );

      // Build report
      const report: AnalysisReport = {
        id: jobId,
        url,
        timestamp: new Date().toISOString(),
        screenshot: screenshotUrl,
        dimensions: {
          colors: colorAnalysis,
          whitespace: whitespaceAnalysis,
          complexity: complexityAnalysis,
          imageText: imageTextAnalysis,
          typography: typographyAnalysis,
          layout: layoutAnalysis,
          ctaProminence: ctaAnalysis,
          hierarchy: hierarchyAnalysis,
        },
        overallScore,
        dimensionScores,
        recommendations: [],
        analysisTime: 0, // Will be calculated
        version: '1.0.0',
      };
      
      // Step 7: Generate recommendations (80%)
      await reportProgress(80, 'recommendations', 'Generating recommendations...');
      report.recommendations = generateRecommendations(report.dimensions);
      
      // Step 8: Save to database (90%)
      await reportProgress(90, 'saving', 'Saving report...');
      
      const endTime = Date.now();
      report.analysisTime = endTime - startTime;
      
      await saveReport(jobId, userId, url, report);
      
      console.log(`[Analyzer] Analysis complete:`, {
        overallScore: report.overallScore,
        dimensions: Object.keys(report.dimensionScores).length,
        recommendations: report.recommendations.length,
        time: `${report.analysisTime}ms`,
      });

      // Step 9: Complete (100%)
      await reportProgress(100, 'complete', 'Analysis complete!');
      await updateJobStatus(jobId, 'completed');
      
      return report;

    } finally {
      // Always close browser
      await browser.cleanup();
    }

  } catch (error) {
    console.error(`[Analyzer] Analysis failed for ${jobId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await updateJobStatus(jobId, 'failed', errorMessage);
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

