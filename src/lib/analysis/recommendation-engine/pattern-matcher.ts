// @ts-nocheck
/**
 * Pattern Matching Integration
 * 
 * Connects processed analyzer results to the pattern library from Task 8
 * to identify design gaps and issues in the analyzed website.
 * 
 * This is Subtask 9.2 of the recommendation generation system.
 */

import type {
  ColorAnalysis,
  WhitespaceAnalysis,
  LayoutAnalysis,
  CTAAnalysis,
  ColorPattern,
  WhitespacePattern,
  LayoutPattern,
  CTAPattern,
  PatternLibrary,
} from '../core/types';
import type { ProcessedAnalyzerResults } from './analyzer-result-processor';
import {
  loadDefaultPatterns,
  loadPatternsFromSupabase,
  matchColorPattern,
  matchWhitespacePattern,
  matchLayoutPattern,
  matchCTAPattern,
} from '../patterns/pattern-loader';

// ============================================================================
// Types for Pattern Matching Results
// ============================================================================

/**
 * Represents a single identified design issue
 */
export interface DesignIssue {
  id: string;
  dimension: string;
  type: 'pattern-mismatch' | 'low-score' | 'wcag-violation' | 'best-practice-violation';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  currentValue?: string | number;
  expectedValue?: string | number;
  patternReference?: string; // Pattern ID if based on pattern
  confidence: number; // 0-100, how confident we are this is an issue
}

/**
 * Results of pattern matching for a single dimension
 */
export interface DimensionPatternMatch {
  dimension: string;
  hasAnalysis: boolean;
  score: number;
  matchedPatterns: Array<{
    pattern: any;
    similarity: number;
    isMatch: boolean; // True if similarity > threshold
  }>;
  gaps: DesignIssue[]; // Identified gaps vs. best practices
  strengths: string[]; // What's already good
}

/**
 * Complete pattern matching results across all dimensions
 */
export interface PatternMatchingResults {
  overallScore: number;
  dimensionMatches: {
    colors: DimensionPatternMatch | null;
    whitespace: DimensionPatternMatch | null;
    complexity: DimensionPatternMatch | null;
    typography: DimensionPatternMatch | null;
    layout: DimensionPatternMatch | null;
    ctaProminence: DimensionPatternMatch | null;
    hierarchy: DimensionPatternMatch | null;
  };
  allIssues: DesignIssue[];
  allStrengths: string[];
  patternLibraryVersion: string;
  timestamp: string;
}

// ============================================================================
// Pattern Matching Functions by Dimension
// ============================================================================

/**
 * Matches color analysis against color patterns
 */
function matchColorDimension(
  analysis: ColorAnalysis | null,
  library: PatternLibrary
): DimensionPatternMatch | null {
  if (!analysis) return null;
  
  const matchedPatterns: DimensionPatternMatch['matchedPatterns'] = [];
  const gaps: DesignIssue[] = [];
  const strengths: string[] = [];
  
  // Match primary color against patterns
  if (analysis.primary) {
    const matches = matchColorPattern(library, analysis.primary, 30);
    matches.forEach((match) => {
      matchedPatterns.push({
        pattern: match.pattern,
        similarity: match.similarity,
        isMatch: match.similarity > 70,
      });
    });
    
    // If no good matches, it's a gap
    if (matches.length === 0 || matches[0].similarity < 50) {
      gaps.push({
        id: `color-gap-${Date.now()}`,
        dimension: 'colors',
        type: 'pattern-mismatch',
        severity: 'medium',
        title: 'Uncommon primary color choice',
        description: 'Your primary color doesn\'t match common patterns from award-winning sites. Consider testing more conventional colors.',
        currentValue: analysis.primary,
        confidence: 70,
      });
    } else {
      strengths.push(`Primary color matches ${matches[0].pattern.name} pattern (${matches[0].similarity.toFixed(0)}% similar)`);
    }
  }
  
  // Check WCAG compliance
  if (!analysis.wcagCompliance.AA) {
    gaps.push({
      id: `color-wcag-${Date.now()}`,
      dimension: 'colors',
      type: 'wcag-violation',
      severity: 'high',
      title: 'WCAG AA color contrast not met',
      description: 'Some color combinations fail WCAG AA standards for accessibility. This affects readability and legal compliance.',
      confidence: 100,
    });
  } else {
    strengths.push('WCAG AA contrast standards met');
  }
  
  // Check contrast ratios
  const failingRatios = analysis.contrastRatios.filter(cr => !cr.passes.AA_normal);
  if (failingRatios.length > 0) {
    gaps.push({
      id: `color-contrast-${Date.now()}`,
      dimension: 'colors',
      type: 'wcag-violation',
      severity: 'high',
      title: `${failingRatios.length} color pairs with insufficient contrast`,
      description: 'Multiple text/background combinations don\'t meet minimum contrast requirements.',
      currentValue: failingRatios.length,
      confidence: 100,
    });
  }
  
  return {
    dimension: 'colors',
    hasAnalysis: true,
    score: analysis.score,
    matchedPatterns,
    gaps,
    strengths,
  };
}

/**
 * Matches whitespace analysis against whitespace patterns
 */
function matchWhitespaceDimension(
  analysis: WhitespaceAnalysis | null,
  library: PatternLibrary
): DimensionPatternMatch | null {
  if (!analysis) return null;
  
  const matchedPatterns: DimensionPatternMatch['matchedPatterns'] = [];
  const gaps: DesignIssue[] = [];
  const strengths: string[] = [];
  
  // Attempt to match spacing patterns
  // Note: This requires specific spacing values which may not always be available
  // So we use density as a proxy
  
  if (analysis.density === 'dense') {
    gaps.push({
      id: `whitespace-density-${Date.now()}`,
      dimension: 'whitespace',
      type: 'best-practice-violation',
      severity: 'medium',
      title: 'Page density is too high',
      description: 'Dense layouts can feel cramped and overwhelming. Consider adding more breathing room between sections.',
      currentValue: analysis.density,
      expectedValue: 'balanced',
      confidence: 75,
    });
  } else if (analysis.density === 'sparse') {
    gaps.push({
      id: `whitespace-sparse-${Date.now()}`,
      dimension: 'whitespace',
      type: 'best-practice-violation',
      severity: 'low',
      title: 'Page density is too sparse',
      description: 'Very sparse layouts can feel empty. You may be able to display more content without sacrificing readability.',
      currentValue: analysis.density,
      expectedValue: 'balanced',
      confidence: 60,
    });
  } else {
    strengths.push('Whitespace density is well-balanced');
  }
  
  // Check line height
  if (analysis.lineHeight < 1.4) {
    gaps.push({
      id: `whitespace-lineheight-${Date.now()}`,
      dimension: 'whitespace',
      type: 'best-practice-violation',
      severity: 'medium',
      title: 'Line height is too tight',
      description: 'Line height below 1.4 reduces readability. Recommended range is 1.5-1.8 for body text.',
      currentValue: analysis.lineHeight,
      expectedValue: '1.5-1.8',
      confidence: 85,
    });
  } else {
    strengths.push('Line height supports good readability');
  }
  
  return {
    dimension: 'whitespace',
    hasAnalysis: true,
    score: analysis.score,
    matchedPatterns,
    gaps,
    strengths,
  };
}

/**
 * Matches layout analysis against layout patterns
 */
function matchLayoutDimension(
  analysis: LayoutAnalysis | null,
  library: PatternLibrary
): DimensionPatternMatch | null {
  if (!analysis) return null;
  
  const matchedPatterns: DimensionPatternMatch['matchedPatterns'] = [];
  const gaps: DesignIssue[] = [];
  const strengths: string[] = [];
  
  // Match layout structure
  if (analysis.structure) {
    const matches = matchLayoutPattern(library, analysis.structure);
    matches.forEach((pattern) => {
      matchedPatterns.push({
        pattern,
        similarity: 100, // matchLayoutPattern doesn't return similarity, assume 100 if matched
        isMatch: true,
      });
    });
    
    if (matches.length > 0) {
      strengths.push(`Layout structure matches ${matches[0].name} pattern (${matches[0].prevalence} prevalence)`);
    } else {
      gaps.push({
        id: `layout-structure-${Date.now()}`,
        dimension: 'layout',
        type: 'pattern-mismatch',
        severity: 'low',
        title: 'Uncommon layout structure',
        description: 'Your layout structure doesn\'t match common patterns. This isn\'t necessarily bad, but unconventional layouts may confuse users.',
        currentValue: analysis.structure,
        confidence: 50,
      });
    }
  }
  
  // Check responsiveness
  if (analysis.responsiveness === 'poor') {
    gaps.push({
      id: `layout-responsive-${Date.now()}`,
      dimension: 'layout',
      type: 'best-practice-violation',
      severity: 'high',
      title: 'Poor mobile responsiveness',
      description: 'Your site may not display well on mobile devices. Modern sites must be mobile-friendly.',
      currentValue: analysis.responsiveness,
      expectedValue: 'good',
      confidence: 90,
    });
  } else if (analysis.responsiveness === 'good') {
    strengths.push('Responsive design is well-implemented');
  }
  
  // Check grid usage
  if (!analysis.gridUsage) {
    gaps.push({
      id: `layout-grid-${Date.now()}`,
      dimension: 'layout',
      type: 'best-practice-violation',
      severity: 'low',
      title: 'No CSS Grid detected',
      description: 'Modern sites typically use CSS Grid for layout consistency. Consider adopting it for better maintainability.',
      confidence: 60,
    });
  } else {
    strengths.push('Uses CSS Grid for layout structure');
  }
  
  return {
    dimension: 'layout',
    hasAnalysis: true,
    score: analysis.score,
    matchedPatterns,
    gaps,
    strengths,
  };
}

/**
 * Matches CTA analysis against CTA patterns
 */
function matchCTADimension(
  analysis: CTAAnalysis | null,
  library: PatternLibrary
): DimensionPatternMatch | null {
  if (!analysis) return null;
  
  const matchedPatterns: DimensionPatternMatch['matchedPatterns'] = [];
  const gaps: DesignIssue[] = [];
  const strengths: string[] = [];
  
  // Match CTA characteristics
  if (analysis.primaryCTA) {
    const characteristics = {
      prominence: 'high', // Could be derived from analysis
      contrast: analysis.contrast,
      positioning: analysis.aboveFold ? 'above-fold' : 'below-fold',
    };
    
    const matches = matchCTAPattern(library, characteristics);
    matches.forEach((match) => {
      matchedPatterns.push({
        pattern: match.pattern,
        similarity: match.similarity,
        isMatch: match.similarity > 66,
      });
    });
    
    if (matches.length > 0 && matches[0].similarity > 66) {
      strengths.push(`CTA design matches ${matches[0].pattern.name} pattern`);
    }
  }
  
  // Check CTA count
  if (analysis.count === 0) {
    gaps.push({
      id: `cta-missing-${Date.now()}`,
      dimension: 'ctaProminence',
      type: 'best-practice-violation',
      severity: 'high',
      title: 'No clear call-to-action found',
      description: 'Every landing page needs at least one prominent CTA to guide user action.',
      currentValue: 0,
      expectedValue: '1-3',
      confidence: 95,
    });
  } else if (analysis.count > 3) {
    gaps.push({
      id: `cta-too-many-${Date.now()}`,
      dimension: 'ctaProminence',
      type: 'best-practice-violation',
      severity: 'medium',
      title: 'Too many CTAs may dilute focus',
      description: 'Multiple CTAs can confuse users. Consider focusing on 1-2 primary actions.',
      currentValue: analysis.count,
      expectedValue: '1-3',
      confidence: 70,
    });
  } else {
    strengths.push(`Appropriate CTA count (${analysis.count})`);
  }
  
  // Check above-fold placement
  if (!analysis.aboveFold) {
    gaps.push({
      id: `cta-below-fold-${Date.now()}`,
      dimension: 'ctaProminence',
      type: 'best-practice-violation',
      severity: 'high',
      title: 'Primary CTA not visible above the fold',
      description: 'Users should see your main CTA without scrolling. Place it prominently in the hero section.',
      confidence: 90,
    });
  } else {
    strengths.push('Primary CTA is above the fold');
  }
  
  // Check contrast
  if (analysis.contrast === 'low' || analysis.contrast === 'poor') {
    gaps.push({
      id: `cta-contrast-${Date.now()}`,
      dimension: 'ctaProminence',
      type: 'best-practice-violation',
      severity: 'high',
      title: 'CTA lacks sufficient visual contrast',
      description: 'Your CTA doesn\'t stand out enough. Use high-contrast colors to make it unmissable.',
      currentValue: analysis.contrast,
      expectedValue: 'high',
      confidence: 85,
    });
  } else if (analysis.contrast === 'high') {
    strengths.push('CTA has strong visual contrast');
  }
  
  return {
    dimension: 'ctaProminence',
    hasAnalysis: true,
    score: analysis.score,
    matchedPatterns,
    gaps,
    strengths,
  };
}

/**
 * Creates a placeholder dimension match for dimensions without analysis
 */
function createPlaceholderMatch(dimension: string): DimensionPatternMatch {
  return {
    dimension,
    hasAnalysis: false,
    score: 0,
    matchedPatterns: [],
    gaps: [],
    strengths: [],
  };
}

// ============================================================================
// Main Pattern Matching Integration
// ============================================================================

/**
 * Performs pattern matching across all dimensions
 * @param processed Processed analyzer results from Subtask 9.1
 * @param useSupabase Whether to load patterns from Supabase (true) or use defaults (false)
 */
export async function matchPatternsAcrossAllDimensions(
  processed: ProcessedAnalyzerResults,
  useSupabase: boolean = false
): Promise<PatternMatchingResults> {
  // Load pattern library
  const library: PatternLibrary = useSupabase
    ? await loadPatternsFromSupabase()
    : loadDefaultPatterns();
  
  // Match each dimension
  const colorsMatch = matchColorDimension(processed.dimensions.colors, library);
  const whitespaceMatch = matchWhitespaceDimension(processed.dimensions.whitespace, library);
  const layoutMatch = matchLayoutDimension(processed.dimensions.layout, library);
  const ctaMatch = matchCTADimension(processed.dimensions.ctaProminence, library);
  
  // For dimensions without specific matchers yet, create placeholders
  const complexityMatch = createPlaceholderMatch('complexity');
  const typographyMatch = createPlaceholderMatch('typography');
  const hierarchyMatch = createPlaceholderMatch('hierarchy');
  
  // Aggregate all issues and strengths
  const allIssues: DesignIssue[] = [];
  const allStrengths: string[] = [];
  
  [colorsMatch, whitespaceMatch, layoutMatch, ctaMatch].forEach((match) => {
    if (match) {
      allIssues.push(...match.gaps);
      allStrengths.push(...match.strengths);
    }
  });
  
  // Sort issues by severity (high > medium > low)
  allIssues.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
  
  return {
    overallScore: processed.overallScore,
    dimensionMatches: {
      colors: colorsMatch,
      whitespace: whitespaceMatch,
      complexity: complexityMatch,
      typography: typographyMatch,
      layout: layoutMatch,
      ctaProminence: ctaMatch,
      hierarchy: hierarchyMatch,
    },
    allIssues,
    allStrengths,
    patternLibraryVersion: library.meta.date,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Filters issues by severity
 */
export function filterIssuesBySeverity(
  results: PatternMatchingResults,
  severity: 'high' | 'medium' | 'low'
): DesignIssue[] {
  return results.allIssues.filter((issue) => issue.severity === severity);
}

/**
 * Filters issues by dimension
 */
export function filterIssuesByDimension(
  results: PatternMatchingResults,
  dimension: string
): DesignIssue[] {
  return results.allIssues.filter((issue) => issue.dimension === dimension);
}

/**
 * Gets issues by type
 */
export function filterIssuesByType(
  results: PatternMatchingResults,
  type: DesignIssue['type']
): DesignIssue[] {
  return results.allIssues.filter((issue) => issue.type === type);
}

/**
 * Creates a summary of pattern matching results
 */
export function createPatternMatchSummary(results: PatternMatchingResults): {
  totalIssues: number;
  highSeverity: number;
  mediumSeverity: number;
  lowSeverity: number;
  totalStrengths: number;
  dimensionsAnalyzed: number;
  overallScore: number;
} {
  const high = filterIssuesBySeverity(results, 'high').length;
  const medium = filterIssuesBySeverity(results, 'medium').length;
  const low = filterIssuesBySeverity(results, 'low').length;
  
  const dimensionsAnalyzed = Object.values(results.dimensionMatches).filter(
    (match) => match !== null && match.hasAnalysis
  ).length;
  
  return {
    totalIssues: results.allIssues.length,
    highSeverity: high,
    mediumSeverity: medium,
    lowSeverity: low,
    totalStrengths: results.allStrengths.length,
    dimensionsAnalyzed,
    overallScore: results.overallScore,
  };
}

// ============================================================================
// Exports
// ============================================================================

export default {
  matchPatternsAcrossAllDimensions,
  filterIssuesBySeverity,
  filterIssuesByDimension,
  filterIssuesByType,
  createPatternMatchSummary,
};


