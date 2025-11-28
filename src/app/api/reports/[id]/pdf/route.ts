/**
 * PDF Export API
 * 
 * GET /api/reports/[id]/pdf
 * 
 * Generates and returns a PDF report for the specified analysis.
 * Pro feature - returns 403 for free users.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { generateReportPDF } from '@/lib/pdf/generate-report-pdf';
import type { Plan } from '@/lib/features';

// ============================================================================
// Types
// ============================================================================

interface UserRow {
  id: string;
  plan: Plan;
}

interface ReportRow {
  id: string;
  user_id: string;
  url: string;
  created_at: string;
  overall_score: number;
  colors_score: number | null;
  whitespace_score: number | null;
  complexity_score: number | null;
  typography_score: number | null;
  layout_score: number | null;
  cta_score: number | null;
  hierarchy_score: number | null;
  recommendations: unknown[];
  screenshot_url: string | null;
}

// ============================================================================
// Handler
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params;
    
    // 1. Require authentication
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // 2. Get user from Supabase
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
    
    // 3. Check Pro plan - PDF export is a Pro feature
    if (user.plan === 'free') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'PDF export requires Pro plan',
          requiresUpgrade: true 
        },
        { status: 403 }
      );
    }
    
    // 4. Fetch the report
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select(`
        id,
        user_id,
        url,
        created_at,
        overall_score,
        colors_score,
        whitespace_score,
        complexity_score,
        typography_score,
        layout_score,
        cta_score,
        hierarchy_score,
        recommendations,
        screenshot_url
      `)
      .eq('id', reportId)
      .single() as { data: ReportRow | null; error: Error | null };
    
    if (reportError || !report) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }
    
    // 5. Verify ownership (user can only export their own reports)
    if (report.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // 6. Get query parameters for options
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get('all') === 'true';
    
    // 7. Generate PDF
    const pdfBuffer = await generateReportPDF(
      {
        id: report.id,
        url: report.url,
        created_at: report.created_at,
        overall_score: report.overall_score,
        colors_score: report.colors_score,
        whitespace_score: report.whitespace_score,
        complexity_score: report.complexity_score,
        typography_score: report.typography_score,
        layout_score: report.layout_score,
        cta_score: report.cta_score,
        hierarchy_score: report.hierarchy_score,
        recommendations: report.recommendations as {
          title: string;
          description: string;
          priority: 'high' | 'medium' | 'low';
          effort: 'low' | 'medium' | 'high';
          dimension: string;
        }[],
        screenshot_url: report.screenshot_url || undefined,
      },
      {
        includeAllRecommendations: includeAll,
        maxRecommendations: 5,
      }
    );
    
    // 8. Generate filename
    const urlHostname = new URL(report.url.startsWith('http') ? report.url : `https://${report.url}`).hostname;
    const dateStr = new Date(report.created_at).toISOString().split('T')[0];
    const filename = `pirouette-report-${urlHostname}-${dateStr}.pdf`;
    
    // 9. Return PDF response (convert Buffer to Uint8Array for NextResponse)
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdfBuffer.length),
        'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
      },
    });
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

