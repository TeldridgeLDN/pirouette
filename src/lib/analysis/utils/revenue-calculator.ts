/**
 * Revenue Impact Calculator Utilities
 * Pirouette - Design Confidence for Non-Designers
 * 
 * Calculates potential revenue impact from design improvements
 * based on traffic data and industry benchmarks.
 */

import type { RevenueImpact, SuccessMetrics } from '../core/types';

// ============================================================================
// Types
// ============================================================================

interface ImprovementEstimate {
  minImprovement: number; // Minimum expected improvement percentage
  maxImprovement: number; // Maximum expected improvement percentage
  confidence: 'low' | 'medium' | 'high';
  patternStrength: number; // 0-100, based on sample size and quality
}

interface RevenueCalculationInput {
  improvementPercentage: number; // Expected conversion improvement (0-100)
  weeklyTraffic: number; // Number of weekly visitors
  averagePricing: number; // Average product/service price in USD
  confidenceMultiplier: number; // 0-1, adjusts for uncertainty
  conversionRate?: number; // Current conversion rate (0-1), defaults to 0.02 (2%)
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_CONVERSION_RATE = 0.02; // 2% baseline conversion rate
const WEEKS_PER_MONTH = 4.33; // Average weeks in a month

// Industry benchmark improvements by change type
const IMPROVEMENT_BENCHMARKS = {
  cta: {
    min: 15,
    max: 25,
    confidence: 'high' as const,
    description: 'CTA size and prominence improvements',
  },
  contrast: {
    min: 10,
    max: 20,
    confidence: 'high' as const,
    description: 'Contrast ratio improvements (accessibility)',
  },
  whitespace: {
    min: 8,
    max: 15,
    confidence: 'medium' as const,
    description: 'Whitespace and padding improvements',
  },
  typography: {
    min: 5,
    max: 12,
    confidence: 'medium' as const,
    description: 'Typography and readability improvements',
  },
  layout: {
    min: 10,
    max: 18,
    confidence: 'medium' as const,
    description: 'Layout structure improvements',
  },
  complexity: {
    min: 7,
    max: 14,
    confidence: 'low' as const,
    description: 'Complexity reduction improvements',
  },
  hierarchy: {
    min: 8,
    max: 16,
    confidence: 'medium' as const,
    description: 'Visual hierarchy improvements',
  },
} as const;

// ============================================================================
// Revenue Calculation Functions
// ============================================================================

/**
 * Calculate potential monthly recurring revenue impact from design improvements
 */
export function calculateRevenueImpact(input: RevenueCalculationInput): number {
  const {
    improvementPercentage,
    weeklyTraffic,
    averagePricing,
    confidenceMultiplier,
    conversionRate = DEFAULT_CONVERSION_RATE,
  } = input;

  // Calculate additional conversions per week
  const baseConversions = weeklyTraffic * conversionRate;
  const improvedConversions = baseConversions * (1 + improvementPercentage / 100);
  const additionalConversions = improvedConversions - baseConversions;

  // Calculate monthly revenue impact
  const weeklyRevenue = additionalConversions * averagePricing;
  const monthlyRevenue = weeklyRevenue * WEEKS_PER_MONTH;

  // Apply confidence multiplier (conservative estimate)
  const adjustedRevenue = monthlyRevenue * confidenceMultiplier;

  return Math.round(adjustedRevenue);
}

/**
 * Determine confidence level based on pattern data strength and sample size
 */
export function determineConfidenceLevel(
  patternSampleSize: number,
  patternQualityScore: number,
  trafficVolume: number
): 'low' | 'medium' | 'high' {
  // Traffic volume thresholds
  const hasHighTraffic = trafficVolume >= 1000; // 1K+ weekly visitors
  const hasMediumTraffic = trafficVolume >= 500; // 500-999 weekly visitors
  const hasLowTraffic = trafficVolume < 500; // <500 weekly visitors

  // Pattern data thresholds
  const hasStrongPattern = patternSampleSize >= 30 && patternQualityScore >= 80;
  const hasMediumPattern = patternSampleSize >= 15 && patternQualityScore >= 60;

  // Confidence determination logic
  if (hasStrongPattern && hasHighTraffic) {
    return 'high';
  } else if (
    (hasStrongPattern && hasMediumTraffic) ||
    (hasMediumPattern && hasHighTraffic)
  ) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * Get confidence multiplier based on confidence level
 * Used to make revenue estimates more conservative
 */
export function getConfidenceMultiplier(
  confidence: 'low' | 'medium' | 'high'
): number {
  switch (confidence) {
    case 'high':
      return 0.8; // 80% of theoretical maximum
    case 'medium':
      return 0.6; // 60% of theoretical maximum
    case 'low':
      return 0.4; // 40% of theoretical maximum
  }
}

/**
 * Get improvement estimate for a specific dimension/change type
 */
export function getImprovementEstimate(
  dimension: keyof typeof IMPROVEMENT_BENCHMARKS,
  patternStrength: number = 75
): ImprovementEstimate {
  const benchmark = IMPROVEMENT_BENCHMARKS[dimension];

  // Adjust improvement range based on pattern strength
  const strengthMultiplier = patternStrength / 100;
  const adjustedMin = Math.round(benchmark.min * strengthMultiplier);
  const adjustedMax = Math.round(benchmark.max * strengthMultiplier);

  return {
    minImprovement: adjustedMin,
    maxImprovement: adjustedMax,
    confidence: benchmark.confidence,
    patternStrength,
  };
}

/**
 * Calculate time to validate based on traffic volume and change impact
 */
export function calculateTimeToValidate(
  weeklyTraffic: number,
  impactSize: 'small' | 'medium' | 'large'
): string {
  // High traffic sites can validate faster
  if (weeklyTraffic >= 10000) {
    return impactSize === 'large' ? '1 week' : '1-2 weeks';
  } else if (weeklyTraffic >= 1000) {
    return impactSize === 'large' ? '2 weeks' : '2-3 weeks';
  } else if (weeklyTraffic >= 500) {
    return '3-4 weeks';
  } else {
    return '6-8 weeks';
  }
}

/**
 * Determine minimum visitor threshold for reliable measurement
 */
export function getVisitorThreshold(confidence: 'low' | 'medium' | 'high'): number {
  switch (confidence) {
    case 'high':
      return 1000; // Need 1K+ for high confidence
    case 'medium':
      return 500; // Need 500+ for medium confidence
    case 'low':
      return 200; // Need 200+ for low confidence
  }
}

// ============================================================================
// Complete Revenue Impact Generation
// ============================================================================

export interface GenerateRevenueImpactInput {
  dimension: string;
  weeklyTraffic?: number;
  averagePricing?: number;
  patternSampleSize?: number;
  patternQualityScore?: number;
  conversionRate?: number;
}

/**
 * Generate complete revenue impact object for a recommendation
 */
export function generateRevenueImpact(
  input: GenerateRevenueImpactInput
): RevenueImpact | undefined {
  const {
    dimension,
    weeklyTraffic,
    averagePricing = 29, // Default to $29/mo (Pirouette's pricing)
    patternSampleSize = 25,
    patternQualityScore = 75,
    conversionRate = DEFAULT_CONVERSION_RATE,
  } = input;

  // Revenue impact requires traffic data
  if (!weeklyTraffic) {
    return undefined;
  }

  // Get improvement estimate for this dimension
  const dimensionKey = mapDimensionToKey(dimension);
  const estimate = getImprovementEstimate(dimensionKey, patternQualityScore);

  // Use average of min/max for calculation
  const avgImprovement = (estimate.minImprovement + estimate.maxImprovement) / 2;

  // Determine confidence level
  const confidence = determineConfidenceLevel(
    patternSampleSize,
    patternQualityScore,
    weeklyTraffic
  );

  // Get confidence multiplier
  const confidenceMultiplier = getConfidenceMultiplier(confidence);

  // Calculate potential revenue
  const potentialRevenue = calculateRevenueImpact({
    improvementPercentage: avgImprovement,
    weeklyTraffic,
    averagePricing,
    confidenceMultiplier,
    conversionRate,
  });

  // Calculate time to validate
  const impactSize = avgImprovement >= 15 ? 'large' : avgImprovement >= 10 ? 'medium' : 'small';
  const timeToValidate = calculateTimeToValidate(weeklyTraffic, impactSize);

  // Generate calculation method description
  const calculationMethod = `${estimate.minImprovement}-${estimate.maxImprovement}% conversion improvement × ${weeklyTraffic} weekly visitors × $${averagePricing} pricing`;

  return {
    potentialRevenue,
    confidenceLevel: confidence,
    timeToValidate,
    calculationMethod,
  };
}

/**
 * Generate success metrics for a recommendation
 */
export function generateSuccessMetrics(
  input: GenerateRevenueImpactInput
): SuccessMetrics | undefined {
  const {
    dimension,
    weeklyTraffic,
    patternQualityScore = 75,
  } = input;

  // Get improvement estimate
  const dimensionKey = mapDimensionToKey(dimension);
  const estimate = getImprovementEstimate(dimensionKey, patternQualityScore);

  // Determine confidence
  const confidence = weeklyTraffic
    ? determineConfidenceLevel(25, patternQualityScore, weeklyTraffic)
    : 'low';

  // Get visitor threshold
  const visitorThreshold = getVisitorThreshold(confidence);

  // Measurement period based on traffic
  const measurementPeriod = weeklyTraffic
    ? calculateTimeToValidate(weeklyTraffic, 'medium')
    : '4-6 weeks';

  return {
    improvementRange: `${estimate.minImprovement}-${estimate.maxImprovement}%`,
    visitorThreshold,
    measurementPeriod,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Map dimension name to benchmark key
 */
function mapDimensionToKey(
  dimension: string
): keyof typeof IMPROVEMENT_BENCHMARKS {
  const normalized = dimension.toLowerCase();

  if (normalized.includes('cta') || normalized.includes('call-to-action')) {
    return 'cta';
  } else if (normalized.includes('contrast') || normalized.includes('color')) {
    return 'contrast';
  } else if (normalized.includes('whitespace') || normalized.includes('spacing')) {
    return 'whitespace';
  } else if (normalized.includes('typography') || normalized.includes('font')) {
    return 'typography';
  } else if (normalized.includes('layout')) {
    return 'layout';
  } else if (normalized.includes('complexity')) {
    return 'complexity';
  } else if (normalized.includes('hierarchy')) {
    return 'hierarchy';
  }

  // Default to medium confidence improvement
  return 'layout';
}

/**
 * Format revenue for display (e.g., $1,234 or $1.2K)
 */
export function formatRevenue(revenue: number): string {
  if (revenue >= 10000) {
    return `$${(revenue / 1000).toFixed(1)}K`;
  } else if (revenue >= 1000) {
    return `$${(revenue / 1000).toFixed(1)}K`;
  } else {
    return `$${revenue.toLocaleString()}`;
  }
}

/**
 * Generate disclaimer text for revenue estimates
 */
export function getRevenueDisclaimer(): string {
  return 'Revenue estimates are based on industry benchmarks and actual results may vary. These projections assume consistent traffic patterns and typical conversion behavior.';
}

