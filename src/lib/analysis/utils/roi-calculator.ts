/**
 * ROI Calculator for Recommendation Prioritization
 * Pirouette - Design Confidence for Non-Designers
 * 
 * Calculates ROI scores to prioritize recommendations as "quick wins"
 * based on impact, effort, and time-to-results.
 */

// ============================================================================
// Types
// ============================================================================

export type ROICategory = 'quick-win' | 'strategic' | 'long-term';

export interface ROIScore {
  score: number; // Raw ROI score (unbounded)
  normalizedScore: number; // 0-10 scale for display
  category: ROICategory;
  breakdown: {
    impactScore: number; // 0-10
    effortMinutes: number;
    timeToResultsWeeks: number;
  };
}

export interface EffortEstimate {
  minutes: number;
  humanReadable: string; // "15 minutes", "1 hour", etc.
  category: 'trivial' | 'quick' | 'moderate' | 'substantial';
}

// ============================================================================
// Constants
// ============================================================================

// Effort categories (in minutes)
const EFFORT_THRESHOLDS = {
  trivial: 15, // < 15 minutes
  quick: 60, // 15-60 minutes
  moderate: 240, // 1-4 hours
  substantial: Infinity, // > 4 hours
} as const;

// ROI category thresholds (normalized 0-10 scale)
const ROI_THRESHOLDS = {
  quickWin: 5, // >= 5/10 (high ROI)
  strategic: 2, // >= 2/10 but < 5/10 (medium ROI)
  longTerm: 0, // < 2/10 (low ROI)
} as const;

// Impact level to numeric score mapping
const IMPACT_SCORES = {
  high: 10,
  medium: 5,
  low: 2,
} as const;

// Time to results defaults by change type
export const TIME_TO_RESULTS_DEFAULTS = {
  ui: 1, // 1 week for UI changes
  content: 2, // 2 weeks for content changes
  structural: 3, // 3 weeks for structural changes
  performance: 2, // 2 weeks for performance optimizations
  accessibility: 1, // 1 week for accessibility fixes
  other: 2, // 2 weeks default
} as const;

// ============================================================================
// Effort Parsing Functions
// ============================================================================

/**
 * Parse human-readable effort estimate into minutes
 * Handles formats like: "15 minutes", "1 hour", "2.5 hours", "30 min", "1h", etc.
 */
export function parseEffortEstimate(effort: string): number {
  if (!effort || typeof effort !== 'string') {
    throw new Error('Effort estimate must be a non-empty string');
  }

  const normalized = effort.toLowerCase().trim();

  // Extract number and unit
  const match = normalized.match(/^(\d+(?:\.\d+)?)\s*(minute|minutes|min|hour|hours|h|hr|hrs)?$/);

  if (!match) {
    throw new Error(`Invalid effort format: "${effort}". Expected format like "15 minutes" or "2 hours"`);
  }

  const value = parseFloat(match[1]);
  const unit = match[2] || 'minutes'; // Default to minutes if no unit

  // Convert to minutes
  if (unit.startsWith('h')) {
    return value * 60; // hours to minutes
  } else if (unit.startsWith('m')) {
    return value; // already in minutes
  }

  throw new Error(`Unknown time unit in: "${effort}"`);
}

/**
 * Convert minutes back to human-readable format
 */
export function formatEffortEstimate(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    const hours = minutes / 60;
    if (hours === Math.floor(hours)) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      return `${hours.toFixed(1)} hours`;
    }
  }
}

/**
 * Categorize effort level based on time required
 */
export function categorizeEffort(minutes: number): EffortEstimate['category'] {
  if (minutes < EFFORT_THRESHOLDS.trivial) {
    return 'trivial';
  } else if (minutes < EFFORT_THRESHOLDS.quick) {
    return 'quick';
  } else if (minutes < EFFORT_THRESHOLDS.moderate) {
    return 'moderate';
  } else {
    return 'substantial';
  }
}

/**
 * Get complete effort estimate object
 */
export function getEffortEstimate(effortString: string): EffortEstimate {
  const minutes = parseEffortEstimate(effortString);
  const humanReadable = formatEffortEstimate(minutes);
  const category = categorizeEffort(minutes);

  return {
    minutes,
    humanReadable,
    category,
  };
}

// ============================================================================
// ROI Calculation Functions
// ============================================================================

/**
 * Calculate raw ROI score
 * Formula: ROI = impact_score / (effort_minutes × time_to_results_weeks)
 * 
 * Higher ROI = Better investment (more impact per unit of effort × time)
 */
export function calculateROI(
  impactScore: number,
  effortMinutes: number,
  timeToResultsWeeks: number
): number {
  // Validate inputs
  if (impactScore <= 0) {
    throw new Error('Impact score must be positive');
  }
  if (effortMinutes <= 0) {
    throw new Error('Effort minutes must be positive');
  }
  if (timeToResultsWeeks <= 0) {
    throw new Error('Time to results must be positive');
  }

  // Calculate raw ROI
  const rawROI = impactScore / (effortMinutes * timeToResultsWeeks);

  return rawROI;
}

/**
 * Normalize ROI score to 0-10 scale for display
 * Uses logarithmic scaling to handle wide range of raw ROI values
 */
export function normalizeROIScore(rawROI: number): number {
  // Use logarithmic scaling to compress the range
  // This makes the 0-10 scale more meaningful
  // ROI of 0.01 ≈ 0, ROI of 1.0 ≈ 10
  const normalized = Math.log10(rawROI + 0.1) * 3.33 + 6.67;

  // Clamp to 0-10 range
  return Math.max(0, Math.min(10, normalized));
}

/**
 * Categorize ROI into quick-win, strategic, or long-term
 */
export function categorizeROI(normalizedScore: number): ROICategory {
  if (normalizedScore >= ROI_THRESHOLDS.quickWin) {
    return 'quick-win';
  } else if (normalizedScore >= ROI_THRESHOLDS.strategic) {
    return 'strategic';
  } else {
    return 'long-term';
  }
}

/**
 * Get ROI category label for display
 */
export function getROICategoryLabel(category: ROICategory): string {
  switch (category) {
    case 'quick-win':
      return 'Quick Win';
    case 'strategic':
      return 'Strategic Improvement';
    case 'long-term':
      return 'Long-term Project';
  }
}

/**
 * Get ROI category description
 */
export function getROICategoryDescription(category: ROICategory): string {
  switch (category) {
    case 'quick-win':
      return 'High impact with low effort - implement these first for maximum results';
    case 'strategic':
      return 'Moderate ROI - valuable improvements that require more time or effort';
    case 'long-term':
      return 'Lower ROI - consider these after completing quick wins';
  }
}

// ============================================================================
// Complete ROI Scoring
// ============================================================================

export interface CalculateROIScoreInput {
  impact: 'high' | 'medium' | 'low' | number; // Can be string or numeric
  effort: string | number; // "15 minutes" or numeric minutes
  timeToResults?: number; // Weeks, defaults to 2
  changeType?: keyof typeof TIME_TO_RESULTS_DEFAULTS; // For auto time-to-results
}

/**
 * Calculate complete ROI score with categorization
 * Main function to use when generating recommendations
 */
export function calculateROIScore(input: CalculateROIScoreInput): ROIScore {
  const { impact, effort, timeToResults, changeType } = input;

  // Convert impact to numeric score
  let impactScore: number;
  if (typeof impact === 'number') {
    impactScore = impact;
  } else {
    impactScore = IMPACT_SCORES[impact];
  }

  // Convert effort to minutes
  let effortMinutes: number;
  if (typeof effort === 'number') {
    effortMinutes = effort;
  } else {
    effortMinutes = parseEffortEstimate(effort);
  }

  // Determine time to results
  let timeToResultsWeeks: number;
  if (timeToResults !== undefined) {
    timeToResultsWeeks = timeToResults;
  } else if (changeType !== undefined) {
    timeToResultsWeeks = TIME_TO_RESULTS_DEFAULTS[changeType];
  } else {
    timeToResultsWeeks = TIME_TO_RESULTS_DEFAULTS.other;
  }

  // Calculate raw and normalized ROI
  const rawScore = calculateROI(impactScore, effortMinutes, timeToResultsWeeks);
  const normalizedScore = normalizeROIScore(rawScore);
  const category = categorizeROI(normalizedScore);

  return {
    score: rawScore,
    normalizedScore: Number(normalizedScore.toFixed(1)), // Round to 1 decimal
    category,
    breakdown: {
      impactScore,
      effortMinutes,
      timeToResultsWeeks,
    },
  };
}

// ============================================================================
// Sorting and Filtering Functions
// ============================================================================

/**
 * Compare function for sorting recommendations by ROI (highest first)
 */
export function compareByROI(a: ROIScore, b: ROIScore): number {
  return b.score - a.score; // Higher ROI first
}

/**
 * Group recommendations by ROI category
 */
export function groupByROICategory<T extends { roiScore: ROIScore }>(
  recommendations: T[]
): {
  quickWins: T[];
  strategic: T[];
  longTerm: T[];
} {
  const quickWins: T[] = [];
  const strategic: T[] = [];
  const longTerm: T[] = [];

  for (const rec of recommendations) {
    switch (rec.roiScore.category) {
      case 'quick-win':
        quickWins.push(rec);
        break;
      case 'strategic':
        strategic.push(rec);
        break;
      case 'long-term':
        longTerm.push(rec);
        break;
    }
  }

  return { quickWins, strategic, longTerm };
}

/**
 * Sort recommendations by ROI score (highest first)
 */
export function sortByROI<T extends { roiScore: ROIScore }>(
  recommendations: T[]
): T[] {
  return [...recommendations].sort((a, b) => compareByROI(a.roiScore, b.roiScore));
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get change type from dimension name
 */
export function inferChangeType(dimension: string): keyof typeof TIME_TO_RESULTS_DEFAULTS {
  const normalized = dimension.toLowerCase();

  if (normalized.includes('cta') || normalized.includes('button')) {
    return 'ui';
  } else if (normalized.includes('content') || normalized.includes('copy')) {
    return 'content';
  } else if (normalized.includes('layout') || normalized.includes('structure')) {
    return 'structural';
  } else if (normalized.includes('performance') || normalized.includes('speed')) {
    return 'performance';
  } else if (normalized.includes('accessibility') || normalized.includes('contrast')) {
    return 'accessibility';
  } else {
    return 'other';
  }
}

/**
 * Format ROI score for display
 */
export function formatROIScore(normalizedScore: number): string {
  return `${normalizedScore.toFixed(1)}/10`;
}

/**
 * Get visual indicator for ROI category
 */
export function getROIBadge(category: ROICategory): {
  emoji: string;
  color: string;
  label: string;
} {
  switch (category) {
    case 'quick-win':
      return {
        emoji: '⚡',
        color: 'green',
        label: 'Quick Win!',
      };
    case 'strategic':
      return {
        emoji: '📈',
        color: 'blue',
        label: 'Strategic',
      };
    case 'long-term':
      return {
        emoji: '🎯',
        color: 'gray',
        label: 'Long-term',
      };
  }
}


