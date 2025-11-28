/**
 * Job Status API
 * 
 * GET /api/jobs/[jobId]
 * 
 * Returns the current status of an analysis job.
 * Supports both authenticated users (user_id match) and anonymous users (IP match).
 * 
 * Response:
 * - id: string - Job ID
 * - status: 'queued' | 'processing' | 'completed' | 'failed'
 * - progress: number - Progress percentage (0-100)
 * - currentStep: string - Current analysis step
 * - url: string - URL being analysed
 * - createdAt: string - Job creation timestamp
 * - completedAt: string (optional) - Job completion timestamp
 * - error: string (optional) - Error message if failed
 * - reportId: string (optional) - Report ID if completed
 * - isAnonymous: boolean - Whether this is an anonymous job
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getUserIdFromClerkId, getClientIp } from '@/lib/rate-limit';

interface RouteParams {
  params: Promise<{ jobId: string }>;
}

// Extended Job type to include ip_address
interface JobWithIp {
  id: string;
  user_id: string | null;
  ip_address: string | null;
  url: string;
  status: string;
  progress: number | null;
  current_step: string | null;
  error: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { jobId } = await params;
    
    // 1. Validate job ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(jobId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid job ID format' },
        { status: 400 }
      );
    }
    
    // 2. Fetch job from Supabase (without user check first)
    const supabase = supabaseAdmin;
    
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single() as { data: JobWithIp | null; error: Error | null };
    
    if (error || !job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }
    
    // 3. Determine if this is an anonymous job or authenticated job
    const isAnonymousJob = !job.user_id && job.ip_address;
    
    // 4. Verify access
    if (isAnonymousJob) {
      // Anonymous job: verify IP address matches
      const clientIp = getClientIp(request.headers);
      
      // Allow access if IP matches or if the job is very recent (within 1 hour)
      // This handles cases where IP might change during analysis
      const jobAge = Date.now() - new Date(job.created_at).getTime();
      const isRecentJob = jobAge < 60 * 60 * 1000; // 1 hour
      
      if (job.ip_address !== clientIp && !isRecentJob) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 403 }
        );
      }
    } else {
      // Authenticated job: verify user ownership
      const { userId: clerkUserId } = await auth();
      
      if (!clerkUserId) {
        // Not authenticated but job requires auth
        return NextResponse.json(
          { success: false, error: 'Please sign in to view this analysis' },
          { status: 401 }
        );
      }
      
      const supabaseUserId = await getUserIdFromClerkId(clerkUserId);
      
      if (!supabaseUserId || job.user_id !== supabaseUserId) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 403 }
        );
      }
    }
    
    // 5. If completed, check for report
    let reportId: string | null = null;
    if (job.status === 'completed') {
      const { data: report } = await supabase
        .from('reports')
        .select('id')
        .eq('job_id', jobId)
        .single() as { data: { id: string } | null; error: Error | null };
      
      if (report) {
        reportId = report.id;
      }
    }
    
    // 6. Return job status with cache headers
    const response = NextResponse.json({
      success: true,
      data: {
        id: job.id,
        status: job.status,
        progress: job.progress || 0,
        currentStep: job.current_step || 'Initialising...',
        url: job.url,
        createdAt: job.created_at,
        startedAt: job.started_at,
        completedAt: job.completed_at,
        error: job.error,
        reportId,
        isAnonymous: isAnonymousJob,
      },
    });
    
    // Add cache headers to prevent excessive polling
    // Cache for 2 seconds for in-progress jobs, longer for completed
    const maxAge = job.status === 'completed' || job.status === 'failed' ? 60 : 2;
    response.headers.set('Cache-Control', `private, max-age=${maxAge}`);
    
    return response;
    
  } catch (error) {
    console.error('Error in job status API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

