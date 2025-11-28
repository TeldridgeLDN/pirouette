/**
 * Industry Benchmarks API
 * 
 * GET /api/benchmarks/[industry]
 * 
 * Returns benchmark data for a specific industry.
 * Public endpoint - no authentication required.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { Industry } from '@/lib/analysis/utils/industry-classifier';

// ============================================================================
// Types
// ============================================================================

interface RouteParams {
  params: Promise<{ industry: string }>;
}

const VALID_INDUSTRIES = [
  'saas', 'ecommerce', 'agency', 'blog', 
  'marketplace', 'finance', 'health', 'education', 'other'
];

const MIN_SAMPLE_SIZE = 10;

// ============================================================================
// Handler
// ============================================================================

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { industry } = await params;
    
    // Validate industry
    if (!VALID_INDUSTRIES.includes(industry)) {
      return NextResponse.json(
        { error: 'Invalid industry' },
        { status: 400 }
      );
    }
    
    const supabase = supabaseAdmin;
    
    // Fetch benchmark data
    const { data, error } = await supabase
      .from('industry_benchmarks')
      .select('*')
      .eq('industry', industry)
      .single();
    
    if (error) {
      console.error('Error fetching benchmarks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch benchmarks' },
        { status: 500 }
      );
    }
    
    // Format response
    const benchmark = {
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
    
    // Calculate comparison if userScore provided in query
    const userScoreParam = request.nextUrl.searchParams.get('score');
    let comparison = null;
    
    if (userScoreParam && benchmark.hasEnoughData && benchmark.avgOverallScore) {
      const userScore = parseFloat(userScoreParam);
      const difference = userScore - benchmark.avgOverallScore;
      
      // Determine comparison category
      let comparisonType: 'above' | 'below' | 'average' | 'unknown';
      if (Math.abs(difference) <= 5) {
        comparisonType = 'average';
      } else if (difference > 0) {
        comparisonType = 'above';
      } else {
        comparisonType = 'below';
      }
      
      // Calculate percentile
      let percentile: number | null = null;
      if (benchmark.stdDev && benchmark.stdDev > 0) {
        const z = difference / benchmark.stdDev;
        percentile = Math.round(normalCDF(z) * 100);
      } else if (benchmark.minScore !== null && benchmark.maxScore !== null) {
        const range = benchmark.maxScore - benchmark.minScore;
        if (range > 0) {
          percentile = Math.round(((userScore - benchmark.minScore) / range) * 100);
          percentile = Math.max(0, Math.min(100, percentile));
        }
      }
      
      comparison = {
        userScore,
        industryAvg: benchmark.avgOverallScore,
        percentile,
        comparison: comparisonType,
        difference: Math.round(difference * 10) / 10,
      };
    }
    
    return NextResponse.json({
      success: true,
      benchmark,
      comparison,
    });
    
  } catch (error) {
    console.error('Error in benchmarks API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Normal CDF approximation for percentile calculation
 */
function normalCDF(z: number): number {
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

