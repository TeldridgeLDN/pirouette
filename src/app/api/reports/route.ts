/**
 * Reports API
 * 
 * GET /api/reports - List reports for authenticated user
 * 
 * Query Parameters:
 * - limit: number (default: 10)
 * - offset: number (default: 0)
 * - orderBy: 'created_at' | 'overall_score' (default: 'created_at')
 * - orderDirection: 'asc' | 'desc' (default: 'desc')
 * - minScore: number (optional)
 * - maxScore: number (optional)
 * - url: string (optional)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getReportsForUser, getUserReportStats } from '@/lib/analysis/recommendation-engine/storage';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const orderBy = (searchParams.get('orderBy') || 'created_at') as 'created_at' | 'overall_score';
    const orderDirection = (searchParams.get('orderDirection') || 'desc') as 'asc' | 'desc';
    const minScore = searchParams.get('minScore') ? parseInt(searchParams.get('minScore')!, 10) : undefined;
    const maxScore = searchParams.get('maxScore') ? parseInt(searchParams.get('maxScore')!, 10) : undefined;
    const url = searchParams.get('url') || undefined;
    const includeStats = searchParams.get('includeStats') === 'true';
    
    // Fetch reports
    const reports = await getReportsForUser(userId, {
      limit,
      offset,
      orderBy,
      orderDirection,
      minScore,
      maxScore,
      url,
    });
    
    // Optionally include user stats
    let stats = null;
    if (includeStats) {
      stats = await getUserReportStats(userId);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        reports,
        pagination: {
          limit,
          offset,
          count: reports.length,
        },
        stats,
      },
    });
  } catch (error) {
    console.error('Error in reports API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

