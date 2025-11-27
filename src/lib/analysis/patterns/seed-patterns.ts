// @ts-nocheck
/**
 * Pattern Library Seeder for Supabase
 * 
 * This utility seeds the Supabase patterns table with the default pattern library.
 * Run this once to populate the database with initial patterns.
 * 
 * Usage:
 *   - Via API route: POST /api/admin/seed-patterns
 *   - Via script: ts-node src/lib/analysis/patterns/seed-patterns.ts
 * 
 * NOTE: TypeScript checking disabled due to Supabase type generation issues.
 */

import { supabaseAdmin } from '@/lib/supabase/server';
import defaultPatterns from './default-patterns.json';

/**
 * Seeds the Supabase patterns table with default patterns
 * @returns Promise with seeding results
 */
export async function seedPatternsToSupabase(): Promise<{
  success: boolean;
  patternsSeeded: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let patternsSeeded = 0;

  try {
    const supabase = supabaseAdmin;
    
    // Delete existing patterns (optional - comment out if you want to preserve existing)
    const { error: deleteError } = await supabase.from('patterns').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (deleteError) {
      errors.push(`Error clearing existing patterns: ${deleteError.message}`);
      console.warn(deleteError);
    }

    // Prepare pattern records for insertion
    const dimensionMapping: Record<string, string> = {
      colors: 'colors',
      whitespace: 'whitespace',
      complexity: 'complexity',
      imageText: 'complexity', // imageText is a sub-category of complexity
      typography: 'typography',
      layout: 'layout',
      ctaProminence: 'cta',
      hierarchy: 'hierarchy',
    };

    const patternRecords: any[] = [];

    // Iterate through each dimension in default patterns
    Object.entries(defaultPatterns.patterns).forEach(([dimension, patterns]) => {
      const dbDimension = dimensionMapping[dimension] || dimension;
      
      patterns.forEach((pattern: any) => {
        // Extract prevalence as a decimal (e.g., "20%" -> 0.20)
        const prevalenceMatch = pattern.prevalence?.match(/(\d+)%/);
        const prevalence = prevalenceMatch ? parseInt(prevalenceMatch[1]) / 100 : 0;
        
        patternRecords.push({
          dimension: dbDimension,
          pattern_data: pattern,
          source: 'default', // Can be enhanced to track actual source
          designs_analyzed: defaultPatterns.meta.designsExtracted,
          prevalence,
          version: '1.0',
        });
      });
    });

    // Insert patterns in batches (Supabase has a limit)
    const batchSize = 100;
    for (let i = 0; i < patternRecords.length; i += batchSize) {
      const batch = patternRecords.slice(i, i + batchSize);
      const { error: insertError, data } = await supabase
        .from('patterns')
        .insert(batch)
        .select();

      if (insertError) {
        errors.push(`Error inserting batch ${i / batchSize + 1}: ${insertError.message}`);
        console.error(insertError);
      } else {
        patternsSeeded += data?.length || 0;
      }
    }

    return {
      success: errors.length === 0,
      patternsSeeded,
      errors,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    errors.push(`Exception during seeding: ${errorMsg}`);
    console.error(err);
    return {
      success: false,
      patternsSeeded,
      errors,
    };
  }
}

/**
 * Gets pattern statistics from Supabase
 */
export async function getPatternStatsFromSupabase() {
  try {
    const supabase = supabaseAdmin;
    
    const { data, error } = await supabase
      .from('patterns')
      .select('dimension, source, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const dimensionCounts: Record<string, number> = {};
    const sources = new Set<string>();
    let oldestPattern: string | null = null;
    let newestPattern: string | null = null;

    data?.forEach((p) => {
      dimensionCounts[p.dimension] = (dimensionCounts[p.dimension] || 0) + 1;
      if (p.source) sources.add(p.source);
      if (!oldestPattern || p.created_at < oldestPattern) oldestPattern = p.created_at;
      if (!newestPattern || p.created_at > newestPattern) newestPattern = p.created_at;
    });

    return {
      totalPatterns: data?.length || 0,
      dimensionCounts,
      sources: Array.from(sources),
      oldestPattern,
      newestPattern,
    };
  } catch (err) {
    console.error('Error fetching pattern stats:', err);
    return null;
  }
}

// If run directly as a script
if (require.main === module) {
  seedPatternsToSupabase()
    .then((result) => {
      console.log('Seeding completed:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}

