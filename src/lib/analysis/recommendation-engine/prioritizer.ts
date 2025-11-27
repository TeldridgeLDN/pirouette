// @ts-nocheck
/**
 * Recommendation Prioritizer
 * 
 * Integrates ROI and revenue impact calculators to prioritize recommendations
 * by business value. Connects the utilities from Tasks 26 & 27.
 * 
 * This is Subtask 9.5 of the recommendation generation system.
 */

import type { Recommendation, RevenueImpact, SuccessMetrics, ROIScoreData } from '../core/types';
import {
  generateRevenueImpact,
  generateSuccessMetrics,
  formatRevenue,
  getRevenueDisclaimer,
} from '../utils/revenue-calculator';
import {
  calculateROIScore,
  sortByROI,
  groupByROICategory,
  formatROIScore,
  getROIBadge,
  inferChangeType,
} from '../utils/roi-calculator';
import { estimateEffortMinutes, formatEffortEstimate } from './effort-estimator';

// ============================================================================
// Types
// ============================================================================

/**
 * Context needed for revenue and ROI calculations
 */
export interface PrioritizationContext {
  weeklyTraffic?: number; // Weekly visitors to the site
  averagePricing?: number; // Average monthly price per customer
  patternQualityScore?: number; // Quality score from pattern matching (0-100)
}

/**
 * Fully enriched recommendation with all prioritization data
 */
export interface PrioritizedRecommendation extends Recommendation {
  effortMinutes: number;
  effortFormatted: string;
  revenueImpact?: RevenueImpact;
  successMetrics?: SuccessMetrics;
  roiScore?: ROIScoreData;
  roiFormatted?: string;
  roiBadge?: string;
  priorityRank: number;
}

// ============================================================================
// Prioritization Functions
// ============================================================================

/**
 * Enriches a single recommendation with ROI and revenue data
 */
export function enrichRecommendation(
  recommendation: Recommendation,
  context: PrioritizationContext
): PrioritizedRecommendation {
  // Calculate effort
  const effortMinutes = estimateEffortMinutes(recommendation);
  const effortFormatted = formatEffortEstimate(effortMinutes);
  
  // Infer change type if not set
  const changeType = recommendation.changeType || inferChangeType(
    recommendation.dimension,
    recommendation.description
  );
  
  // Generate revenue impact (if traffic data available)
  let revenueImpact: RevenueImpact | undefined;
  if (context.weeklyTraffic && context.weeklyTraffic > 0) {
    // Map dimension string to the expected type
    const dimensionKey = recommendation.dimension as 'colors' | 'whitespace' | 'complexity' | 'typography' | 'layout' | 'ctaProminence' | 'hierarchy';
    revenueImpact = generateRevenueImpact({
      dimension: dimensionKey,
      weeklyTraffic: context.weeklyTraffic,
      averagePricing: context.averagePricing,
      patternQualityScore: context.patternQualityScore,
      changeType,
    });
  }
  
  // Generate success metrics
  const dimensionKey = recommendation.dimension as 'colors' | 'whitespace' | 'complexity' | 'typography' | 'layout' | 'ctaProminence' | 'hierarchy';
  const successMetrics = generateSuccessMetrics({
    dimension: dimensionKey,
    weeklyTraffic: context.weeklyTraffic,
    changeType,
  });
  
  // Calculate ROI score
  const roiResult = calculateROIScore({
    impact: recommendation.priority,
    effort: effortMinutes > 0 ? `${effortMinutes} minutes` : recommendation.effort,
    changeType,
    dimension: recommendation.dimension,
    description: recommendation.description,
  });
  
  const roiScore: ROIScoreData = {
    score: roiResult.score,
    normalizedScore: roiResult.normalizedScore,
    category: roiResult.category,
    breakdown: roiResult.breakdown,
  };
  
  return {
    ...recommendation,
    changeType,
    effortMinutes,
    effortFormatted,
    revenueImpact,
    successMetrics,
    roiScore,
    roiFormatted: formatROIScore(roiResult.normalizedScore),
    roiBadge: getROIBadge(roiResult.category),
    priorityRank: 0, // Will be set during sorting
  };
}

/**
 * Enriches and prioritizes all recommendations
 */
export function prioritizeRecommendations(
  recommendations: Recommendation[],
  context: PrioritizationContext
): PrioritizedRecommendation[] {
  // Enrich all recommendations
  const enriched = recommendations.map((rec) => enrichRecommendation(rec, context));
  
  // Sort by ROI score (highest first)
  enriched.sort((a, b) => {
    const roiA = a.roiScore?.normalizedScore || 0;
    const roiB = b.roiScore?.normalizedScore || 0;
    return roiB - roiA;
  });
  
  // Assign priority ranks
  enriched.forEach((rec, index) => {
    rec.priorityRank = index + 1;
  });
  
  return enriched;
}

/**
 * Gets quick wins - high ROI, low effort recommendations
 */
export function getQuickWins(
  prioritized: PrioritizedRecommendation[]
): PrioritizedRecommendation[] {
  return prioritized.filter((rec) => rec.roiScore?.category === 'quick-win');
}

/**
 * Gets strategic improvements - medium ROI, worth the investment
 */
export function getStrategicImprovements(
  prioritized: PrioritizedRecommendation[]
): PrioritizedRecommendation[] {
  return prioritized.filter((rec) => rec.roiScore?.category === 'strategic');
}

/**
 * Gets long-term projects - lower ROI but may be important
 */
export function getLongTermProjects(
  prioritized: PrioritizedRecommendation[]
): PrioritizedRecommendation[] {
  return prioritized.filter((rec) => rec.roiScore?.category === 'long-term');
}

/**
 * Filters recommendations by minimum ROI score
 */
export function filterByMinROI(
  prioritized: PrioritizedRecommendation[],
  minScore: number
): PrioritizedRecommendation[] {
  return prioritized.filter((rec) => (rec.roiScore?.normalizedScore || 0) >= minScore);
}

/**
 * Gets top N recommendations by ROI
 */
export function getTopByROI(
  prioritized: PrioritizedRecommendation[],
  n: number = 5
): PrioritizedRecommendation[] {
  return prioritized.slice(0, n);
}

// ============================================================================
// Summary and Reporting
// ============================================================================

/**
 * Creates a prioritization summary
 */
export function createPrioritizationSummary(
  prioritized: PrioritizedRecommendation[],
  context: PrioritizationContext
): {
  totalRecommendations: number;
  quickWins: number;
  strategic: number;
  longTerm: number;
  totalPotentialRevenue: number;
  formattedRevenue: string;
  totalEffortMinutes: number;
  formattedEffort: string;
  averageROI: number;
  hasTrafficData: boolean;
  disclaimer: string;
} {
  const quickWins = getQuickWins(prioritized);
  const strategic = getStrategicImprovements(prioritized);
  const longTerm = getLongTermProjects(prioritized);
  
  // Calculate total potential revenue
  const totalPotentialRevenue = prioritized.reduce((sum, rec) => {
    return sum + (rec.revenueImpact?.potentialRevenue || 0);
  }, 0);
  
  // Calculate total effort
  const totalEffortMinutes = prioritized.reduce((sum, rec) => {
    return sum + rec.effortMinutes;
  }, 0);
  
  // Calculate average ROI
  const roiSum = prioritized.reduce((sum, rec) => {
    return sum + (rec.roiScore?.normalizedScore || 0);
  }, 0);
  const averageROI = prioritized.length > 0 ? roiSum / prioritized.length : 0;
  
  return {
    totalRecommendations: prioritized.length,
    quickWins: quickWins.length,
    strategic: strategic.length,
    longTerm: longTerm.length,
    totalPotentialRevenue,
    formattedRevenue: formatRevenue(totalPotentialRevenue),
    totalEffortMinutes,
    formattedEffort: formatEffortEstimate(totalEffortMinutes),
    averageROI: Math.round(averageROI * 10) / 10,
    hasTrafficData: !!(context.weeklyTraffic && context.weeklyTraffic > 0),
    disclaimer: getRevenueDisclaimer(),
  };
}

/**
 * Generates an executive summary for display
 */
export function generateExecutiveSummary(
  prioritized: PrioritizedRecommendation[],
  context: PrioritizationContext
): string {
  const summary = createPrioritizationSummary(prioritized, context);
  const quickWins = getQuickWins(prioritized);
  
  let output = `## Recommendation Summary\n\n`;
  output += `**Total Recommendations:** ${summary.totalRecommendations}\n`;
  output += `**Total Implementation Time:** ${summary.formattedEffort}\n\n`;
  
  if (summary.hasTrafficData) {
    output += `**Potential Monthly Revenue Impact:** ${summary.formattedRevenue}\n\n`;
  }
  
  output += `### By Category\n`;
  output += `- ⚡ Quick Wins: ${summary.quickWins}\n`;
  output += `- 📈 Strategic Improvements: ${summary.strategic}\n`;
  output += `- ⏳ Long-term Projects: ${summary.longTerm}\n\n`;
  
  if (quickWins.length > 0) {
    output += `### Top Quick Wins\n`;
    quickWins.slice(0, 3).forEach((rec, i) => {
      output += `${i + 1}. **${rec.title}** (${rec.effortFormatted})\n`;
      if (rec.revenueImpact) {
        output += `   Potential: ${formatRevenue(rec.revenueImpact.potentialRevenue)}/month\n`;
      }
    });
    output += `\n`;
  }
  
  output += `---\n*${summary.disclaimer}*`;
  
  return output;
}

/**
 * Converts prioritized recommendations back to standard Recommendation format
 * (for storage in Supabase)
 */
export function toStorageFormat(
  prioritized: PrioritizedRecommendation[]
): Recommendation[] {
  return prioritized.map((rec) => ({
    id: rec.id,
    dimension: rec.dimension,
    priority: rec.priority,
    title: rec.title,
    description: rec.description,
    impact: rec.impact,
    effort: rec.effort,
    example: rec.example,
    pattern: rec.pattern,
    revenueImpact: rec.revenueImpact,
    successMetrics: rec.successMetrics,
    roiScore: rec.roiScore,
    timeToResultsWeeks: rec.roiScore?.breakdown.timeToResultsWeeks,
    changeType: rec.changeType,
  }));
}

// ============================================================================
// Exports
// ============================================================================

export default {
  enrichRecommendation,
  prioritizeRecommendations,
  getQuickWins,
  getStrategicImprovements,
  getLongTermProjects,
  filterByMinROI,
  getTopByROI,
  createPrioritizationSummary,
  generateExecutiveSummary,
  toStorageFormat,
};

