// @ts-nocheck
/**
 * Recommendation Storage and Retrieval
 * 
 * Handles storing generated recommendations in the Supabase reports table
 * and retrieving them for display.
 * 
 * This is Subtask 9.7 of the recommendation generation system.
 */

import type { AnalysisReport, Recommendation } from '../core/types';

// ============================================================================
// Types
// ============================================================================

/**
 * Report record as stored in Supabase
 */
export interface StoredReport {
  id: string;
  job_id: string;
  user_id: string;
  url: string;
  screenshot_url?: string;
  
  // Scores
  overall_score: number;
  colors_score?: number;
  whitespace_score?: number;
  complexity_score?: number;
  typography_score?: number;
  layout_score?: number;
  cta_score?: number;
  hierarchy_score?: number;
  
  // JSONB fields
  dimensions: Record<string, any>;
  recommendations: Recommendation[];
  
  // Metadata
  analysis_time?: number;
  version?: string;
  created_at: string;
}

/**
 * Options for querying reports
 */
export interface ReportQueryOptions {
  userId?: string;
  url?: string;
  minScore?: number;
  maxScore?: number;
  limit?: number;
  offset?: number;
  orderBy?: 'created_at' | 'overall_score';
  orderDirection?: 'asc' | 'desc';
}

/**
 * Options for querying recommendations
 */
export interface RecommendationQueryOptions {
  reportId?: string;
  dimension?: string;
  priority?: 'high' | 'medium' | 'low';
  effort?: 'low' | 'medium' | 'high';
  minROI?: number;
  limit?: number;
}

// ============================================================================
// Storage Functions
// ============================================================================

/**
 * Stores an analysis report in Supabase
 */
export async function storeReport(
  report: AnalysisReport,
  jobId: string,
  userId: string,
  screenshotUrl?: string
): Promise<{ success: boolean; reportId?: string; error?: string }> {
  try {
    const { supabaseAdmin } = await import('@/lib/supabase/server');
    const supabase = supabaseAdmin;
    
    const reportRecord = {
      job_id: jobId,
      user_id: userId,
      url: report.url,
      screenshot_url: screenshotUrl || report.screenshot,
      
      // Scores
      overall_score: report.overallScore,
      colors_score: report.dimensionScores.colors,
      whitespace_score: report.dimensionScores.whitespace,
      complexity_score: report.dimensionScores.complexity,
      typography_score: report.dimensionScores.typography,
      layout_score: report.dimensionScores.layout,
      cta_score: report.dimensionScores.ctaProminence,
      hierarchy_score: report.dimensionScores.hierarchy,
      
      // JSONB
      dimensions: report.dimensions,
      recommendations: report.recommendations,
      
      // Metadata
      analysis_time: report.analysisTime,
      version: report.version,
    };
    
    const { data, error } = await supabase
      .from('reports')
      .insert(reportRecord)
      .select('id')
      .single();
    
    if (error) {
      console.error('Error storing report:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, reportId: data.id };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Exception storing report:', err);
    return { success: false, error: errorMsg };
  }
}

/**
 * Retrieves a report by ID
 */
export async function getReportById(
  reportId: string
): Promise<StoredReport | null> {
  try {
    const { supabaseAdmin } = await import('@/lib/supabase/server');
    const supabase = supabaseAdmin;
    
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();
    
    if (error) {
      console.error('Error fetching report:', error);
      return null;
    }
    
    return data as StoredReport;
  } catch (err) {
    console.error('Exception fetching report:', err);
    return null;
  }
}

/**
 * Retrieves a report by job ID
 */
export async function getReportByJobId(
  jobId: string
): Promise<StoredReport | null> {
  try {
    const { supabaseAdmin } = await import('@/lib/supabase/server');
    const supabase = supabaseAdmin;
    
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('job_id', jobId)
      .single();
    
    if (error) {
      console.error('Error fetching report by job:', error);
      return null;
    }
    
    return data as StoredReport;
  } catch (err) {
    console.error('Exception fetching report by job:', err);
    return null;
  }
}

/**
 * Retrieves reports for a user with optional filtering
 */
export async function getReportsForUser(
  userId: string,
  options: ReportQueryOptions = {}
): Promise<StoredReport[]> {
  try {
    const { supabaseAdmin } = await import('@/lib/supabase/server');
    const supabase = supabaseAdmin;
    
    let query = supabase
      .from('reports')
      .select('*')
      .eq('user_id', userId);
    
    // Apply filters
    if (options.url) {
      query = query.eq('url', options.url);
    }
    if (options.minScore !== undefined) {
      query = query.gte('overall_score', options.minScore);
    }
    if (options.maxScore !== undefined) {
      query = query.lte('overall_score', options.maxScore);
    }
    
    // Apply ordering
    const orderBy = options.orderBy || 'created_at';
    const orderDirection = options.orderDirection || 'desc';
    query = query.order(orderBy, { ascending: orderDirection === 'asc' });
    
    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching user reports:', error);
      return [];
    }
    
    return (data || []) as StoredReport[];
  } catch (err) {
    console.error('Exception fetching user reports:', err);
    return [];
  }
}

/**
 * Gets the most recent report for a URL
 */
export async function getLatestReportForUrl(
  url: string,
  userId?: string
): Promise<StoredReport | null> {
  try {
    const { supabaseAdmin } = await import('@/lib/supabase/server');
    const supabase = supabaseAdmin;
    
    let query = supabase
      .from('reports')
      .select('*')
      .eq('url', url)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;
    
    if (error || !data || data.length === 0) {
      return null;
    }
    
    return data[0] as StoredReport;
  } catch (err) {
    console.error('Exception fetching latest report:', err);
    return null;
  }
}

// ============================================================================
// Recommendation Query Functions
// ============================================================================

/**
 * Extracts and filters recommendations from a stored report
 */
export function getRecommendationsFromReport(
  report: StoredReport,
  options: RecommendationQueryOptions = {}
): Recommendation[] {
  let recommendations = report.recommendations || [];
  
  // Filter by dimension
  if (options.dimension) {
    recommendations = recommendations.filter((r) => r.dimension === options.dimension);
  }
  
  // Filter by priority
  if (options.priority) {
    recommendations = recommendations.filter((r) => r.priority === options.priority);
  }
  
  // Filter by effort
  if (options.effort) {
    recommendations = recommendations.filter((r) => r.effort === options.effort);
  }
  
  // Filter by minimum ROI
  if (options.minROI !== undefined) {
    recommendations = recommendations.filter(
      (r) => (r.roiScore?.normalizedScore || 0) >= options.minROI!
    );
  }
  
  // Apply limit
  if (options.limit) {
    recommendations = recommendations.slice(0, options.limit);
  }
  
  return recommendations;
}

/**
 * Gets high-priority recommendations from a report
 */
export function getHighPriorityRecommendations(
  report: StoredReport,
  limit: number = 5
): Recommendation[] {
  return getRecommendationsFromReport(report, { priority: 'high', limit });
}

/**
 * Gets quick-win recommendations (high priority, low effort)
 */
export function getQuickWinRecommendations(
  report: StoredReport,
  limit: number = 5
): Recommendation[] {
  const recommendations = report.recommendations || [];
  
  return recommendations
    .filter((r) => r.priority === 'high' && r.effort === 'low')
    .slice(0, limit);
}

/**
 * Gets recommendations grouped by dimension
 */
export function getRecommendationsByDimension(
  report: StoredReport
): Record<string, Recommendation[]> {
  const recommendations = report.recommendations || [];
  
  return recommendations.reduce((acc, rec) => {
    if (!acc[rec.dimension]) {
      acc[rec.dimension] = [];
    }
    acc[rec.dimension].push(rec);
    return acc;
  }, {} as Record<string, Recommendation[]>);
}

// ============================================================================
// Statistics and Aggregation
// ============================================================================

/**
 * Gets report statistics for a user
 */
export async function getUserReportStats(
  userId: string
): Promise<{
  totalReports: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  recentReports: number;
}> {
  try {
    const { supabaseAdmin } = await import('@/lib/supabase/server');
    const supabase = supabaseAdmin;
    
    // Get all reports for user
    const { data, error } = await supabase
      .from('reports')
      .select('overall_score, created_at')
      .eq('user_id', userId);
    
    if (error || !data || data.length === 0) {
      return {
        totalReports: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        recentReports: 0,
      };
    }
    
    const scores = data.map((r) => r.overall_score);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentReports = data.filter(
      (r) => new Date(r.created_at) > thirtyDaysAgo
    ).length;
    
    return {
      totalReports: data.length,
      averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      recentReports,
    };
  } catch (err) {
    console.error('Exception getting user stats:', err);
    return {
      totalReports: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      recentReports: 0,
    };
  }
}

/**
 * Deletes a report by ID
 */
export async function deleteReport(
  reportId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabaseAdmin } = await import('@/lib/supabase/server');
    const supabase = supabaseAdmin;
    
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId)
      .eq('user_id', userId); // Ensure user owns the report
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, error: errorMsg };
  }
}

// ============================================================================
// Exports
// ============================================================================

export default {
  storeReport,
  getReportById,
  getReportByJobId,
  getReportsForUser,
  getLatestReportForUrl,
  getRecommendationsFromReport,
  getHighPriorityRecommendations,
  getQuickWinRecommendations,
  getRecommendationsByDimension,
  getUserReportStats,
  deleteReport,
};

