// @ts-nocheck
/**
 * Pattern Library Loader
 * Loads design patterns from JSON file or Supabase
 * 
 * NOTE: TypeScript checking disabled due to Supabase type generation issues.
 */

import type { PatternLibrary } from '../core/types';
import defaultPatterns from './default-patterns.json';

// ============================================================================
// Pattern Loading
// ============================================================================

/**
 * Load pattern library from default JSON file
 */
export function loadDefaultPatterns(): PatternLibrary {
  return defaultPatterns as unknown as PatternLibrary;
}

/**
 * Load patterns from Supabase (for Railway/production)
 * Fetches patterns from the patterns table and constructs a PatternLibrary
 */
export async function loadPatternsFromSupabase(version: string = 'latest'): Promise<PatternLibrary> {
  try {
    const { supabaseAdmin } = await import('@/lib/supabase/server');
    const supabase = supabaseAdmin;
    
    // Fetch all patterns from Supabase
    const { data: patterns, error } = await supabase
      .from('patterns')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error loading patterns from Supabase:', error);
      console.warn('Falling back to default patterns');
      return loadDefaultPatterns();
    }
    
    if (!patterns || patterns.length === 0) {
      console.warn('No patterns found in Supabase, using defaults');
      return loadDefaultPatterns();
    }
    
    // Group patterns by dimension
    const patternsByDimension: any = {
      colors: [],
      whitespace: [],
      complexity: [],
      imageText: [],
      typography: [],
      layout: [],
      ctaProminence: [],
      hierarchy: [],
    };
    
    patterns.forEach((p) => {
      const dimension = p.dimension === 'cta' ? 'ctaProminence' : p.dimension;
      if (patternsByDimension[dimension]) {
        patternsByDimension[dimension].push({
          ...p.pattern_data,
          id: p.id,
          prevalence: `${Math.round(p.prevalence * 100)}%`,
        });
      }
    });
    
    // Construct PatternLibrary metadata
    const meta = {
      date: new Date().toISOString(),
      sources: patterns.map((p) => p.source).filter(Boolean),
      shotsAnalyzed: patterns.reduce((sum, p) => sum + (p.designs_analyzed || 0), 0),
      designsExtracted: patterns.length,
      dimensions: Object.keys(patternsByDimension),
      patternsGenerated: {
        colors: patternsByDimension.colors.length,
        whitespace: patternsByDimension.whitespace.length,
        complexity: patternsByDimension.complexity.length,
        imageText: patternsByDimension.imageText.length,
        typography: patternsByDimension.typography.length,
        layout: patternsByDimension.layout.length,
        ctaProminence: patternsByDimension.ctaProminence.length,
        hierarchy: patternsByDimension.hierarchy.length,
        total: patterns.length,
      },
      awaitingReview: false,
    };
    
    return {
      meta,
      patterns: patternsByDimension,
    };
  } catch (err) {
    console.error('Exception loading patterns from Supabase:', err);
    console.warn('Falling back to default patterns');
    return loadDefaultPatterns();
  }
}

/**
 * Get patterns for a specific dimension
 */
export function getPatternsByDimension(
  library: PatternLibrary,
  dimension: keyof PatternLibrary['patterns']
) {
  return library.patterns[dimension] || [];
}

/**
 * Search patterns by name or ID
 */
export function findPattern(
  library: PatternLibrary,
  searchTerm: string
) {
  const allPatterns = Object.values(library.patterns).flat();
  return allPatterns.find(
    (p: any) => 
      p.id === searchTerm || 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

/**
 * Get pattern statistics
 */
export function getPatternStats(library: PatternLibrary) {
  return {
    totalPatterns: library.meta.patternsGenerated.total,
    designsAnalyzed: library.meta.designsExtracted,
    sources: library.meta.sources,
    lastUpdated: library.meta.date,
    dimensions: library.meta.dimensions,
  };
}

// ============================================================================
// Pattern Matching Utilities
// ============================================================================

/**
 * Find matching color patterns
 */
export function matchColorPattern(
  library: PatternLibrary,
  colorHex: string,
  threshold: number = 30
) {
  const colorPatterns = library.patterns.colors;
  
  // Convert hex to RGB for comparison
  const targetRgb = hexToRgb(colorHex);
  if (!targetRgb) return [];
  
  return colorPatterns
    .map((pattern) => {
      const distance = calculateColorDistance(targetRgb, pattern.primary.rgb);
      return {
        pattern,
        similarity: Math.max(0, 100 - (distance / threshold) * 100),
      };
    })
    .filter((match) => match.similarity > 50)
    .sort((a, b) => b.similarity - a.similarity);
}

/**
 * Find matching whitespace patterns
 */
export function matchWhitespacePattern(
  library: PatternLibrary,
  spacing: {
    sectionGap?: string;
    contentPadding?: string;
    lineHeight?: string;
  }
) {
  const whitespacePatterns = library.patterns.whitespace;
  
  return whitespacePatterns
    .map((pattern) => {
      let score = 0;
      let matches = 0;
      
      if (spacing.sectionGap && pattern.spacing.sectionGap === spacing.sectionGap) {
        score += 33;
        matches++;
      }
      if (spacing.contentPadding && pattern.spacing.contentPadding === spacing.contentPadding) {
        score += 33;
        matches++;
      }
      if (spacing.lineHeight && pattern.spacing.lineHeight === spacing.lineHeight) {
        score += 34;
        matches++;
      }
      
      return {
        pattern,
        similarity: score,
        matchCount: matches,
      };
    })
    .filter((match) => match.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity);
}

/**
 * Find matching layout patterns
 */
export function matchLayoutPattern(
  library: PatternLibrary,
  layoutStructure: string
) {
  const layoutPatterns = library.patterns.layout;
  
  return layoutPatterns
    .filter((pattern) => 
      pattern.structure.toLowerCase().includes(layoutStructure.toLowerCase()) ||
      layoutStructure.toLowerCase().includes(pattern.structure.toLowerCase())
    )
    .sort((a, b) => {
      // Sort by prevalence
      const aPrevalence = parseInt(a.prevalence);
      const bPrevalence = parseInt(b.prevalence);
      return bPrevalence - aPrevalence;
    });
}

/**
 * Find matching CTA patterns
 */
export function matchCTAPattern(
  library: PatternLibrary,
  characteristics: {
    prominence?: string;
    contrast?: string;
    positioning?: string;
  }
) {
  const ctaPatterns = library.patterns.ctaProminence;
  
  return ctaPatterns
    .map((pattern) => {
      let score = 0;
      let matches = 0;
      
      if (characteristics.prominence && 
          pattern.characteristics.prominence === characteristics.prominence) {
        score += 33;
        matches++;
      }
      if (characteristics.contrast && 
          pattern.characteristics.contrast === characteristics.contrast) {
        score += 33;
        matches++;
      }
      if (characteristics.positioning && 
          pattern.characteristics.positioning === characteristics.positioning) {
        score += 34;
        matches++;
      }
      
      return {
        pattern,
        similarity: score,
        matchCount: matches,
      };
    })
    .filter((match) => match.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity);
}

// ============================================================================
// Helper Functions
// ============================================================================

function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
}

function calculateColorDistance(
  rgb1: [number, number, number],
  rgb2: [number, number, number]
): number {
  const [r1, g1, b1] = rgb1;
  const [r2, g2, b2] = rgb2;
  
  return Math.sqrt(
    Math.pow(r2 - r1, 2) +
    Math.pow(g2 - g1, 2) +
    Math.pow(b2 - b1, 2)
  );
}

// ============================================================================
// Exports
// ============================================================================

export default {
  loadDefaultPatterns,
  loadPatternsFromSupabase,
  getPatternsByDimension,
  findPattern,
  getPatternStats,
  matchColorPattern,
  matchWhitespacePattern,
  matchLayoutPattern,
  matchCTAPattern,
};




