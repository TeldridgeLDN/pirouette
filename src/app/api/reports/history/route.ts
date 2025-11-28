/**
 * Historical Reports API
 * 
 * GET /api/reports/history?url=example.com
 * 
 * Returns historical analysis reports for a URL.
 * Pro feature - returns 403 for free users.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { Plan } from '@/lib/features';

// ============================================================================
// Types
// ============================================================================

interface HistoricalReport {
  id: string;
  url: string;
  created_at: string;
  overall_score: number | null;
  colors_score: number | null;
  whitespace_score: number | null;
  complexity_score: number | null;
  typography_score: number | null;
  layout_score: number | null;
  cta_score: number | null;
  hierarchy_score: number | null;
}

interface UserRow {
  id: string;
  plan: Plan;
}

// ============================================================================
// URL Normalization
// ============================================================================

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    // Remove trailing slash and www prefix for consistent matching
    let hostname = parsed.hostname.replace(/^www\./, '');
    let pathname = parsed.pathname.replace(/\/$/, '') || '/';
    return `${hostname}${pathname}`;
  } catch {
    return url.toLowerCase().trim();
  }
}

// ============================================================================
// Handler
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // 1. Require authentication
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // 2. Get URL parameter
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    
    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL parameter required' },
        { status: 400 }
      );
    }
    
    // 3. Get user from Supabase
    const supabase = supabaseAdmin;
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, plan')
      .eq('clerk_id', clerkUserId)
      .single() as { data: UserRow | null; error: Error | null };
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // 4. Check Pro plan - historical tracking is a Pro feature
    if (user.plan === 'free') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Historical tracking requires Pro plan',
          requiresUpgrade: true 
        },
        { status: 403 }
      );
    }
    
    // 5. Normalize URL for matching
    const normalizedUrl = normalizeUrl(url);
    
    // 6. Fetch historical reports for this URL
    // We need to match URLs flexibly (with/without www, trailing slashes, etc.)
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select(`
        id,
        url,
        created_at,
        overall_score,
        colors_score,
        whitespace_score,
        complexity_score,
        typography_score,
        layout_score,
        cta_score,
        hierarchy_score
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20) as { data: HistoricalReport[] | null; error: Error | null };
    
    if (reportsError) {
      console.error('Error fetching reports:', reportsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch historical reports' },
        { status: 500 }
      );
    }
    
    // 7. Filter to matching URLs (normalize each for comparison)
    const matchingReports = (reports || []).filter(report => {
      const reportNormalized = normalizeUrl(report.url);
      return reportNormalized === normalizedUrl;
    });
    
    // 8. Calculate improvement metrics if we have multiple reports
    let improvements = null;
    
    if (matchingReports.length >= 2) {
      const latest = matchingReports[0];
      const previous = matchingReports[1];
      
      improvements = {
        overall: calculateChange(latest.overall_score, previous.overall_score),
        colors: calculateChange(latest.colors_score, previous.colors_score),
        whitespace: calculateChange(latest.whitespace_score, previous.whitespace_score),
        complexity: calculateChange(latest.complexity_score, previous.complexity_score),
        typography: calculateChange(latest.typography_score, previous.typography_score),
        layout: calculateChange(latest.layout_score, previous.layout_score),
        cta: calculateChange(latest.cta_score, previous.cta_score),
        hierarchy: calculateChange(latest.hierarchy_score, previous.hierarchy_score),
      };
    }
    
    return NextResponse.json({
      success: true,
      data: {
        reports: matchingReports,
        improvements,
        totalReports: matchingReports.length,
        url: normalizedUrl,
      },
    });
    
  } catch (error) {
    console.error('Error in historical reports API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// Helpers
// ============================================================================

function calculateChange(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null) return null;
  return current - previous;
}

