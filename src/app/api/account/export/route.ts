/**
 * Account Data Export API
 * 
 * GET /api/account/export
 * 
 * Exports all user data as JSON for GDPR compliance.
 * Returns a downloadable JSON file with all account data.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// ============================================================================
// Types
// ============================================================================

interface UserData {
  id: string;
  clerk_id: string;
  email: string;
  name: string | null;
  plan: string;
  created_at: string;
  analyses_this_month: number;
}

interface ReportData {
  id: string;
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
}

interface JobData {
  id: string;
  url: string;
  status: string;
  created_at: string;
  completed_at: string | null;
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
    
    const supabase = supabaseAdmin;
    
    // 2. Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, clerk_id, email, name, plan, created_at, analyses_this_month')
      .eq('clerk_id', clerkUserId)
      .single() as { data: UserData | null; error: Error | null };
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // 3. Get all reports
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
        hierarchy_score,
        recommendations
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }) as { data: ReportData[] | null; error: Error | null };
    
    if (reportsError) {
      console.error('Error fetching reports:', reportsError);
    }
    
    // 4. Get all jobs (analysis history)
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, url, status, created_at, completed_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }) as { data: JobData[] | null; error: Error | null };
    
    if (jobsError) {
      console.error('Error fetching jobs:', jobsError);
    }
    
    // 5. Build export data
    const exportData = {
      exportDate: new Date().toISOString(),
      exportVersion: '1.0',
      
      account: {
        email: user.email,
        name: user.name,
        plan: user.plan,
        createdAt: user.created_at,
        totalAnalyses: jobs?.length || 0,
        totalReports: reports?.length || 0,
      },
      
      reports: (reports || []).map(report => ({
        id: report.id,
        url: report.url,
        analysedAt: report.created_at,
        scores: {
          overall: report.overall_score,
          colors: report.colors_score,
          whitespace: report.whitespace_score,
          complexity: report.complexity_score,
          typography: report.typography_score,
          layout: report.layout_score,
          cta: report.cta_score,
          hierarchy: report.hierarchy_score,
        },
        recommendationsCount: Array.isArray(report.recommendations) 
          ? report.recommendations.length 
          : 0,
      })),
      
      analysisHistory: (jobs || []).map(job => ({
        id: job.id,
        url: job.url,
        status: job.status,
        requestedAt: job.created_at,
        completedAt: job.completed_at,
      })),
    };
    
    // 6. Generate filename
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `pirouette-data-export-${dateStr}.json`;
    
    // 7. Return JSON file
    const jsonString = JSON.stringify(exportData, null, 2);
    
    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(Buffer.byteLength(jsonString)),
      },
    });
    
  } catch (error) {
    console.error('Error exporting account data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

