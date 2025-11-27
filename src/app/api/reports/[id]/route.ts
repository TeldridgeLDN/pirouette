/**
 * Single Report API
 * 
 * GET /api/reports/[id] - Get a specific report
 * DELETE /api/reports/[id] - Delete a report
 * 
 * Path Parameters:
 * - id: Report ID (UUID)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getReportById,
  deleteReport,
  getRecommendationsFromReport,
  getHighPriorityRecommendations,
  getQuickWinRecommendations,
  getRecommendationsByDimension,
} from '@/lib/analysis/recommendation-engine/storage';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
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
    
    // Fetch report
    const report = await getReportById(id);
    
    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }
    
    // Verify ownership
    if (report.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Parse query parameters for recommendation filtering
    const searchParams = request.nextUrl.searchParams;
    const includeRecommendations = searchParams.get('includeRecommendations') !== 'false';
    const recommendationFilter = searchParams.get('filter'); // 'high-priority' | 'quick-wins' | 'by-dimension'
    
    let recommendations = null;
    if (includeRecommendations) {
      switch (recommendationFilter) {
        case 'high-priority':
          recommendations = getHighPriorityRecommendations(report);
          break;
        case 'quick-wins':
          recommendations = getQuickWinRecommendations(report);
          break;
        case 'by-dimension':
          recommendations = getRecommendationsByDimension(report);
          break;
        default:
          recommendations = report.recommendations;
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        report: {
          ...report,
          recommendations: includeRecommendations ? recommendations : undefined,
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

