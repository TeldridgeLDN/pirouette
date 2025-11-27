// @ts-nocheck
/**
 * Recommendation Generator
 * 
 * Core algorithm that transforms identified design issues into specific,
 * actionable recommendations with step-by-step instructions.
 * 
 * This is Subtask 9.3 of the recommendation generation system.
 */

import type { Recommendation } from '../core/types';
import type { DesignIssue, PatternMatchingResults } from './pattern-matcher';

// ============================================================================
// Recommendation Templates
// ============================================================================

/**
 * Template for generating recommendations
 */
interface RecommendationTemplate {
  dimension: string;
  issueType: DesignIssue['type'];
  issueTitlePattern: RegExp | string;
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  changeType: Recommendation['changeType'];
  steps: string[];
  example?: string;
}

/**
 * Library of recommendation templates organised by dimension
 */
const RECOMMENDATION_TEMPLATES: RecommendationTemplate[] = [
  // ========== COLORS ==========
  {
    dimension: 'colors',
    issueType: 'wcag-violation',
    issueTitlePattern: /WCAG AA/i,
    title: 'Improve colour contrast for accessibility',
    description: 'Adjust text and background colours to meet WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text).',
    impact: 'Improves readability for all users and ensures legal accessibility compliance. Failing WCAG can result in lawsuits.',
    effort: 'low',
    changeType: 'accessibility',
    steps: [
      'Use a contrast checker tool (e.g., WebAIM Contrast Checker) to identify failing pairs',
      'Darken text colours or lighten backgrounds until 4.5:1 ratio is achieved',
      'Test with colorblind simulation tools',
      'Verify changes across all page sections',
    ],
    example: 'Change body text from #777777 to #595959 for better contrast against white backgrounds.',
  },
  {
    dimension: 'colors',
    issueType: 'wcag-violation',
    issueTitlePattern: /insufficient contrast/i,
    title: 'Fix low-contrast text elements',
    description: 'Several text elements have insufficient contrast against their backgrounds, making them hard to read.',
    impact: 'Users may struggle to read content, leading to higher bounce rates and lost conversions.',
    effort: 'low',
    changeType: 'ui',
    steps: [
      'Identify all low-contrast text using browser DevTools accessibility audit',
      'Increase contrast by adjusting text colour (darker) or background colour (lighter)',
      'Aim for minimum 4.5:1 ratio for body text, 3:1 for headings',
      'Pay special attention to buttons, links, and form labels',
    ],
  },
  {
    dimension: 'colors',
    issueType: 'pattern-mismatch',
    issueTitlePattern: /uncommon.*color/i,
    title: 'Consider a more conventional colour palette',
    description: 'Your primary colour choice is unusual compared to successful sites in your category. While uniqueness can be good, unconventional colours may not resonate with users.',
    impact: 'Familiar colour schemes build trust faster. Testing shows conventional palettes often convert 10-20% better.',
    effort: 'medium',
    changeType: 'ui',
    steps: [
      'Research competitor colour schemes for industry norms',
      'Consider blue (trust), green (growth), or orange (action) as primary colours',
      'A/B test your current palette against a more conventional alternative',
      'Maintain brand consistency while adjusting for conversion',
    ],
  },
  
  // ========== WHITESPACE ==========
  {
    dimension: 'whitespace',
    issueType: 'best-practice-violation',
    issueTitlePattern: /density.*too high|too dense/i,
    title: 'Add more breathing room to your layout',
    description: 'Your page feels cramped with too many elements packed together. Adding whitespace improves readability and focus.',
    impact: 'Proper whitespace can increase comprehension by 20% and reduce cognitive load, leading to better engagement.',
    effort: 'medium',
    changeType: 'structural',
    steps: [
      'Increase section padding from current values to at least 60-80px vertical',
      'Add more margin between content blocks (aim for 24-32px minimum)',
      'Reduce the number of elements visible at once',
      'Use visual hierarchy to guide the eye instead of cramming everything in',
    ],
    example: 'Increase hero section padding from 40px to 80px, and add 32px gaps between feature cards.',
  },
  {
    dimension: 'whitespace',
    issueType: 'best-practice-violation',
    issueTitlePattern: /density.*sparse|too sparse/i,
    title: 'Optimise whitespace usage',
    description: 'Your page has excessive whitespace that may make it feel empty or incomplete.',
    impact: 'While whitespace is important, too much can make users scroll unnecessarily and lose interest.',
    effort: 'low',
    changeType: 'structural',
    steps: [
      'Review section heights and reduce excessive padding',
      'Consider adding more content or visual elements to empty areas',
      'Ensure above-fold content is information-rich',
      'Balance whitespace with content density',
    ],
  },
  {
    dimension: 'whitespace',
    issueType: 'best-practice-violation',
    issueTitlePattern: /line height/i,
    title: 'Increase line height for better readability',
    description: 'Your text line height is too tight, making paragraphs difficult to read.',
    impact: 'Optimal line height (1.5-1.8) improves reading speed and comprehension by up to 25%.',
    effort: 'low',
    changeType: 'ui',
    steps: [
      'Set body text line-height to 1.6 (or 160%)',
      'For headings, use 1.2-1.4 line-height',
      'Ensure consistent line-height across all text elements',
      'Test readability on mobile devices',
    ],
    example: 'Change CSS: body { line-height: 1.6; } h1, h2, h3 { line-height: 1.3; }',
  },
  
  // ========== LAYOUT ==========
  {
    dimension: 'layout',
    issueType: 'best-practice-violation',
    issueTitlePattern: /mobile|responsive/i,
    title: 'Improve mobile responsiveness',
    description: 'Your site may not display optimally on mobile devices, where over 50% of web traffic originates.',
    impact: 'Poor mobile experience can cost you half your potential conversions. Google also penalises non-responsive sites.',
    effort: 'high',
    changeType: 'structural',
    steps: [
      'Test your site on multiple device sizes using browser DevTools',
      'Implement responsive breakpoints (mobile: 320-480px, tablet: 768px, desktop: 1024px+)',
      'Ensure touch targets are at least 44x44px',
      'Verify text is readable without zooming',
      'Check that images scale appropriately',
    ],
  },
  {
    dimension: 'layout',
    issueType: 'best-practice-violation',
    issueTitlePattern: /grid/i,
    title: 'Adopt CSS Grid for consistent layout',
    description: 'Your layout doesn\'t appear to use CSS Grid, which provides better alignment and maintainability.',
    impact: 'Grid-based layouts are more consistent and easier to maintain. They also tend to look more professional.',
    effort: 'medium',
    changeType: 'structural',
    steps: [
      'Convert main layout containers to CSS Grid',
      'Define consistent column widths (e.g., 12-column grid)',
      'Use grid-gap for consistent spacing',
      'Leverage grid areas for complex layouts',
    ],
    example: '.container { display: grid; grid-template-columns: repeat(12, 1fr); gap: 24px; }',
  },
  {
    dimension: 'layout',
    issueType: 'pattern-mismatch',
    issueTitlePattern: /uncommon.*layout/i,
    title: 'Consider a more familiar layout structure',
    description: 'Your layout structure is unconventional. While this can differentiate you, it may confuse users expecting standard patterns.',
    impact: 'Familiar layouts reduce cognitive load and help users find what they need faster.',
    effort: 'high',
    changeType: 'structural',
    steps: [
      'Review common landing page layouts (hero-left, split-screen, single-column)',
      'Consider whether your unique layout serves a purpose',
      'A/B test against a more conventional alternative',
      'Ensure navigation and CTAs are in expected locations',
    ],
  },
  
  // ========== CTA ==========
  {
    dimension: 'ctaProminence',
    issueType: 'best-practice-violation',
    issueTitlePattern: /no.*cta|missing/i,
    title: 'Add a clear call-to-action',
    description: 'Your page lacks a clear, prominent call-to-action button. Every landing page needs one.',
    impact: 'Pages without clear CTAs can see 50%+ lower conversion rates. Users need to know what action to take.',
    effort: 'low',
    changeType: 'ui',
    steps: [
      'Add a prominent CTA button in your hero section',
      'Use action-oriented text (e.g., "Get Started", "Try Free", "Sign Up")',
      'Make the button visually distinct with contrasting colours',
      'Repeat the CTA at logical points down the page',
    ],
    example: '<button class="cta-primary">Start Your Free Trial</button>',
  },
  {
    dimension: 'ctaProminence',
    issueType: 'best-practice-violation',
    issueTitlePattern: /too many/i,
    title: 'Reduce CTA clutter',
    description: 'Too many CTAs can overwhelm users and dilute the impact of your primary action.',
    impact: 'Analysis shows that pages with 1-2 focused CTAs convert better than those with many competing actions.',
    effort: 'low',
    changeType: 'ui',
    steps: [
      'Identify your single most important conversion action',
      'Make this your primary CTA with prominent styling',
      'Demote secondary actions to text links or subtle buttons',
      'Remove or consolidate redundant CTAs',
    ],
  },
  {
    dimension: 'ctaProminence',
    issueType: 'best-practice-violation',
    issueTitlePattern: /below.*fold|not visible/i,
    title: 'Move primary CTA above the fold',
    description: 'Your main CTA isn\'t visible without scrolling. Users should see it immediately.',
    impact: 'Above-fold CTAs typically see 80% more clicks than those requiring scroll.',
    effort: 'low',
    changeType: 'ui',
    steps: [
      'Position your primary CTA in the hero section',
      'Ensure it\'s visible on both desktop and mobile viewports',
      'Consider a sticky header with CTA for long pages',
      'Test visibility on various screen sizes',
    ],
  },
  {
    dimension: 'ctaProminence',
    issueType: 'best-practice-violation',
    issueTitlePattern: /contrast/i,
    title: 'Increase CTA visual prominence',
    description: 'Your CTA button doesn\'t stand out enough from the surrounding content.',
    impact: 'High-contrast CTAs are easier to find and click, potentially increasing conversions by 20-30%.',
    effort: 'low',
    changeType: 'ui',
    steps: [
      'Use a bold, contrasting colour for your CTA (opposite on colour wheel)',
      'Increase button size (minimum 44px height for touch targets)',
      'Add whitespace around the button to make it stand out',
      'Consider subtle animation or shadow effects',
    ],
    example: '.cta { background: #FF6B35; color: white; padding: 16px 32px; font-weight: bold; }',
  },
];

// ============================================================================
// Recommendation Generation Logic
// ============================================================================

/**
 * Finds matching template for a design issue
 */
function findMatchingTemplate(issue: DesignIssue): RecommendationTemplate | null {
  return RECOMMENDATION_TEMPLATES.find((template) => {
    // Match dimension
    if (template.dimension !== issue.dimension) return false;
    
    // Match issue type
    if (template.issueType !== issue.type) return false;
    
    // Match title pattern
    if (template.issueTitlePattern instanceof RegExp) {
      return template.issueTitlePattern.test(issue.title);
    } else {
      return issue.title.toLowerCase().includes(template.issueTitlePattern.toLowerCase());
    }
  }) || null;
}

/**
 * Generates a recommendation from an issue and template
 */
function generateRecommendationFromTemplate(
  issue: DesignIssue,
  template: RecommendationTemplate,
  index: number
): Recommendation {
  // Build description with steps
  const stepsText = template.steps.map((step, i) => `${i + 1}. ${step}`).join('\n');
  const fullDescription = `${template.description}\n\n**Steps to implement:**\n${stepsText}`;
  
  return {
    id: `rec-${issue.dimension}-${index}-${Date.now()}`,
    dimension: issue.dimension,
    priority: severityToPriority(issue.severity),
    title: template.title,
    description: fullDescription,
    impact: template.impact,
    effort: template.effort,
    example: template.example,
    pattern: issue.patternReference,
    changeType: template.changeType,
  };
}

/**
 * Generates a fallback recommendation when no template matches
 */
function generateFallbackRecommendation(issue: DesignIssue, index: number): Recommendation {
  return {
    id: `rec-${issue.dimension}-fallback-${index}-${Date.now()}`,
    dimension: issue.dimension,
    priority: severityToPriority(issue.severity),
    title: `Address: ${issue.title}`,
    description: `${issue.description}\n\nThis issue was identified during analysis but requires custom investigation to determine the best solution.`,
    impact: 'Addressing this issue will improve overall design quality and user experience.',
    effort: 'medium',
    pattern: issue.patternReference,
    changeType: 'other',
  };
}

/**
 * Converts issue severity to recommendation priority
 */
function severityToPriority(severity: DesignIssue['severity']): Recommendation['priority'] {
  const mapping: Record<DesignIssue['severity'], Recommendation['priority']> = {
    high: 'high',
    medium: 'medium',
    low: 'low',
  };
  return mapping[severity];
}

/**
 * Main recommendation generation function
 * Transforms pattern matching results into actionable recommendations
 */
export function generateRecommendations(
  patternResults: PatternMatchingResults
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  let index = 0;
  
  // Process each issue
  for (const issue of patternResults.allIssues) {
    // Find matching template
    const template = findMatchingTemplate(issue);
    
    let recommendation: Recommendation;
    if (template) {
      recommendation = generateRecommendationFromTemplate(issue, template, index);
    } else {
      recommendation = generateFallbackRecommendation(issue, index);
    }
    
    recommendations.push(recommendation);
    index++;
  }
  
  // Sort by priority (high > medium > low)
  recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
  
  return recommendations;
}

/**
 * Generates recommendations with deduplication
 * Removes similar recommendations that address the same underlying issue
 */
export function generateDeduplicatedRecommendations(
  patternResults: PatternMatchingResults
): Recommendation[] {
  const recommendations = generateRecommendations(patternResults);
  
  // Deduplicate by title similarity
  const seen = new Set<string>();
  const deduplicated: Recommendation[] = [];
  
  for (const rec of recommendations) {
    // Create a normalised key for comparison
    const key = `${rec.dimension}-${rec.title.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(rec);
    }
  }
  
  return deduplicated;
}

/**
 * Limits recommendations to top N by priority
 */
export function getTopRecommendations(
  recommendations: Recommendation[],
  limit: number = 10
): Recommendation[] {
  return recommendations.slice(0, limit);
}

/**
 * Filters recommendations by dimension
 */
export function filterRecommendationsByDimension(
  recommendations: Recommendation[],
  dimension: string
): Recommendation[] {
  return recommendations.filter((rec) => rec.dimension === dimension);
}

/**
 * Filters recommendations by effort level
 */
export function filterRecommendationsByEffort(
  recommendations: Recommendation[],
  effort: Recommendation['effort']
): Recommendation[] {
  return recommendations.filter((rec) => rec.effort === effort);
}

/**
 * Gets quick wins (high priority, low effort)
 */
export function getQuickWins(recommendations: Recommendation[]): Recommendation[] {
  return recommendations.filter(
    (rec) => rec.priority === 'high' && rec.effort === 'low'
  );
}

/**
 * Creates a summary of generated recommendations
 */
export function createRecommendationSummary(recommendations: Recommendation[]): {
  total: number;
  byPriority: Record<string, number>;
  byEffort: Record<string, number>;
  byDimension: Record<string, number>;
  quickWins: number;
} {
  const byPriority: Record<string, number> = { high: 0, medium: 0, low: 0 };
  const byEffort: Record<string, number> = { low: 0, medium: 0, high: 0 };
  const byDimension: Record<string, number> = {};
  
  for (const rec of recommendations) {
    byPriority[rec.priority] = (byPriority[rec.priority] || 0) + 1;
    byEffort[rec.effort] = (byEffort[rec.effort] || 0) + 1;
    byDimension[rec.dimension] = (byDimension[rec.dimension] || 0) + 1;
  }
  
  return {
    total: recommendations.length,
    byPriority,
    byEffort,
    byDimension,
    quickWins: getQuickWins(recommendations).length,
  };
}

// ============================================================================
// Exports
// ============================================================================

export default {
  generateRecommendations,
  generateDeduplicatedRecommendations,
  getTopRecommendations,
  filterRecommendationsByDimension,
  filterRecommendationsByEffort,
  getQuickWins,
  createRecommendationSummary,
};

export { RECOMMENDATION_TEMPLATES };

