/**
 * Job Status API
 * 
 * GET /api/jobs/[jobId]
 * 
 * Returns the current status of an analysis job.
 * Users can only access their own jobs.
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
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getUserIdFromClerkId } from '@/lib/rate-limit';
import type { Job, Report } from '@/lib/supabase/types';

interface RouteParams {
  params: Promise<{ jobId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // 1. Authenticate user
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { jobId } = await params;
    
    // 2. Validate job ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(jobId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid job ID format' },
        { status: 400 }
      );
    }
    
    // 3. Get Supabase user ID
    const supabaseUserId = await getUserIdFromClerkId(clerkUserId);
    
    if (!supabaseUserId) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 400 }
      );
    }
    
    // 4. Fetch job from Supabase
    const supabase = supabaseAdmin;
    
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single() as { data: Job | null; error: Error | null };
    
    if (error || !job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }
    
    // 5. Verify ownership
    if (job.user_id !== supabaseUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // 6. If completed, check for report
    let reportId: string | null = null;
    if (job.status === 'completed') {
      const { data: report } = await supabase
        .from('reports')
        .select('id')
        .eq('job_id', jobId)
        .single() as { data: Pick<Report, 'id'> | null; error: Error | null };
      
      if (report) {
        reportId = report.id;
      }
    }
    
    // 7. Return job status with cache headers
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

