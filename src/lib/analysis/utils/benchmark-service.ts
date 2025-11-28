/**
 * Benchmark Service
 * 
 * Handles industry benchmarking:
 * - Fetching benchmark data
 * - Updating benchmarks after analyses
 * - Calculating percentile rankings
 */

import { createClient } from '@supabase/supabase-js';
import type { Industry } from './industry-classifier';

// ============================================================================
// Types
// ============================================================================

export interface BenchmarkData {
  industry: Industry;
  totalAnalyses: number;
  avgOverallScore: number | null;
  avgScores: {
    colors: number | null;
    typography: number | null;
    whitespace: number | null;
    complexity: number | null;
    layout: number | null;
    cta: number | null;
    hierarchy: number | null;
  };
  minScore: number | null;
  maxScore: number | null;
  stdDev: number | null;
  lastUpdated: string;
  hasEnoughData: boolean; // true if totalAnalyses >= MIN_SAMPLE_SIZE
}

export interface ComparisonResult {
  userScore: number;
  industryAvg: number | null;
  percentile: number | null; // 0-100, null if not enough data
  comparison: 'above' | 'below' | 'average' | 'unknown';
  difference: number | null;
}

export interface AnalysisScores {
  overall: number;
  colors?: number | null;
  typography?: number | null;
  whitespace?: number | null;
  complexity?: number | null;
  layout?: number | null;
  cta?: number | null;
  hierarchy?: number | null;
}

// ============================================================================
// Constants
// ============================================================================

const MIN_SAMPLE_SIZE = 10; // Minimum analyses before showing benchmarks

// ============================================================================
// Supabase Client
// ============================================================================

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    throw new Error('Missing Supabase credentials');
  }
  
  return createClient(url, key);
}

// ============================================================================
// Benchmark Functions
// ============================================================================

/**
 * Get benchmark data for an industry
 */
export async function getIndustryBenchmarks(industry: Industry): Promise<BenchmarkData | null> {
  try {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('industry_benchmarks')
      .select('*')
      .eq('industry', industry)
      .single();
    
    if (error || !data) {
      console.error('Error fetching benchmarks:', error);
      return null;
    }
    
    return {
      industry: data.industry as Industry,
      totalAnalyses: data.total_analyses || 0,
      avgOverallScore: data.avg_overall_score,
      avgScores: {
        colors: data.avg_colors_score,
        typography: data.avg_typography_score,
        whitespace: data.avg_whitespace_score,
        complexity: data.avg_complexity_score,
        layout: data.avg_layout_score,
        cta: data.avg_cta_score,
        hierarchy: data.avg_hierarchy_score,
      },
      minScore: data.min_overall_score,
      maxScore: data.max_overall_score,
      stdDev: data.score_std_dev,
      lastUpdated: data.last_updated,
      hasEnoughData: (data.total_analyses || 0) >= MIN_SAMPLE_SIZE,
    };
  } catch (error) {
    console.error('Error in getIndustryBenchmarks:', error);
    return null;
  }
}

/**
 * Get all industry benchmarks
 */
export async function getAllBenchmarks(): Promise<BenchmarkData[]> {
  try {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('industry_benchmarks')
      .select('*')
      .order('total_analyses', { ascending: false });
    
    if (error || !data) {
      console.error('Error fetching all benchmarks:', error);
      return [];
    }
    
    return data.map(row => ({
      industry: row.industry as Industry,
      totalAnalyses: row.total_analyses || 0,
      avgOverallScore: row.avg_overall_score,
      avgScores: {
        colors: row.avg_colors_score,
        typography: row.avg_typography_score,
        whitespace: row.avg_whitespace_score,
        complexity: row.avg_complexity_score,
        layout: row.avg_layout_score,
        cta: row.avg_cta_score,
        hierarchy: row.avg_hierarchy_score,
      },
      minScore: row.min_overall_score,
      maxScore: row.max_overall_score,
      stdDev: row.score_std_dev,
      lastUpdated: row.last_updated,
      hasEnoughData: (row.total_analyses || 0) >= MIN_SAMPLE_SIZE,
    }));
  } catch (error) {
    console.error('Error in getAllBenchmarks:', error);
    return [];
  }
}

/**
 * Update benchmarks after a new analysis
 * Uses incremental calculation to avoid re-processing all data
 */
export async function updateBenchmarks(
  industry: Industry,
  scores: AnalysisScores
): Promise<void> {
  try {
    const supabase = getSupabase();
    
    // Get current benchmarks
    const { data: current, error: fetchError } = await supabase
      .from('industry_benchmarks')
      .select('*')
      .eq('industry', industry)
      .single();
    
    if (fetchError) {
      console.error('Error fetching current benchmarks:', fetchError);
      return;
    }
    
    const n = (current?.total_analyses || 0) + 1;
    
    // Calculate new averages using incremental formula:
    // new_avg = old_avg + (new_value - old_avg) / n
    const calcNewAvg = (oldAvg: number | null, newValue: number | null | undefined): number | null => {
      if (newValue === null || newValue === undefined) return oldAvg;
      if (oldAvg === null) return newValue;
      return oldAvg + (newValue - oldAvg) / n;
    };
    
    // Calculate min/max
    const newMin = current?.min_overall_score === null 
      ? scores.overall 
      : Math.min(current.min_overall_score, scores.overall);
    const newMax = current?.max_overall_score === null 
      ? scores.overall 
      : Math.max(current.max_overall_score, scores.overall);
    
    // Update benchmarks
    const { error: updateError } = await supabase
      .from('industry_benchmarks')
      .update({
        total_analyses: n,
        avg_overall_score: calcNewAvg(current?.avg_overall_score, scores.overall),
        avg_colors_score: calcNewAvg(current?.avg_colors_score, scores.colors),
        avg_typography_score: calcNewAvg(current?.avg_typography_score, scores.typography),
        avg_whitespace_score: calcNewAvg(current?.avg_whitespace_score, scores.whitespace),
        avg_complexity_score: calcNewAvg(current?.avg_complexity_score, scores.complexity),
        avg_layout_score: calcNewAvg(current?.avg_layout_score, scores.layout),
        avg_cta_score: calcNewAvg(current?.avg_cta_score, scores.cta),
        avg_hierarchy_score: calcNewAvg(current?.avg_hierarchy_score, scores.hierarchy),
        min_overall_score: newMin,
        max_overall_score: newMax,
        last_updated: new Date().toISOString(),
      })
      .eq('industry', industry);
    
    if (updateError) {
      console.error('Error updating benchmarks:', updateError);
    }
  } catch (error) {
    console.error('Error in updateBenchmarks:', error);
  }
}

/**
 * Compare a score to industry benchmarks
 */
export function compareToIndustry(
  userScore: number,
  benchmark: BenchmarkData | null
): ComparisonResult {
  // Not enough data
  if (!benchmark || !benchmark.hasEnoughData || benchmark.avgOverallScore === null) {
    return {
      userScore,
      industryAvg: benchmark?.avgOverallScore || null,
      percentile: null,
      comparison: 'unknown',
      difference: null,
    };
  }
  
  const difference = userScore - benchmark.avgOverallScore;
  
  // Determine comparison category
  let comparison: ComparisonResult['comparison'];
  if (Math.abs(difference) <= 5) {
    comparison = 'average';
  } else if (difference > 0) {
    comparison = 'above';
  } else {
    comparison = 'below';
  }
  
  // Calculate percentile (simplified - assumes normal distribution)
  let percentile: number | null = null;
  if (benchmark.stdDev && benchmark.stdDev > 0) {
    // Z-score
    const z = difference / benchmark.stdDev;
    // Convert to percentile using approximation
    percentile = Math.round(normalCDF(z) * 100);
  } else if (benchmark.minScore !== null && benchmark.maxScore !== null) {
    // Linear interpolation fallback
    const range = benchmark.maxScore - benchmark.minScore;
    if (range > 0) {
      percentile = Math.round(((userScore - benchmark.minScore) / range) * 100);
      percentile = Math.max(0, Math.min(100, percentile));
    }
  }
  
  return {
    userScore,
    industryAvg: benchmark.avgOverallScore,
    percentile,
    comparison,
    difference: Math.round(difference * 10) / 10,
  };
}

/**
 * Normal CDF approximation for percentile calculation
 */
function normalCDF(z: number): number {
  // Approximation using error function
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  
  const sign = z < 0 ? -1 : 1;
  z = Math.abs(z) / Math.sqrt(2);
  
  const t = 1.0 / (1.0 + p * z);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
  
  return 0.5 * (1.0 + sign * y);
}

