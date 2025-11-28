/**
 * Single Report API
 * 
 * GET /api/reports/[id] - Get a specific report
 * DELETE /api/reports/[id] - Delete a report
 * 
 * Supports both authenticated users (by user_id) and anonymous users (by ip_address).
 * 
 * Path Parameters:
 * - id: Report ID (UUID)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getClientIp, getUserIdFromClerkId } from '@/lib/rate-limit';
import {
  getReportById,
  deleteReport,
  getHighPriorityRecommendations,
  getQuickWinRecommendations,
  getRecommendationsByDimension,
} from '@/lib/analysis/recommendation-engine/storage';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Extended report type with ip_address
interface ReportWithIp {
  id: string;
  user_id: string | null;
  ip_address?: string | null;
  job_id: string;
  url: string;
  screenshot_url?: string;
  overall_score: number;
  colors_score?: number;
  whitespace_score?: number;
  complexity_score?: number;
  typography_score?: number;
  layout_score?: number;
  cta_score?: number;
  hierarchy_score?: number;
  dimensions: Record<string, unknown>;
  recommendations: unknown[];
  analysis_time?: number;
  version?: string;
  created_at: string;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid report ID format' },
        { status: 400 }
      );
    }
    
    // Fetch report with ip_address
    const supabase = supabaseAdmin;
    const { data: report, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single() as { data: ReportWithIp | null; error: Error | null };
    
    if (error || !report) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }
    
    // Determine if this is an anonymous report
    const isAnonymousReport = !report.user_id && report.ip_address;
    
    // Verify access
    if (isAnonymousReport) {
      // Anonymous report: verify IP address matches or report is recent
      const clientIp = getClientIp(request.headers);
      const reportAge = Date.now() - new Date(report.created_at).getTime();
      const isRecentReport = reportAge < 24 * 60 * 60 * 1000; // 24 hours
      
      if (report.ip_address !== clientIp && !isRecentReport) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 403 }
        );
      }
    } else if (report.user_id) {
      // Authenticated report: verify user ownership
      const { userId: clerkUserId } = await auth();
      
      if (!clerkUserId) {
        // Allow access if report has no user_id (legacy/migration case)
        // But if it has user_id, require auth
        return NextResponse.json(
          { success: false, error: 'Please sign in to view this report' },
          { status: 401 }
        );
      }
      
      const supabaseUserId = await getUserIdFromClerkId(clerkUserId);
      
      if (!supabaseUserId || report.user_id !== supabaseUserId) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 403 }
        );
      }
    }
    
    // Parse query parameters for recommendation filtering
    const searchParams = request.nextUrl.searchParams;
    const includeRecommendations = searchParams.get('includeRecommendations') !== 'false';
    const recommendationFilter = searchParams.get('filter');
    
    // Use the storage functions that work with the report object
    let recommendations: unknown = report.recommendations;
    if (includeRecommendations && recommendationFilter) {
      // Cast to expected type for storage functions
      const storedReport = report as Parameters<typeof getHighPriorityRecommendations>[0];
      
      switch (recommendationFilter) {
        case 'high-priority':
          recommendations = getHighPriorityRecommendations(storedReport);
          break;
        case 'quick-wins':
          recommendations = getQuickWinRecommendations(storedReport);
          break;
        case 'by-dimension':
          // Returns Record<string, Recommendation[]> - keep as-is for grouped view
          recommendations = getRecommendationsByDimension(storedReport);
          break;
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        report: {
          ...report,
          recommendations: includeRecommendations ? recommendations : undefined,
          isAnonymous: isAnonymousReport,
        },
      },
    });
  } catch (error) {
    console.error('Error in report API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Authenticate user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    
    // Delete report (storage function verifies ownership)
    const result = await deleteReport(id, userId);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to delete report' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

