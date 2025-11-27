/**
 * Recommendations API
 * 
 * GET /api/reports/[id]/recommendations - Get recommendations for a report
 * 
 * Path Parameters:
 * - id: Report ID (UUID)
 * 
 * Query Parameters:
 * - dimension: Filter by dimension (e.g., 'colors', 'ctaProminence')
 * - priority: Filter by priority ('high', 'medium', 'low')
 * - effort: Filter by effort ('low', 'medium', 'high')
 * - minROI: Minimum ROI score (0-10)
 * - limit: Maximum number of recommendations
 * - filter: Preset filter ('quick-wins', 'high-priority')
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getReportById,
  getRecommendationsFromReport,
  getHighPriorityRecommendations,
  getQuickWinRecommendations,
  getRecommendationsByDimension,
} from '@/lib/analysis/recommendation-engine/storage';
import type { Recommendation } from '@/lib/analysis/core/types';

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
    
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter');
    const dimension = searchParams.get('dimension') || undefined;
    const priority = searchParams.get('priority') as 'high' | 'medium' | 'low' | undefined;
    const effort = searchParams.get('effort') as 'low' | 'medium' | 'high' | undefined;
    const minROI = searchParams.get('minROI') ? parseFloat(searchParams.get('minROI')!) : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;
    const groupBy = searchParams.get('groupBy');
    
    let recommendations: Recommendation[] | Record<string, Recommendation[]>;
    
    // Handle preset filters
    if (filter === 'quick-wins') {
      recommendations = getQuickWinRecommendations(report, limit || 5);
    } else if (filter === 'high-priority') {
      recommendations = getHighPriorityRecommendations(report, limit || 5);
    } else if (groupBy === 'dimension') {
      recommendations = getRecommendationsByDimension(report);
    } else {
      // Apply custom filters
      recommendations = getRecommendationsFromReport(report, {
        dimension,
        priority,
        effort,
        minROI,
        limit,
      });
    }
    
    // Calculate summary stats
    const allRecs = Array.isArray(recommendations) 
      ? recommendations 
      : Object.values(recommendations).flat();
    
    const summary = {
      total: allRecs.length,
      byPriority: {
        high: allRecs.filter((r) => r.priority === 'high').length,
        medium: allRecs.filter((r) => r.priority === 'medium').length,
        low: allRecs.filter((r) => r.priority === 'low').length,
      },
      byEffort: {
        low: allRecs.filter((r) => r.effort === 'low').length,
        medium: allRecs.filter((r) => r.effort === 'medium').length,
        high: allRecs.filter((r) => r.effort === 'high').length,
      },
    };
    
    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        summary,
        filters: {
          dimension,
          priority,
          effort,
          minROI,
          limit,
          filter,
          groupBy,
        },
      },
    });
  } catch (error) {
    console.error('Error in recommendations API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

