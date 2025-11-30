// @ts-nocheck
/**
 * Analyzer Result Processor
 * 
 * Collects and processes results from the 7 dimension analyzers,
 * aggregates them into a standardized format, and prepares them
 * for pattern matching and recommendation generation.
 * 
 * This is Subtask 9.1 of the recommendation generation system.
 */

import type {
  AnalysisReport,
  ColorAnalysis,
  WhitespaceAnalysis,
  ComplexityAnalysis,
  ImageTextRatioAnalysis,
  TypographyAnalysis,
  LayoutAnalysis,
  CTAAnalysis,
  HierarchyAnalysis,
} from '../core/types';

// ============================================================================
// Types for Raw Analyzer Outputs
// ============================================================================

/**
 * Input format from individual analyzers before processing
 */
export interface RawAnalyzerResults {
  url: string;
  screenshot?: string;
  colors?: Partial<ColorAnalysis>;
  whitespace?: Partial<WhitespaceAnalysis>;
  complexity?: Partial<ComplexityAnalysis>;
  imageText?: Partial<ImageTextRatioAnalysis>;
  typography?: Partial<TypographyAnalysis>;
  layout?: Partial<LayoutAnalysis>;
  ctaProminence?: Partial<CTAAnalysis>;
  hierarchy?: Partial<HierarchyAnalysis>;
  metadata?: {
    startTime?: number;
    endTime?: number;
    version?: string;
  };
}

/**
 * Processed and validated analyzer results ready for pattern matching
 */
export interface ProcessedAnalyzerResults {
  isComplete: boolean;
  completeDimensions: string[];
  incompleteDimensions: string[];
  dimensions: {
    colors: ColorAnalysis | null;
    whitespace: WhitespaceAnalysis | null;
    complexity: ComplexityAnalysis | null;
    imageText: ImageTextRatioAnalysis | null;
    typography: TypographyAnalysis | null;
    layout: LayoutAnalysis | null;
    ctaProminence: CTAAnalysis | null;
    hierarchy: HierarchyAnalysis | null;
  };
  overallScore: number;
  dimensionScores: Record<string, number>;
  analysisTime: number;
  version: string;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates that a dimension analysis has required fields
 */
function validateColorAnalysis(analysis: Partial<ColorAnalysis> | undefined): ColorAnalysis | null {
  if (!analysis) return null;
  
  const required: (keyof ColorAnalysis)[] = ['palette', 'score'];
  const hasRequired = required.every((field) => analysis[field] !== undefined);
  
  if (!hasRequired) return null;
  
  // Fill in defaults for optional fields
  return {
    primary: analysis.primary || '#000000',
    palette: analysis.palette || [],
    contrastRatios: analysis.contrastRatios || [],
    wcagCompliance: analysis.wcagCompliance || { AA: false, AAA: false },
    matchedPatterns: analysis.matchedPatterns || [],
    score: analysis.score || 0,
    issues: analysis.issues || [],
    recommendations: analysis.recommendations || [],
  } as ColorAnalysis;
}

function validateWhitespaceAnalysis(analysis: Partial<WhitespaceAnalysis> | undefined): WhitespaceAnalysis | null {
  if (!analysis) return null;
  
  const required: (keyof WhitespaceAnalysis)[] = ['density', 'score'];
  const hasRequired = required.every((field) => analysis[field] !== undefined);
  
  if (!hasRequired) return null;
  
  return {
    sectionGaps: analysis.sectionGaps || [],
    contentPadding: analysis.contentPadding || [],
    lineHeight: analysis.lineHeight || 1.5,
    density: analysis.density || 'balanced',
    matchedPatterns: analysis.matchedPatterns || [],
    score: analysis.score || 0,
    issues: analysis.issues || [],
    recommendations: analysis.recommendations || [],
  } as WhitespaceAnalysis;
}

function validateComplexityAnalysis(analysis: Partial<ComplexityAnalysis> | undefined): ComplexityAnalysis | null {
  if (!analysis) return null;
  
  const required: (keyof ComplexityAnalysis)[] = ['elementCount', 'score'];
  const hasRequired = required.every((field) => analysis[field] !== undefined);
  
  if (!hasRequired) return null;
  
  return {
    elementCount: analysis.elementCount || 0,
    uniqueColors: analysis.uniqueColors || 0,
    fontCount: analysis.fontCount || 0,
    complexity: analysis.complexity || 'balanced',
    score: analysis.score || 0,
    issues: analysis.issues || [],
    recommendations: analysis.recommendations || [],
  } as ComplexityAnalysis;
}

function validateImageTextAnalysis(analysis: Partial<ImageTextRatioAnalysis> | undefined): ImageTextRatioAnalysis | null {
  if (!analysis) return null;
  
  const required: (keyof ImageTextRatioAnalysis)[] = ['ratio', 'score'];
  const hasRequired = required.every((field) => analysis[field] !== undefined);
  
  if (!hasRequired) return null;
  
  return {
    imagePercentage: analysis.imagePercentage || 0,
    textPercentage: analysis.textPercentage || 0,
    ratio: analysis.ratio || 0,
    balance: analysis.balance || 'balanced',
    score: analysis.score || 0,
    issues: analysis.issues || [],
    recommendations: analysis.recommendations || [],
  } as ImageTextRatioAnalysis;
}

function validateTypographyAnalysis(analysis: Partial<TypographyAnalysis> | undefined): TypographyAnalysis | null {
  if (!analysis) return null;
  
  const required: (keyof TypographyAnalysis)[] = ['fontFamilies', 'score'];
  const hasRequired = required.every((field) => analysis[field] !== undefined);
  
  if (!hasRequired) return null;
  
  return {
    fontFamilies: analysis.fontFamilies || [],
    fontSizes: analysis.fontSizes || [],
    lineHeights: analysis.lineHeights || [],
    readabilityScore: analysis.readabilityScore || 50,
    matchedPatterns: analysis.matchedPatterns || [],
    score: analysis.score || 0,
    issues: analysis.issues || [],
    recommendations: analysis.recommendations || [],
  } as TypographyAnalysis;
}

function validateLayoutAnalysis(analysis: Partial<LayoutAnalysis> | undefined): LayoutAnalysis | null {
  if (!analysis) return null;
  
  const required: (keyof LayoutAnalysis)[] = ['structure', 'score'];
  const hasRequired = required.every((field) => analysis[field] !== undefined);
  
  if (!hasRequired) return null;
  
  return {
    structure: analysis.structure || 'unknown',
    sectionsCount: analysis.sectionsCount || 0,
    gridUsage: analysis.gridUsage || false,
    responsiveness: analysis.responsiveness || 'unknown',
    matchedPatterns: analysis.matchedPatterns || [],
    score: analysis.score || 0,
    issues: analysis.issues || [],
    recommendations: analysis.recommendations || [],
  } as LayoutAnalysis;
}

function validateCTAAnalysis(analysis: Partial<CTAAnalysis> | undefined): CTAAnalysis | null {
  if (!analysis) return null;
  
  const required: (keyof CTAAnalysis)[] = ['count', 'score'];
  const hasRequired = required.every((field) => analysis[field] !== undefined);
  
  if (!hasRequired) return null;
  
  return {
    count: analysis.count || 0,
    primaryCTA: analysis.primaryCTA,
    aboveFold: analysis.aboveFold || false,
    contrast: analysis.contrast || 'unknown',
    matchedPatterns: analysis.matchedPatterns || [],
    score: analysis.score || 0,
    issues: analysis.issues || [],
    recommendations: analysis.recommendations || [],
  } as CTAAnalysis;
}

function validateHierarchyAnalysis(analysis: Partial<HierarchyAnalysis> | undefined): HierarchyAnalysis | null {
  if (!analysis) return null;
  
  const required: (keyof HierarchyAnalysis)[] = ['clarity', 'score'];
  const hasRequired = required.every((field) => analysis[field] !== undefined);
  
  if (!hasRequired) return null;
  
  return {
    visualWeight: analysis.visualWeight || { primary: 0, secondary: 0, tertiary: 0 },
    clarity: analysis.clarity || 'fair',
    score: analysis.score || 0,
    issues: analysis.issues || [],
    recommendations: analysis.recommendations || [],
  } as HierarchyAnalysis;
}

// ============================================================================
// Processing Pipeline
// ============================================================================

/**
 * Processes raw analyzer results and returns validated, aggregated data
 */
export function processAnalyzerResults(raw: RawAnalyzerResults): ProcessedAnalyzerResults {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate each dimension
  const colors = validateColorAnalysis(raw.colors);
  const whitespace = validateWhitespaceAnalysis(raw.whitespace);
  const complexity = validateComplexityAnalysis(raw.complexity);
  const imageText = validateImageTextAnalysis(raw.imageText);
  const typography = validateTypographyAnalysis(raw.typography);
  const layout = validateLayoutAnalysis(raw.layout);
  const ctaProminence = validateCTAAnalysis(raw.ctaProminence);
  const hierarchy = validateHierarchyAnalysis(raw.hierarchy);
  
  // Track completeness
  const completeDimensions: string[] = [];
  const incompleteDimensions: string[] = [];
  
  const dimensionMap = {
    colors,
    whitespace,
    complexity,
    imageText,
    typography,
    layout,
    ctaProminence,
    hierarchy,
  };
  
  Object.entries(dimensionMap).forEach(([name, value]) => {
    if (value) {
      completeDimensions.push(name);
    } else {
      incompleteDimensions.push(name);
      warnings.push(`Missing or incomplete analysis for dimension: ${name}`);
    }
  });
  
  // Calculate overall score (weighted average of completed dimensions)
  const dimensionScores: Record<string, number> = {};
  let scoreSum = 0;
  let scoreCount = 0;
  
  Object.entries(dimensionMap).forEach(([name, analysis]) => {
    if (analysis && 'score' in analysis && typeof analysis.score === 'number') {
      dimensionScores[name] = analysis.score;
      scoreSum += analysis.score;
      scoreCount++;
    }
  });
  
  const overallScore = scoreCount > 0 ? Math.round(scoreSum / scoreCount) : 0;
  
  // Calculate analysis time
  const analysisTime = raw.metadata?.endTime && raw.metadata?.startTime
    ? raw.metadata.endTime - raw.metadata.startTime
    : 0;
  
  const version = raw.metadata?.version || '1.0.0';
  
  // Check if we have enough data to proceed
  const isComplete = completeDimensions.length >= 5; // At least 5 of 7 dimensions
  
  if (!isComplete) {
    errors.push(`Insufficient data: only ${completeDimensions.length}/7 dimensions completed`);
  }
  
  return {
    isComplete,
    completeDimensions,
    incompleteDimensions,
    dimensions: dimensionMap,
    overallScore,
    dimensionScores,
    analysisTime,
    version,
    errors,
    warnings,
  };
}

/**
 * Aggregates issues from all dimensions
 */
export function aggregateIssues(processed: ProcessedAnalyzerResults): {
  byDimension: Record<string, string[]>;
  bySeverity: Record<string, string[]>;
  all: string[];
} {
  const byDimension: Record<string, string[]> = {};
  const all: string[] = [];
  
  Object.entries(processed.dimensions).forEach(([dimension, analysis]) => {
    if (analysis && 'issues' in analysis && Array.isArray(analysis.issues)) {
      byDimension[dimension] = analysis.issues;
      all.push(...analysis.issues);
    }
  });
  
  // Categorize by severity (basic heuristic: low score = high severity)
  const bySeverity: Record<string, string[]> = {
    high: [],
    medium: [],
    low: [],
  };
  
  Object.entries(processed.dimensions).forEach(([dimension, analysis]) => {
    if (analysis && 'issues' in analysis && 'score' in analysis) {
      const issues = analysis.issues || [];
      if (analysis.score < 50) {
        bySeverity.high.push(...issues);
      } else if (analysis.score < 75) {
        bySeverity.medium.push(...issues);
      } else {
        bySeverity.low.push(...issues);
      }
    }
  });
  
  return { byDimension, bySeverity, all };
}

/**
 * Aggregates analyzer-generated recommendations from all dimensions
 * These are the raw recommendations before pattern matching and ROI calculation
 */
export function aggregateAnalyzerRecommendations(processed: ProcessedAnalyzerResults): {
  byDimension: Record<string, string[]>;
  all: string[];
} {
  const byDimension: Record<string, string[]> = {};
  const all: string[] = [];
  
  Object.entries(processed.dimensions).forEach(([dimension, analysis]) => {
    if (analysis && 'recommendations' in analysis && Array.isArray(analysis.recommendations)) {
      byDimension[dimension] = analysis.recommendations;
      all.push(...analysis.recommendations);
    }
  });
  
  return { byDimension, all };
}

/**
 * Creates a summary of the processing results
 */
export function createProcessingSummary(processed: ProcessedAnalyzerResults): {
  status: 'complete' | 'partial' | 'insufficient';
  message: string;
  completeness: number;
  issueCount: number;
  recommendationCount: number;
} {
  const completeness = (processed.completeDimensions.length / 7) * 100;
  const issues = aggregateIssues(processed);
  const recs = aggregateAnalyzerRecommendations(processed);
  
  let status: 'complete' | 'partial' | 'insufficient';
  let message: string;
  
  if (processed.isComplete && processed.errors.length === 0) {
    status = 'complete';
    message = `Analysis complete: ${processed.completeDimensions.length}/7 dimensions processed successfully`;
  } else if (processed.isComplete) {
    status = 'partial';
    message = `Analysis partially complete: ${processed.completeDimensions.length}/7 dimensions with ${processed.errors.length} errors`;
  } else {
    status = 'insufficient';
    message = `Analysis insufficient: only ${processed.completeDimensions.length}/7 dimensions completed`;
  }
  
  return {
    status,
    message,
    completeness: Math.round(completeness),
    issueCount: issues.all.length,
    recommendationCount: recs.all.length,
  };
}

// ============================================================================
// Exports
// ============================================================================

export default {
  processAnalyzerResults,
  aggregateIssues,
  aggregateAnalyzerRecommendations,
  createProcessingSummary,
};


