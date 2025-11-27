// @ts-nocheck
/**
 * Recommendation Engine
 * 
 * Main entry point for the recommendation generation system.
 * Orchestrates the complete pipeline from analyzer results to
 * prioritized, actionable recommendations.
 * 
 * Pipeline:
 * 1. Process analyzer results (Subtask 9.1)
 * 2. Match patterns (Subtask 9.2)
 * 3. Generate recommendations (Subtask 9.3)
 * 4. Estimate effort (Subtask 9.4)
 * 5. Calculate ROI and prioritize (Subtask 9.5)
 * 6. Format for display (Subtask 9.6)
 */

// Re-export all modules
export * from './analyzer-result-processor';
export * from './pattern-matcher';
export * from './recommendation-generator';
export * from './effort-estimator';
export * from './prioritizer';

// Import for orchestration
import { processAnalyzerResults, type RawAnalyzerResults, type ProcessedAnalyzerResults } from './analyzer-result-processor';
import { matchPatternsAcrossAllDimensions, type PatternMatchingResults } from './pattern-matcher';
import { generateDeduplicatedRecommendations } from './recommendation-generator';
import {
  prioritizeRecommendations,
  createPrioritizationSummary,
  generateExecutiveSummary,
  toStorageFormat,
  type PrioritizationContext,
  type PrioritizedRecommendation,
} from './prioritizer';
import type { Recommendation, AnalysisReport } from '../core/types';

// ============================================================================
// Main Orchestrator Types
// ============================================================================

/**
 * Complete recommendation engine output
 */
export interface RecommendationEngineResult {
  success: boolean;
  error?: string;
  
  // Processing stages
  processingResult?: ProcessedAnalyzerResults;
  patternMatchingResult?: PatternMatchingResults;
  
  // Final output
  recommendations: PrioritizedRecommendation[];
  summary: ReturnType<typeof createPrioritizationSummary>;
  executiveSummary: string;
  
  // Storage-ready format
  storageRecommendations: Recommendation[];
  
  // Metadata
  timestamp: string;
  analysisTime: number;
  version: string;
}

/**
 * Options for the recommendation engine
 */
export interface RecommendationEngineOptions {
  // Traffic context for revenue calculations
  weeklyTraffic?: number;
  averagePricing?: number;
  
  // Pattern matching options
  useSupabasePatterns?: boolean;
  
  // Output options
  maxRecommendations?: number;
  includeDebugInfo?: boolean;
}

// ============================================================================
// Main Orchestration Function
// ============================================================================

/**
 * Runs the complete recommendation generation pipeline
 * 
 * @param rawResults Raw analyzer results from Playwright analysis
 * @param options Configuration options
 * @returns Complete recommendation engine result
 */
export async function generateRecommendationsFromAnalysis(
  rawResults: RawAnalyzerResults,
  options: RecommendationEngineOptions = {}
): Promise<RecommendationEngineResult> {
  const startTime = Date.now();
  
  try {
    // Step 1: Process analyzer results
    const processingResult = processAnalyzerResults(rawResults);
    
    if (!processingResult.isComplete) {
      return {
        success: false,
        error: `Insufficient analysis data: ${processingResult.errors.join(', ')}`,
        processingResult,
        recommendations: [],
        summary: createPrioritizationSummary([], {}),
        executiveSummary: 'Analysis incomplete - insufficient data for recommendations.',
        storageRecommendations: [],
        timestamp: new Date().toISOString(),
        analysisTime: Date.now() - startTime,
        version: '1.0.0',
      };
    }
    
    // Step 2: Match patterns
    const patternMatchingResult = await matchPatternsAcrossAllDimensions(
      processingResult,
      options.useSupabasePatterns || false
    );
    
    // Step 3: Generate recommendations
    const rawRecommendations = generateDeduplicatedRecommendations(patternMatchingResult);
    
    // Step 4 & 5: Estimate effort and prioritize by ROI
    const context: PrioritizationContext = {
      weeklyTraffic: options.weeklyTraffic,
      averagePricing: options.averagePricing,
    };
    
    let prioritizedRecommendations = prioritizeRecommendations(rawRecommendations, context);
    
    // Apply max recommendations limit if specified
    if (options.maxRecommendations && options.maxRecommendations > 0) {
      prioritizedRecommendations = prioritizedRecommendations.slice(0, options.maxRecommendations);
    }
    
    // Step 6: Generate summaries and format for storage
    const summary = createPrioritizationSummary(prioritizedRecommendations, context);
    const executiveSummary = generateExecutiveSummary(prioritizedRecommendations, context);
    const storageRecommendations = toStorageFormat(prioritizedRecommendations);
    
    return {
      success: true,
      processingResult: options.includeDebugInfo ? processingResult : undefined,
      patternMatchingResult: options.includeDebugInfo ? patternMatchingResult : undefined,
      recommendations: prioritizedRecommendations,
      summary,
      executiveSummary,
      storageRecommendations,
      timestamp: new Date().toISOString(),
      analysisTime: Date.now() - startTime,
      version: '1.0.0',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      recommendations: [],
      summary: createPrioritizationSummary([], {}),
      executiveSummary: 'Error generating recommendations.',
      storageRecommendations: [],
      timestamp: new Date().toISOString(),
      analysisTime: Date.now() - startTime,
      version: '1.0.0',
    };
  }
}

/**
 * Creates a complete AnalysisReport from raw results
 * This is the main function to call after Playwright analysis
 */
export async function createAnalysisReport(
  rawResults: RawAnalyzerResults,
  options: RecommendationEngineOptions = {}
): Promise<AnalysisReport> {
  const engineResult = await generateRecommendationsFromAnalysis(rawResults, options);
  
  // Build the complete analysis report
  const processingResult = processAnalyzerResults(rawResults);
  
  return {
    id: `report-${Date.now()}`,
    url: rawResults.url,
    timestamp: new Date().toISOString(),
    screenshot: rawResults.screenshot,
    
    // Dimensions from processing
    dimensions: {
      colors: processingResult.dimensions.colors!,
      whitespace: processingResult.dimensions.whitespace!,
      complexity: processingResult.dimensions.complexity!,
      imageText: processingResult.dimensions.imageText!,
      typography: processingResult.dimensions.typography!,
      layout: processingResult.dimensions.layout!,
      ctaProminence: processingResult.dimensions.ctaProminence!,
      hierarchy: processingResult.dimensions.hierarchy || undefined,
    },
    
    // Scores
    overallScore: processingResult.overallScore,
    dimensionScores: processingResult.dimensionScores as AnalysisReport['dimensionScores'],
    
    // Recommendations (storage format)
    recommendations: engineResult.storageRecommendations,
    
    // Metadata
    analysisTime: engineResult.analysisTime,
    version: engineResult.version,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Validates that raw results have minimum required data
 */
export function validateRawResults(rawResults: RawAnalyzerResults): {
  isValid: boolean;
  missingFields: string[];
} {
  const missingFields: string[] = [];
  
  if (!rawResults.url) missingFields.push('url');
  
  // Check for at least some dimension data
  const dimensions = ['colors', 'whitespace', 'complexity', 'typography', 'layout', 'ctaProminence'];
  const presentDimensions = dimensions.filter((d) => rawResults[d as keyof RawAnalyzerResults]);
  
  if (presentDimensions.length < 3) {
    missingFields.push(`dimensions (only ${presentDimensions.length}/6 present)`);
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Gets a quick preview of recommendations without full processing
 * Useful for showing a loading preview
 */
export function getRecommendationPreview(
  patternMatchingResult: PatternMatchingResults
): { count: number; highPriority: number; dimensions: string[] } {
  const issues = patternMatchingResult.allIssues;
  
  return {
    count: issues.length,
    highPriority: issues.filter((i) => i.severity === 'high').length,
    dimensions: [...new Set(issues.map((i) => i.dimension))],
  };
}

// ============================================================================
// Default Export
// ============================================================================

export default {
  generateRecommendationsFromAnalysis,
  createAnalysisReport,
  validateRawResults,
  getRecommendationPreview,
};

