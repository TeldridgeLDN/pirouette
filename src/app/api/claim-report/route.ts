/**
 * Claim Report API
 * 
 * POST /api/claim-report
 * 
 * Associates an anonymous report with a newly registered user.
 * Called after signup to preserve the anonymous analysis.
 * 
 * Request Body:
 * - reportId: string (required) - The report to claim
 * - jobId: string (optional) - The associated job
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getUserIdFromClerkId, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // 1. Require authentication
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: 'Please sign in to claim this report' },
        { status: 401 }
      );
    }
    
    // 2. Parse request body
    const body = await request.json().catch(() => ({}));
    const { reportId, jobId } = body;
    
    if (!reportId) {
      return NextResponse.json(
        { success: false, error: 'Report ID is required' },
        { status: 400 }
      );
    }
    
    // 3. Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(reportId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid report ID format' },
        { status: 400 }
      );
    }
    
    // 4. Get Supabase user ID
    const supabaseUserId = await getUserIdFromClerkId(clerkUserId);
    
    if (!supabaseUserId) {
      return NextResponse.json(
        { success: false, error: 'User account not found. Please try signing out and back in.' },
        { status: 400 }
      );
    }
    
    const supabase = supabaseAdmin;
    
    // 5. Fetch the report
    interface ReportRow {
      id: string;
      user_id: string | null;
      ip_address: string | null;
      job_id: string;
      created_at: string;
    }
    
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('id, user_id, ip_address, job_id, created_at')
      .eq('id', reportId)
      .single() as { data: ReportRow | null; error: Error | null };
    
    if (reportError || !report) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }
    
    // 6. Check if report is already claimed
    if (report.user_id) {
      // Check if it belongs to this user
      if (report.user_id === supabaseUserId) {
        return NextResponse.json({
          success: true,
          message: 'This report is already in your account',
          alreadyClaimed: true,
        });
      }
      
      return NextResponse.json(
        { success: false, error: 'This report belongs to another user' },
        { status: 403 }
      );
    }
    
    // 7. Verify the user has a right to claim this report
    // Either IP matches or report is recent (within 24 hours)
    const clientIp = getClientIp(request.headers);
    const reportAge = Date.now() - new Date(report.created_at).getTime();
    const isRecentReport = reportAge < 24 * 60 * 60 * 1000; // 24 hours
    
    if (report.ip_address !== clientIp && !isRecentReport) {
      return NextResponse.json(
        { success: false, error: 'Unable to claim this report. It may have been created from a different device.' },
        { status: 403 }
      );
    }
    
    // 8. Update the report with user_id
    // Note: Type assertion needed due to Supabase types version mismatch
    const { error: updateReportError } = await supabase
      .from('reports')
      .update({ 
        user_id: supabaseUserId,
        email_captured: true,
      } as never)
      .eq('id', reportId);
    
    if (updateReportError) {
      console.error('Error updating report:', updateReportError);
      return NextResponse.json(
        { success: false, error: 'Failed to claim report' },
        { status: 500 }
      );
    }
    
    // 9. Also update the associated job if exists
    if (report.job_id || jobId) {
      const associatedJobId = report.job_id || jobId;
      
      await supabase
        .from('jobs')
        .update({ user_id: supabaseUserId } as never)
        .eq('id', associatedJobId)
        .is('user_id', null); // Only update if not already claimed
    }
    
    // 10. Return success
    return NextResponse.json({
      success: true,
      message: 'Report successfully added to your account',
      reportId,
    });
    
  } catch (error) {
    console.error('Error claiming report:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

