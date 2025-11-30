/**
 * Traffic Tier Classification Utility
 * 
 * Classifies weekly traffic into tiers and provides tier-specific
 * guidance for recommendation validation and implementation strategies.
 */

// ============================================================================
// Types
// ============================================================================

export type TrafficTier = 'very_low' | 'low' | 'medium' | 'high';

export interface TrafficClassification {
  tier: TrafficTier;
  weeklyVisitors: number;
  label: string;
  description: string;
  validationPeriod: string;
  validationWeeks: number;
  confidenceMultiplier: number;
  sortingStrategy: 'ease' | 'roi';
  advice: TrafficAdvice;
}

export interface TrafficAdvice {
  headline: string;
  summary: string;
  bulletPoints: string[];
  testingStrategy: string;
  warningMessage?: string;
}

// ============================================================================
// Constants
// ============================================================================

const TRAFFIC_THRESHOLDS = {
  VERY_LOW: 100,
  LOW: 1000,
  MEDIUM: 10000,
} as const;

const TIER_CONFIGS: Record<TrafficTier, Omit<TrafficClassification, 'weeklyVisitors' | 'tier'>> = {
  very_low: {
    label: 'Very Low Traffic',
    description: 'Less than 100 visitors per week',
    validationPeriod: '2-3 months',
    validationWeeks: 10,
    confidenceMultiplier: 0.3, // Much lower confidence
    sortingStrategy: 'ease',
    advice: {
      headline: '⚡ Focus on Quick Wins',
      summary: 'With very low traffic, measuring individual changes is challenging. We recommend implementing multiple quick wins together.',
      bulletPoints: [
        'Implement all "Quick Win" recommendations at once to maximize impact',
        'Focus on improvements that are easiest to implement first',
        'Consider traffic generation strategies alongside design improvements',
        'Don\'t expect measurable results for 2-3 months minimum',
        'Track overall conversion rate changes rather than individual metrics',
      ],
      testingStrategy: 'Batch implementation - make multiple changes together since A/B testing isn\'t statistically viable',
      warningMessage: 'Revenue estimates have very low confidence at this traffic level. Focus on implementation ease rather than projected returns.',
    },
  },
  low: {
    label: 'Low Traffic',
    description: '100-1,000 visitors per week',
    validationPeriod: '4-6 weeks',
    validationWeeks: 5,
    confidenceMultiplier: 0.5, // Reduced confidence
    sortingStrategy: 'roi',
    advice: {
      headline: '📊 Strategic Improvements',
      summary: 'You have enough traffic to measure meaningful changes, but validation takes longer. Prioritise high-impact changes.',
      bulletPoints: [
        'Focus on high-impact recommendations that ROI calculations favour',
        'Allow 4-6 weeks to validate each major change',
        'Group smaller changes together for faster iteration',
        'Track conversion rates over weekly periods for trends',
        'Consider running changes for longer to reach statistical significance',
      ],
      testingStrategy: 'Sequential testing - implement one major change at a time, wait 4-6 weeks before measuring results',
      warningMessage: 'Revenue estimates have reduced confidence. Validation periods are longer than typical.',
    },
  },
  medium: {
    label: 'Medium Traffic',
    description: '1,000-10,000 visitors per week',
    validationPeriod: '2-3 weeks',
    validationWeeks: 2.5,
    confidenceMultiplier: 0.7, // Standard confidence
    sortingStrategy: 'roi',
    advice: {
      headline: '✅ Ideal for Optimisation',
      summary: 'Your traffic level is ideal for systematic A/B testing. You can validate changes quickly and confidently.',
      bulletPoints: [
        'Implement recommendations in order of ROI score',
        'Test one change at a time for clear attribution',
        'Expect measurable results within 2-3 weeks',
        'Use standard A/B testing methodologies',
        'Revenue estimates have good confidence at this level',
      ],
      testingStrategy: 'Standard A/B testing - test individual changes for 2-3 weeks to reach statistical significance',
    },
  },
  high: {
    label: 'High Traffic',
    description: 'More than 10,000 visitors per week',
    validationPeriod: '1-2 weeks',
    validationWeeks: 1.5,
    confidenceMultiplier: 0.85, // Highest confidence
    sortingStrategy: 'roi',
    advice: {
      headline: '🚀 Rapid Iteration',
      summary: 'High traffic enables rapid testing and validation. You can run multiple experiments simultaneously.',
      bulletPoints: [
        'Test changes individually for precise measurement',
        'Results visible within 1-2 weeks (often days)',
        'Consider parallel A/B tests for faster iteration',
        'Revenue estimates have high confidence',
        'Even small improvements can have significant revenue impact',
        'Consider multivariate testing for complex changes',
      ],
      testingStrategy: 'Parallel A/B testing - run multiple tests simultaneously with traffic splitting, validate in 1-2 weeks',
    },
  },
};

// ============================================================================
// Classification Functions
// ============================================================================

/**
 * Classify weekly visitor count into a traffic tier
 */
export function classifyTrafficTier(weeklyVisitors: number): TrafficTier {
  if (weeklyVisitors < TRAFFIC_THRESHOLDS.VERY_LOW) return 'very_low';
  if (weeklyVisitors < TRAFFIC_THRESHOLDS.LOW) return 'low';
  if (weeklyVisitors < TRAFFIC_THRESHOLDS.MEDIUM) return 'medium';
  return 'high';
}

/**
 * Get full classification details for a traffic tier
 */
export function getTrafficClassification(weeklyVisitors: number): TrafficClassification {
  const tier = classifyTrafficTier(weeklyVisitors);
  const config = TIER_CONFIGS[tier];
  
  return {
    tier,
    weeklyVisitors,
    ...config,
  };
}

/**
 * Get the tier label for display
 */
export function getTrafficTierLabel(tier: TrafficTier): string {
  return TIER_CONFIGS[tier].label;
}

/**
 * Get the validation period string for a tier
 */
export function getValidationPeriod(tier: TrafficTier): string {
  return TIER_CONFIGS[tier].validationPeriod;
}

/**
 * Get confidence multiplier for revenue estimates based on traffic
 */
export function getTrafficConfidenceMultiplier(weeklyVisitors: number): number {
  const tier = classifyTrafficTier(weeklyVisitors);
  return TIER_CONFIGS[tier].confidenceMultiplier;
}

/**
 * Determine if recommendations should be sorted by ease (vs ROI)
 */
export function shouldSortByEase(weeklyVisitors: number): boolean {
  const tier = classifyTrafficTier(weeklyVisitors);
  return TIER_CONFIGS[tier].sortingStrategy === 'ease';
}

/**
 * Get the badge colour for a traffic tier
 */
export function getTrafficTierBadge(tier: TrafficTier): { emoji: string; color: string; bgColor: string } {
  const badges: Record<TrafficTier, { emoji: string; color: string; bgColor: string }> = {
    very_low: { emoji: '🌱', color: 'text-orange-700', bgColor: 'bg-orange-50' },
    low: { emoji: '📊', color: 'text-amber-700', bgColor: 'bg-amber-50' },
    medium: { emoji: '✅', color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
    high: { emoji: '🚀', color: 'text-indigo-700', bgColor: 'bg-indigo-50' },
  };
  
  return badges[tier];
}

/**
 * Format weekly visitors for display
 */
export function formatWeeklyVisitors(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K`;
  }
  return count.toString();
}

/**
 * Get the minimum sample size needed for statistical significance
 * Based on detecting a 10% relative improvement with 80% power
 */
export function getMinimumSampleSize(baselineConversionRate: number = 0.02): number {
  // Simplified calculation: ~400 conversions needed per variant
  // Sample size = conversions needed / conversion rate
  const conversionsNeeded = 400;
  return Math.ceil(conversionsNeeded / baselineConversionRate);
}

/**
 * Calculate days needed to reach statistical significance
 */
export function getDaysToSignificance(
  weeklyVisitors: number,
  baselineConversionRate: number = 0.02
): number {
  const sampleNeeded = getMinimumSampleSize(baselineConversionRate);
  const dailyVisitors = weeklyVisitors / 7;
  const daysNeeded = Math.ceil(sampleNeeded / dailyVisitors);
  return Math.max(7, daysNeeded); // Minimum 7 days
}

/**
 * Determine if A/B testing is viable at this traffic level
 */
export function isABTestingViable(weeklyVisitors: number): boolean {
  // Need at least ~100 visitors/day for reasonable A/B testing
  return weeklyVisitors >= 700;
}

/**
 * Get testing recommendation based on traffic
 */
export function getTestingRecommendation(weeklyVisitors: number): string {
  const tier = classifyTrafficTier(weeklyVisitors);
  return TIER_CONFIGS[tier].advice.testingStrategy;
}

// ============================================================================
// Exports
// ============================================================================

export {
  TRAFFIC_THRESHOLDS,
  TIER_CONFIGS,
};


