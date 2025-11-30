// @ts-nocheck
/**
 * Effort Estimation Module
 * 
 * Assigns time estimates to recommendations based on task type,
 * complexity, and common implementation patterns.
 * 
 * This is Subtask 9.4 of the recommendation generation system.
 */

import type { Recommendation } from '../core/types';

// ============================================================================
// Effort Estimation Database
// ============================================================================

/**
 * Base effort estimates by change type (in minutes)
 */
const BASE_EFFORT_BY_CHANGE_TYPE: Record<NonNullable<Recommendation['changeType']>, number> = {
  ui: 30, // Simple CSS/styling changes
  content: 45, // Text updates, minor content changes
  structural: 120, // Layout changes, component restructuring
  performance: 90, // Optimisation work
  accessibility: 60, // WCAG fixes, a11y improvements
  other: 60, // General fallback
};

/**
 * Multipliers based on effort level (low/medium/high)
 */
const EFFORT_LEVEL_MULTIPLIERS: Record<Recommendation['effort'], number> = {
  low: 0.5, // Half the base time
  medium: 1.0, // Base time
  high: 2.5, // 2.5x base time
};

/**
 * Complexity adjustments based on dimension
 * Some dimensions typically require more careful implementation
 */
const DIMENSION_COMPLEXITY: Record<string, number> = {
  colors: 0.8, // Usually straightforward CSS changes
  whitespace: 0.9, // Padding/margin adjustments
  typography: 0.9, // Font changes
  layout: 1.5, // More complex, affects multiple elements
  ctaProminence: 0.7, // Usually simple button changes
  hierarchy: 1.3, // Requires careful consideration
  complexity: 1.2, // Often involves removing/reorganising content
};

/**
 * Specific task effort estimates (overrides)
 * Maps recommendation title patterns to specific minute estimates
 */
const SPECIFIC_TASK_ESTIMATES: Array<{
  pattern: RegExp;
  minutes: number;
  confidence: 'high' | 'medium' | 'low';
}> = [
  // Quick fixes (< 15 minutes)
  { pattern: /line.?height/i, minutes: 10, confidence: 'high' },
  { pattern: /contrast.*text/i, minutes: 15, confidence: 'high' },
  { pattern: /button.*color/i, minutes: 10, confidence: 'high' },
  
  // Standard fixes (15-60 minutes)
  { pattern: /wcag.*aa/i, minutes: 45, confidence: 'medium' },
  { pattern: /cta.*above.*fold/i, minutes: 20, confidence: 'high' },
  { pattern: /add.*cta/i, minutes: 30, confidence: 'high' },
  { pattern: /reduce.*cta/i, minutes: 15, confidence: 'high' },
  { pattern: /whitespace|breathing.*room/i, minutes: 45, confidence: 'medium' },
  { pattern: /cta.*prominence|cta.*contrast/i, minutes: 25, confidence: 'high' },
  
  // Medium complexity (1-2 hours)
  { pattern: /color.*palette/i, minutes: 90, confidence: 'medium' },
  { pattern: /css.*grid/i, minutes: 120, confidence: 'medium' },
  { pattern: /layout.*structure/i, minutes: 150, confidence: 'low' },
  
  // High complexity (2+ hours)
  { pattern: /mobile.*responsive/i, minutes: 240, confidence: 'low' },
  { pattern: /responsive/i, minutes: 180, confidence: 'low' },
];

// ============================================================================
// Effort Estimation Functions
// ============================================================================

/**
 * Estimates effort in minutes for a single recommendation
 */
export function estimateEffortMinutes(recommendation: Recommendation): number {
  // First, check for specific task overrides
  for (const specific of SPECIFIC_TASK_ESTIMATES) {
    if (specific.pattern.test(recommendation.title)) {
      return specific.minutes;
    }
  }
  
  // Otherwise, calculate from base estimates
  const changeType = recommendation.changeType || 'other';
  const baseEffort = BASE_EFFORT_BY_CHANGE_TYPE[changeType];
  const levelMultiplier = EFFORT_LEVEL_MULTIPLIERS[recommendation.effort];
  const dimensionMultiplier = DIMENSION_COMPLEXITY[recommendation.dimension] || 1.0;
  
  const estimatedMinutes = baseEffort * levelMultiplier * dimensionMultiplier;
  
  // Round to nearest 5 minutes
  return Math.round(estimatedMinutes / 5) * 5;
}

/**
 * Formats minutes as a human-readable string
 */
export function formatEffortEstimate(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutes`;
  } else if (minutes < 120) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hour`;
    }
    return `${hours} hour ${remainingMinutes} minutes`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hours`;
    }
    return `${hours} hours ${remainingMinutes} minutes`;
  }
}

/**
 * Gets the confidence level for an effort estimate
 */
export function getEstimateConfidence(recommendation: Recommendation): 'high' | 'medium' | 'low' {
  // Check if we have a specific estimate with known confidence
  for (const specific of SPECIFIC_TASK_ESTIMATES) {
    if (specific.pattern.test(recommendation.title)) {
      return specific.confidence;
    }
  }
  
  // Default confidence based on change type
  const changeType = recommendation.changeType || 'other';
  const confidenceByChangeType: Record<string, 'high' | 'medium' | 'low'> = {
    ui: 'high', // UI changes are predictable
    content: 'high', // Content changes are predictable
    accessibility: 'medium', // A11y can vary
    performance: 'medium', // Performance work varies
    structural: 'low', // Structural changes are unpredictable
    other: 'low', // Unknown tasks
  };
  
  return confidenceByChangeType[changeType];
}

/**
 * Calculates total effort for a list of recommendations
 */
export function calculateTotalEffort(recommendations: Recommendation[]): {
  totalMinutes: number;
  formattedTotal: string;
  breakdown: {
    low: number;
    medium: number;
    high: number;
  };
} {
  let totalMinutes = 0;
  const breakdown = { low: 0, medium: 0, high: 0 };
  
  for (const rec of recommendations) {
    const minutes = estimateEffortMinutes(rec);
    totalMinutes += minutes;
    breakdown[rec.effort] += minutes;
  }
  
  return {
    totalMinutes,
    formattedTotal: formatEffortEstimate(totalMinutes),
    breakdown,
  };
}

/**
 * Groups recommendations by effort category
 */
export function groupByEffortCategory(recommendations: Recommendation[]): {
  quickFixes: Recommendation[]; // < 30 minutes
  standardTasks: Recommendation[]; // 30-120 minutes
  majorProjects: Recommendation[]; // > 120 minutes
} {
  const quickFixes: Recommendation[] = [];
  const standardTasks: Recommendation[] = [];
  const majorProjects: Recommendation[] = [];
  
  for (const rec of recommendations) {
    const minutes = estimateEffortMinutes(rec);
    
    if (minutes < 30) {
      quickFixes.push(rec);
    } else if (minutes <= 120) {
      standardTasks.push(rec);
    } else {
      majorProjects.push(rec);
    }
  }
  
  return { quickFixes, standardTasks, majorProjects };
}

/**
 * Enriches recommendations with effort estimates
 */
export function enrichWithEffortEstimates(recommendations: Recommendation[]): Array<Recommendation & {
  effortMinutes: number;
  effortFormatted: string;
  effortConfidence: 'high' | 'medium' | 'low';
}> {
  return recommendations.map((rec) => ({
    ...rec,
    effortMinutes: estimateEffortMinutes(rec),
    effortFormatted: formatEffortEstimate(estimateEffortMinutes(rec)),
    effortConfidence: getEstimateConfidence(rec),
  }));
}

/**
 * Creates an effort summary for display
 */
export function createEffortSummary(recommendations: Recommendation[]): {
  totalTasks: number;
  totalEffort: string;
  averageEffort: string;
  quickFixCount: number;
  quickFixTime: string;
  categories: {
    quickFixes: { count: number; totalMinutes: number };
    standardTasks: { count: number; totalMinutes: number };
    majorProjects: { count: number; totalMinutes: number };
  };
} {
  const grouped = groupByEffortCategory(recommendations);
  const total = calculateTotalEffort(recommendations);
  
  const quickFixMinutes = grouped.quickFixes.reduce(
    (sum, rec) => sum + estimateEffortMinutes(rec), 0
  );
  const standardMinutes = grouped.standardTasks.reduce(
    (sum, rec) => sum + estimateEffortMinutes(rec), 0
  );
  const majorMinutes = grouped.majorProjects.reduce(
    (sum, rec) => sum + estimateEffortMinutes(rec), 0
  );
  
  const averageMinutes = recommendations.length > 0
    ? Math.round(total.totalMinutes / recommendations.length)
    : 0;
  
  return {
    totalTasks: recommendations.length,
    totalEffort: total.formattedTotal,
    averageEffort: formatEffortEstimate(averageMinutes),
    quickFixCount: grouped.quickFixes.length,
    quickFixTime: formatEffortEstimate(quickFixMinutes),
    categories: {
      quickFixes: { count: grouped.quickFixes.length, totalMinutes: quickFixMinutes },
      standardTasks: { count: grouped.standardTasks.length, totalMinutes: standardMinutes },
      majorProjects: { count: grouped.majorProjects.length, totalMinutes: majorMinutes },
    },
  };
}

/**
 * Provides effort estimate disclaimer
 */
export function getEffortDisclaimer(): string {
  return 'Time estimates are based on typical implementation patterns and may vary depending on your specific codebase, team experience, and existing infrastructure.';
}

// ============================================================================
// Exports
// ============================================================================

export default {
  estimateEffortMinutes,
  formatEffortEstimate,
  getEstimateConfidence,
  calculateTotalEffort,
  groupByEffortCategory,
  enrichWithEffortEstimates,
  createEffortSummary,
  getEffortDisclaimer,
};


