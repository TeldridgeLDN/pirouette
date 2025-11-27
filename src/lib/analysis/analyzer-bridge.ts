/**
 * Analyzer Bridge
 * 
 * This module provides a clean TypeScript interface to the imported
 * visual design analyzer skills. It handles the integration between
 * the legacy .mjs files and our TypeScript codebase.
 * 
 * Strategy: Rather than converting 6,000+ lines of legacy code,
 * we extract the core functionality we need and wrap it properly.
 */

import type {
  AnalysisReport,
  ColorAnalysis,
  WhitespaceAnalysis,
  TypographyAnalysis,
  LayoutAnalysis,
  CTAAnalysis,
  ComplexityAnalysis,
  ImageTextRatioAnalysis,
  HierarchyAnalysis,
  PatternLibrary,
  Recommendation,
} from './core/types';

import colorUtils from './utils/color-utils';
import {
  matchColorPattern,
  matchWhitespacePattern,
  matchLayoutPattern,
  matchCTAPattern,
} from './patterns/pattern-loader';

/**
 * Analyze colors from extracted page data
 */
export function analyzeColors(
  colors: string[],
  patterns: PatternLibrary
): ColorAnalysis {
  // Extract unique colors
  const uniqueColors = Array.from(new Set(colors)).filter(
    (c) => c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent'
  );

  // Convert to hex for analysis
  const hexColors = uniqueColors.slice(0, 10); // Top 10 colors

  // Find dominant color (first non-transparent)
  const primary = hexColors[0] || '#000000';

  // Calculate contrast ratios
  const contrastRatios = [];
  for (let i = 0; i < Math.min(hexColors.length, 5); i++) {
    for (let j = i + 1; j < Math.min(hexColors.length, 5); j++) {
      const ratio = colorUtils.getContrastRatio(hexColors[i], hexColors[j]);
      contrastRatios.push({
        foreground: hexColors[i],
        background: hexColors[j],
        ratio,
        passes: {
          AA_normal: ratio >= 4.5,
          AA_large: ratio >= 3.0,
          AAA_normal: ratio >= 7.0,
          AAA_large: ratio >= 4.5,
        },
      });
    }
  }

  // Check WCAG compliance
  const passesAA = contrastRatios.some((r) => r.passes.AA_normal);
  const passesAAA = contrastRatios.some((r) => r.passes.AAA_normal);

  // Match patterns
  const matchedPatterns = primary
    ? matchColorPattern(patterns, primary, 50)
        .slice(0, 3)
        .map((m) => m.pattern)
    : [];

  // Calculate score (0-100)
  let score = 50; // Base score
  if (passesAA) score += 20;
  if (passesAAA) score += 15;
  if (matchedPatterns.length > 0) score += 15;

  // Generate issues and recommendations
  const issues = [];
  const recommendations = [];

  if (!passesAA) {
    issues.push('Some color combinations do not meet WCAG AA standards');
    recommendations.push(
      'Increase contrast between text and background colors to at least 4.5:1'
    );
  }

  if (!passesAAA) {
    recommendations.push(
      'Consider improving contrast to meet WCAG AAA standards (7:1) for enhanced accessibility'
    );
  }

  return {
    primary,
    palette: hexColors,
    contrastRatios,
    wcagCompliance: {
      AA: passesAA,
      AAA: passesAAA,
    },
    matchedPatterns,
    score,
    issues,
    recommendations,
  };
}

/**
 * Analyze typography from extracted font data
 */
export function analyzeTypography(typography: {
  fontFamilies: string[];
  fontSizes: string[];
}): TypographyAnalysis {
  const { fontFamilies, fontSizes } = typography;

  // Parse font sizes
  const sizes = fontSizes
    .map((s) => parseFloat(s))
    .filter((s) => !isNaN(s))
    .sort((a, b) => b - a);

  // Detect hierarchy
  const hierarchy: any = {};
  if (sizes.length > 0) hierarchy.h1 = sizes[0];
  if (sizes.length > 1) hierarchy.h2 = sizes[1];
  if (sizes.length > 2) hierarchy.h3 = sizes[2];
  if (sizes.length > 3) hierarchy.body = sizes[Math.floor(sizes.length / 2)];

  // Determine scale type
  let scale: 'modular' | 'custom' | 'inconsistent' = 'custom';
  if (sizes.length >= 4) {
    // Check for modular scale (ratio consistency)
    const ratios = [];
    for (let i = 0; i < sizes.length - 1; i++) {
      ratios.push(sizes[i] / sizes[i + 1]);
    }
    const avgRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;
    const variance =
      ratios.reduce((sum, r) => sum + Math.abs(r - avgRatio), 0) /
      ratios.length;

    if (variance < 0.1) scale = 'modular';
    else if (variance > 0.3) scale = 'inconsistent';
  }

  // Calculate readability score
  const readability = 75; // Base score (would need page context for real calculation)

  // Calculate overall score
  let score = 70;
  if (scale === 'modular') score += 15;
  if (fontFamilies.length <= 3) score += 10; // Good: limited font families
  if (sizes.length >= 5) score += 5; // Good: clear hierarchy

  const issues = [];
  const recommendations = [];

  if (fontFamilies.length > 3) {
    issues.push('Too many font families used (more than 3)');
    recommendations.push(
      'Limit font families to 2-3 for better consistency'
    );
  }

  if (scale === 'inconsistent') {
    issues.push('Font sizes lack consistent scaling');
    recommendations.push('Use a modular scale (e.g., 1.25x or 1.5x ratio)');
  }

  return {
    fontFamilies,
    fontSizes: sizes,
    hierarchy,
    scale,
    readability,
    score,
    issues,
    recommendations,
  };
}

/**
 * Analyze CTAs from extracted button data
 */
export function analyzeCTAs(
  ctas: any[],
  patterns: PatternLibrary
): CTAAnalysis {
  const count = ctas.length;

  // Calculate average prominence (based on size and contrast)
  let avgProminence = 0;
  let avgContrast = 0;

  if (ctas.length > 0) {
    const prominences = ctas.map((cta) => {
      const area = (cta.position?.width || 100) * (cta.position?.height || 40);
      return Math.min(100, (area / 10000) * 100);
    });
    avgProminence =
      prominences.reduce((a, b) => a + b, 0) / prominences.length;

    // Estimate contrast (would need actual color values)
    avgContrast = 6.5; // Default assumption
  }

  // Extract positioning
  const positioning = ctas
    .map((cta, i) => {
      if (!cta.position) return null;
      const y = cta.position.y;
      if (y < 800) return 'hero';
      if (y < 2000) return 'mid-page';
      return 'footer';
    })
    .filter(Boolean) as string[];

  // Determine hierarchy
  let hierarchy: 'clear' | 'moderate' | 'unclear' = 'moderate';
  if (count === 0) hierarchy = 'unclear';
  else if (count === 1 || count === 2) hierarchy = 'clear';
  else if (count > 5) hierarchy = 'unclear';

  // Match patterns
  const matchedPatterns = matchCTAPattern(patterns, {
    prominence: avgProminence > 70 ? 'high' : 'medium',
    contrast: avgContrast > 4.5 ? 'high' : 'medium',
    positioning: positioning[0] || 'hero',
  })
    .slice(0, 3)
    .map((m) => m.pattern);

  // Calculate score
  let score = 60;
  if (count >= 1 && count <= 3) score += 20;
  if (avgProminence > 70) score += 10;
  if (hierarchy === 'clear') score += 10;

  const issues = [];
  const recommendations = [];

  if (count === 0) {
    issues.push('No clear CTAs detected on the page');
    recommendations.push('Add prominent call-to-action buttons');
  } else if (count > 5) {
    issues.push('Too many CTAs may confuse users');
    recommendations.push('Focus on 1-3 primary CTAs');
  }

  if (avgProminence < 50) {
    recommendations.push('Increase CTA size and contrast for better visibility');
  }

  return {
    count,
    prominence: avgProminence,
    contrast: avgContrast,
    positioning,
    hierarchy,
    matchedPatterns,
    score,
    issues,
    recommendations,
  };
}

/**
 * Analyze overall complexity
 */
export function analyzeComplexity(elementCount: number): ComplexityAnalysis {
  // Estimate color and font count (would come from extracted data)
  const colorCount = 5; // Placeholder
  const fontCount = 2; // Placeholder

  let complexity: 'simple' | 'balanced' | 'complex' = 'balanced';
  if (elementCount < 50) complexity = 'simple';
  else if (elementCount > 200) complexity = 'complex';

  let score = 75;
  if (complexity === 'balanced') score += 15;
  if (colorCount <= 5) score += 5;
  if (fontCount <= 3) score += 5;

  const issues = [];
  const recommendations = [];

  if (complexity === 'complex') {
    issues.push('Page has high visual complexity');
    recommendations.push(
      'Consider simplifying layout and reducing element count'
    );
  }

  return {
    elementCount,
    colorCount,
    fontCount,
    complexity,
    score,
    issues,
    recommendations,
  };
}

/**
 * Placeholder analyzers (will be enhanced later)
 */
export function analyzeWhitespace(patterns: PatternLibrary): WhitespaceAnalysis {
  return {
    sectionGaps: [40, 60, 80],
    contentPadding: [20, 30],
    lineHeight: 1.6,
    density: 'balanced',
    matchedPatterns: [],
    score: 85,
    issues: [],
    recommendations: [],
  };
}

export function analyzeLayout(patterns: PatternLibrary): LayoutAnalysis {
  return {
    structure: 'hero-centric',
    columns: 1,
    alignment: 'center',
    matchedPatterns: [],
    score: 88,
    issues: [],
    recommendations: [],
  };
}

export function analyzeImageTextRatio(): ImageTextRatioAnalysis {
  return {
    imagePercentage: 40,
    textPercentage: 60,
    ratio: 0.67,
    balance: 'balanced',
    score: 85,
    issues: [],
    recommendations: [],
  };
}

export function analyzeHierarchy(): HierarchyAnalysis {
  return {
    visualWeight: {
      primary: 100,
      secondary: 70,
      tertiary: 40,
    },
    clarity: 'good',
    score: 82,
    issues: [],
    recommendations: [],
  };
}

/**
 * Generate prioritized recommendations from all analyses
 */
export function generateRecommendations(
  analyses: {
    colors: ColorAnalysis;
    typography: TypographyAnalysis;
    ctaProminence: CTAAnalysis;
    complexity: ComplexityAnalysis;
    whitespace: WhitespaceAnalysis;
    layout: LayoutAnalysis;
    imageText: ImageTextRatioAnalysis;
    hierarchy?: HierarchyAnalysis;
  }
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  let recId = 1;

  // Collect all issues and recommendations
  const allIssues = [
    ...analyses.colors.issues.map((i) => ({ dimension: 'colors', issue: i })),
    ...analyses.typography.issues.map((i) => ({
      dimension: 'typography',
      issue: i,
    })),
    ...analyses.ctaProminence.issues.map((i) => ({
      dimension: 'ctaProminence',
      issue: i,
    })),
    ...analyses.complexity.issues.map((i) => ({
      dimension: 'complexity',
      issue: i,
    })),
  ];

  const allRecs = [
    ...analyses.colors.recommendations.map((r) => ({
      dimension: 'colors',
      rec: r,
    })),
    ...analyses.typography.recommendations.map((r) => ({
      dimension: 'typography',
      rec: r,
    })),
    ...analyses.ctaProminence.recommendations.map((r) => ({
      dimension: 'ctaProminence',
      rec: r,
    })),
    ...analyses.complexity.recommendations.map((r) => ({
      dimension: 'complexity',
      rec: r,
    })),
  ];

  // Prioritize based on score (lower score = higher priority)
  const scores = {
    colors: analyses.colors.score,
    typography: analyses.typography.score,
    ctaProminence: analyses.ctaProminence.score,
    complexity: analyses.complexity.score,
  };

  // Sort dimensions by score (lowest first)
  const sortedDimensions = Object.entries(scores).sort(
    ([, a], [, b]) => a - b
  );

  // Generate recommendations from lowest scoring dimensions first
  for (const [dimension, score] of sortedDimensions) {
    const dimRecs = allRecs.filter((r) => r.dimension === dimension);

    for (const { rec } of dimRecs.slice(0, 2)) {
      // Max 2 per dimension
      const priority = score < 70 ? 'high' : score < 85 ? 'medium' : 'low';
      const effort = rec.length > 100 ? 'high' : rec.length > 50 ? 'medium' : 'low';

      recommendations.push({
        id: `rec-${recId++}`,
        dimension,
        priority,
        title: rec.split('.')[0] || rec,
        description: rec,
        impact: score < 70 ? 'High impact on user experience' : 'Moderate improvement',
        effort,
      });
    }
  }

  return recommendations.slice(0, 10); // Top 10 recommendations
}

export default {
  analyzeColors,
  analyzeTypography,
  analyzeCTAs,
  analyzeComplexity,
  analyzeWhitespace,
  analyzeLayout,
  analyzeImageTextRatio,
  analyzeHierarchy,
  generateRecommendations,
};



