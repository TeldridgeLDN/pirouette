/**
 * Report Quality Validation System
 * 
 * Validates analysis reports against quality standards to ensure
 * actionable, accurate, and useful recommendations for users.
 */

import type { AnalysisReport, Recommendation } from '../core/types';

// ============================================================================
// Types
// ============================================================================

export type QualityCheckId = 
  | 'min_recommendations'
  | 'specific_values'
  | 'effort_estimates'
  | 'pattern_references'
  | 'screenshot_captured'
  | 'all_dimensions_scored'
  | 'valid_score_range'
  | 'overall_score_accuracy'
  | 'recommendation_diversity'
  | 'actionable_descriptions';

export interface QualityCheck {
  id: QualityCheckId;
  name: string;
  description: string;
  weight: number; // 1-10, higher = more important
  category: 'recommendations' | 'data' | 'completeness';
}

export interface QualityCheckResult {
  check: QualityCheck;
  passed: boolean;
  score: number; // 0-100
  message: string;
  details?: string[];
}

export interface QualityValidationResult {
  overallScore: number; // 0-100
  passed: boolean;
  threshold: number;
  checkResults: QualityCheckResult[];
  summary: {
    passed: number;
    failed: number;
    warnings: number;
  };
  failedChecks: QualityCheckId[];
  warnings: string[];
  metadata: {
    validatedAt: string;
    reportId: string;
    environment: string;
  };
}

// ============================================================================
// Quality Checks Configuration
// ============================================================================

export const QUALITY_CHECKS: QualityCheck[] = [
  {
    id: 'min_recommendations',
    name: 'Minimum Recommendations',
    description: 'Report must have at least 3 actionable recommendations',
    weight: 10,
    category: 'recommendations',
  },
  {
    id: 'specific_values',
    name: 'Specific Values',
    description: 'Recommendations should include numerical values (px, %, specific values)',
    weight: 8,
    category: 'recommendations',
  },
  {
    id: 'effort_estimates',
    name: 'Effort Estimates',
    description: 'All recommendations must have effort estimates',
    weight: 7,
    category: 'recommendations',
  },
  {
    id: 'pattern_references',
    name: 'Pattern References',
    description: 'Recommendations should reference design patterns where applicable',
    weight: 5,
    category: 'recommendations',
  },
  {
    id: 'screenshot_captured',
    name: 'Screenshot Captured',
    description: 'Report must include a captured screenshot',
    weight: 6,
    category: 'completeness',
  },
  {
    id: 'all_dimensions_scored',
    name: 'All Dimensions Scored',
    description: 'All 7 analysis dimensions must have scores',
    weight: 10,
    category: 'data',
  },
  {
    id: 'valid_score_range',
    name: 'Valid Score Range',
    description: 'All scores must be between 0 and 100',
    weight: 10,
    category: 'data',
  },
  {
    id: 'overall_score_accuracy',
    name: 'Overall Score Accuracy',
    description: 'Overall score should be close to dimension average (±5 points)',
    weight: 6,
    category: 'data',
  },
  {
    id: 'recommendation_diversity',
    name: 'Recommendation Diversity',
    description: 'Recommendations should cover multiple dimensions',
    weight: 4,
    category: 'recommendations',
  },
  {
    id: 'actionable_descriptions',
    name: 'Actionable Descriptions',
    description: 'Recommendations should have clear, actionable descriptions',
    weight: 7,
    category: 'recommendations',
  },
];

// Production threshold - reports below this won't be shown
export const QUALITY_THRESHOLD = 80;

// Warning threshold - reports below this get flagged
export const WARNING_THRESHOLD = 90;

// ============================================================================
// Quality Check Functions
// ============================================================================

/**
 * Check for minimum number of recommendations
 */
function checkMinRecommendations(report: AnalysisReport): QualityCheckResult {
  const check = QUALITY_CHECKS.find(c => c.id === 'min_recommendations')!;
  const minRequired = 3;
  const count = report.recommendations?.length ?? 0;
  const passed = count >= minRequired;
  
  return {
    check,
    passed,
    score: passed ? 100 : Math.round((count / minRequired) * 100),
    message: passed 
      ? `Report has ${count} recommendations (minimum: ${minRequired})`
      : `Report only has ${count} recommendations (minimum: ${minRequired})`,
    details: !passed ? [`Found ${count} recommendations, need at least ${minRequired}`] : undefined,
  };
}

/**
 * Check if recommendations include specific numerical values
 */
function checkSpecificValues(report: AnalysisReport): QualityCheckResult {
  const check = QUALITY_CHECKS.find(c => c.id === 'specific_values')!;
  const recommendations = report.recommendations ?? [];
  
  if (recommendations.length === 0) {
    return {
      check,
      passed: false,
      score: 0,
      message: 'No recommendations to check for specific values',
    };
  }
  
  // Patterns that indicate specific values
  const specificPatterns = [
    /\d+px/i,           // pixel values
    /\d+%/i,            // percentages
    /\d+\.\d+/,         // decimal numbers
    /contrast ratio/i,   // contrast mentions
    /#[0-9a-f]{3,6}/i,  // hex colors
    /rgb\(/i,           // RGB colors
    /\d+ms/i,           // milliseconds
    /\d+rem/i,          // rem values
    /\d+em/i,           // em values
  ];
  
  let withSpecificValues = 0;
  const vague: string[] = [];
  
  for (const rec of recommendations) {
    const text = `${rec.title} ${rec.description} ${rec.impact}`;
    const hasSpecific = specificPatterns.some(pattern => pattern.test(text));
    
    if (hasSpecific) {
      withSpecificValues++;
    } else {
      vague.push(rec.title);
    }
  }
  
  const percentage = (withSpecificValues / recommendations.length) * 100;
  const passed = percentage >= 70; // At least 70% should have specific values
  
  return {
    check,
    passed,
    score: Math.round(percentage),
    message: `${withSpecificValues}/${recommendations.length} recommendations include specific values`,
    details: vague.length > 0 ? vague.map(t => `"${t}" lacks specific values`) : undefined,
  };
}

/**
 * Check if all recommendations have effort estimates
 */
function checkEffortEstimates(report: AnalysisReport): QualityCheckResult {
  const check = QUALITY_CHECKS.find(c => c.id === 'effort_estimates')!;
  const recommendations = report.recommendations ?? [];
  
  if (recommendations.length === 0) {
    return {
      check,
      passed: true, // No recommendations to check
      score: 100,
      message: 'No recommendations to check for effort estimates',
    };
  }
  
  const withEffort = recommendations.filter(r => r.effort).length;
  const percentage = (withEffort / recommendations.length) * 100;
  const passed = percentage === 100;
  
  const missing = recommendations.filter(r => !r.effort).map(r => r.title);
  
  return {
    check,
    passed,
    score: Math.round(percentage),
    message: passed 
      ? 'All recommendations have effort estimates'
      : `${withEffort}/${recommendations.length} recommendations have effort estimates`,
    details: missing.length > 0 ? missing.map(t => `"${t}" missing effort estimate`) : undefined,
  };
}

/**
 * Check if recommendations reference design patterns
 */
function checkPatternReferences(report: AnalysisReport): QualityCheckResult {
  const check = QUALITY_CHECKS.find(c => c.id === 'pattern_references')!;
  const recommendations = report.recommendations ?? [];
  
  if (recommendations.length === 0) {
    return {
      check,
      passed: true,
      score: 100,
      message: 'No recommendations to check for pattern references',
    };
  }
  
  const withPattern = recommendations.filter(r => r.pattern).length;
  const percentage = (withPattern / recommendations.length) * 100;
  // Less strict - 30% is acceptable for pattern references
  const passed = percentage >= 30;
  
  return {
    check,
    passed,
    score: Math.round(Math.min(100, percentage * 2)), // Scale up for scoring
    message: `${withPattern}/${recommendations.length} recommendations reference patterns`,
  };
}

/**
 * Check if screenshot was captured
 */
function checkScreenshotCaptured(report: AnalysisReport): QualityCheckResult {
  const check = QUALITY_CHECKS.find(c => c.id === 'screenshot_captured')!;
  const hasScreenshot = !!report.screenshot;
  
  return {
    check,
    passed: hasScreenshot,
    score: hasScreenshot ? 100 : 0,
    message: hasScreenshot 
      ? 'Screenshot was captured successfully'
      : 'Screenshot was not captured',
  };
}

/**
 * Check if all 7 dimensions are scored
 */
function checkAllDimensionsScored(report: AnalysisReport): QualityCheckResult {
  const check = QUALITY_CHECKS.find(c => c.id === 'all_dimensions_scored')!;
  
  const requiredDimensions = [
    'colors',
    'whitespace', 
    'complexity',
    'imageText',
    'typography',
    'layout',
    'ctaProminence',
  ];
  
  const scores = report.dimensionScores ?? {};
  const missing: string[] = [];
  
  for (const dim of requiredDimensions) {
    if (scores[dim as keyof typeof scores] === undefined || scores[dim as keyof typeof scores] === null) {
      missing.push(dim);
    }
  }
  
  const scoredCount = requiredDimensions.length - missing.length;
  const passed = missing.length === 0;
  
  return {
    check,
    passed,
    score: Math.round((scoredCount / requiredDimensions.length) * 100),
    message: passed 
      ? 'All 7 dimensions have scores'
      : `Missing scores for: ${missing.join(', ')}`,
    details: missing.length > 0 ? missing.map(d => `${d} dimension has no score`) : undefined,
  };
}

/**
 * Check if all scores are in valid range (0-100)
 */
function checkValidScoreRange(report: AnalysisReport): QualityCheckResult {
  const check = QUALITY_CHECKS.find(c => c.id === 'valid_score_range')!;
  
  const scores = report.dimensionScores ?? {};
  const invalid: string[] = [];
  
  for (const [dim, score] of Object.entries(scores)) {
    if (typeof score !== 'number' || score < 0 || score > 100) {
      invalid.push(`${dim}: ${score}`);
    }
  }
  
  // Check overall score too
  if (typeof report.overallScore !== 'number' || report.overallScore < 0 || report.overallScore > 100) {
    invalid.push(`overall: ${report.overallScore}`);
  }
  
  const passed = invalid.length === 0;
  
  return {
    check,
    passed,
    score: passed ? 100 : 0,
    message: passed 
      ? 'All scores are within valid range (0-100)'
      : `Invalid scores found: ${invalid.join(', ')}`,
    details: invalid.length > 0 ? invalid.map(s => `Score out of range: ${s}`) : undefined,
  };
}

/**
 * Check if overall score matches dimension average
 */
function checkOverallScoreAccuracy(report: AnalysisReport): QualityCheckResult {
  const check = QUALITY_CHECKS.find(c => c.id === 'overall_score_accuracy')!;
  
  const scores = report.dimensionScores ?? {};
  const scoreValues = Object.values(scores).filter(s => typeof s === 'number') as number[];
  
  if (scoreValues.length === 0) {
    return {
      check,
      passed: false,
      score: 0,
      message: 'No dimension scores to calculate average',
    };
  }
  
  const average = scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length;
  const difference = Math.abs(report.overallScore - average);
  const passed = difference <= 5; // Within 5 points
  
  return {
    check,
    passed,
    score: Math.max(0, 100 - (difference * 10)), // -10 per point of deviation
    message: passed
      ? `Overall score (${report.overallScore}) matches dimension average (${Math.round(average)})`
      : `Overall score (${report.overallScore}) differs from dimension average (${Math.round(average)}) by ${Math.round(difference)} points`,
  };
}

/**
 * Check if recommendations cover multiple dimensions
 */
function checkRecommendationDiversity(report: AnalysisReport): QualityCheckResult {
  const check = QUALITY_CHECKS.find(c => c.id === 'recommendation_diversity')!;
  const recommendations = report.recommendations ?? [];
  
  if (recommendations.length === 0) {
    return {
      check,
      passed: true,
      score: 100,
      message: 'No recommendations to check for diversity',
    };
  }
  
  const dimensions = new Set(recommendations.map(r => r.dimension));
  const diversityCount = dimensions.size;
  const minDiversity = Math.min(3, recommendations.length); // At least 3 dimensions or count of recs
  const passed = diversityCount >= minDiversity;
  
  return {
    check,
    passed,
    score: Math.min(100, Math.round((diversityCount / 7) * 100)), // 7 possible dimensions
    message: `Recommendations cover ${diversityCount} dimensions`,
    details: [`Dimensions covered: ${Array.from(dimensions).join(', ')}`],
  };
}

/**
 * Check if recommendation descriptions are actionable
 */
function checkActionableDescriptions(report: AnalysisReport): QualityCheckResult {
  const check = QUALITY_CHECKS.find(c => c.id === 'actionable_descriptions')!;
  const recommendations = report.recommendations ?? [];
  
  if (recommendations.length === 0) {
    return {
      check,
      passed: true,
      score: 100,
      message: 'No recommendations to check for actionable descriptions',
    };
  }
  
  // Action words that indicate actionable advice
  const actionWords = [
    'increase', 'decrease', 'add', 'remove', 'change', 'update', 'improve',
    'reduce', 'enhance', 'adjust', 'implement', 'use', 'replace', 'consider',
    'ensure', 'make', 'set', 'apply', 'test', 'try', 'move', 'resize',
  ];
  
  let actionableCount = 0;
  const vague: string[] = [];
  
  for (const rec of recommendations) {
    const text = `${rec.title} ${rec.description}`.toLowerCase();
    const hasAction = actionWords.some(word => text.includes(word));
    
    // Also check for minimum description length
    const hasSubstance = rec.description.length >= 50;
    
    if (hasAction && hasSubstance) {
      actionableCount++;
    } else {
      vague.push(rec.title);
    }
  }
  
  const percentage = (actionableCount / recommendations.length) * 100;
  const passed = percentage >= 80;
  
  return {
    check,
    passed,
    score: Math.round(percentage),
    message: `${actionableCount}/${recommendations.length} recommendations are actionable`,
    details: vague.length > 0 ? vague.map(t => `"${t}" may not be actionable enough`) : undefined,
  };
}

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Run all quality checks on an analysis report
 */
export function validateReportQuality(report: AnalysisReport): QualityValidationResult {
  const environment = process.env.NODE_ENV || 'development';
  
  // Run all checks
  const checkResults: QualityCheckResult[] = [
    checkMinRecommendations(report),
    checkSpecificValues(report),
    checkEffortEstimates(report),
    checkPatternReferences(report),
    checkScreenshotCaptured(report),
    checkAllDimensionsScored(report),
    checkValidScoreRange(report),
    checkOverallScoreAccuracy(report),
    checkRecommendationDiversity(report),
    checkActionableDescriptions(report),
  ];
  
  // Calculate weighted overall score
  let weightedScore = 0;
  let totalWeight = 0;
  
  for (const result of checkResults) {
    weightedScore += result.score * result.check.weight;
    totalWeight += result.check.weight;
  }
  
  const overallScore = Math.round(weightedScore / totalWeight);
  
  // Gather failed checks
  const failedChecks = checkResults
    .filter(r => !r.passed)
    .map(r => r.check.id);
  
  // Generate warnings
  const warnings: string[] = [];
  
  for (const result of checkResults) {
    if (!result.passed) {
      warnings.push(result.message);
    } else if (result.score < 100 && result.details?.length) {
      // Partial pass warnings
      warnings.push(`${result.check.name}: ${result.details[0]}`);
    }
  }
  
  // Count results
  const summary = {
    passed: checkResults.filter(r => r.passed).length,
    failed: checkResults.filter(r => !r.passed).length,
    warnings: checkResults.filter(r => r.passed && r.score < 100).length,
  };
  
  return {
    overallScore,
    passed: overallScore >= QUALITY_THRESHOLD,
    threshold: QUALITY_THRESHOLD,
    checkResults,
    summary,
    failedChecks,
    warnings,
    metadata: {
      validatedAt: new Date().toISOString(),
      reportId: report.id,
      environment,
    },
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get quality level from score
 */
export function getQualityLevel(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (score >= 95) return 'excellent';
  if (score >= 85) return 'good';
  if (score >= QUALITY_THRESHOLD) return 'fair';
  return 'poor';
}

/**
 * Get quality badge info
 */
export function getQualityBadge(score: number): { label: string; color: string; emoji: string } {
  const level = getQualityLevel(score);
  
  switch (level) {
    case 'excellent':
      return { label: 'Excellent Quality', color: 'emerald', emoji: '✨' };
    case 'good':
      return { label: 'Good Quality', color: 'blue', emoji: '✓' };
    case 'fair':
      return { label: 'Fair Quality', color: 'amber', emoji: '⚠️' };
    case 'poor':
      return { label: 'Needs Review', color: 'red', emoji: '⚠️' };
  }
}

/**
 * Check if report meets production threshold
 */
export function meetsProductionThreshold(validationResult: QualityValidationResult): boolean {
  return validationResult.overallScore >= QUALITY_THRESHOLD;
}

/**
 * Check if report needs warning banner
 */
export function needsWarningBanner(validationResult: QualityValidationResult): boolean {
  return validationResult.overallScore < WARNING_THRESHOLD;
}

/**
 * Format quality issues for display
 */
export function formatQualityIssues(validationResult: QualityValidationResult): string[] {
  return validationResult.checkResults
    .filter(r => !r.passed)
    .map(r => `${r.check.name}: ${r.message}`);
}

/**
 * Get priority quality improvements
 */
export function getPriorityImprovements(validationResult: QualityValidationResult, limit = 3): string[] {
  return validationResult.checkResults
    .filter(r => !r.passed || r.score < 100)
    .sort((a, b) => b.check.weight - a.check.weight) // Sort by weight (most important first)
    .slice(0, limit)
    .map(r => r.message);
}

export default {
  validateReportQuality,
  getQualityLevel,
  getQualityBadge,
  meetsProductionThreshold,
  needsWarningBanner,
  formatQualityIssues,
  getPriorityImprovements,
  QUALITY_THRESHOLD,
  WARNING_THRESHOLD,
  QUALITY_CHECKS,
};

