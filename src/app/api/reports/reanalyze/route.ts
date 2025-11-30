/**
 * Re-analyze API
 * 
 * POST /api/reports/reanalyze
 * 
 * Creates a new analysis job for a URL that has been analyzed before.
 * Pro feature - allows quick re-analysis from historical tracking.
 * 
 * Request Body:
 * - url: string (required) - URL to re-analyse
 * - previousReportId: string (optional) - ID of the previous report
 * 
 * Response:
 * - jobId: string - New job ID for polling
 * - status: string - Initial job status ('queued')
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import type { Plan } from '@/lib/features';

// ============================================================================
// Configuration
// ============================================================================

const RAILWAY_ANALYSIS_URL = process.env.ANALYSIS_SERVICE_URL || 'http://localhost:3001';

// ============================================================================
// Types
// ============================================================================

interface UserRow {
  id: string;
  plan: Plan;
}

// ============================================================================
// URL Validation
// ============================================================================

function validateUrl(url: string): { valid: boolean; normalized?: string; error?: string } {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }
  
  let normalized = url.trim();
  
  // Add protocol if missing
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = `https://${normalized}`;
  }
  
  try {
    const parsed = new URL(normalized);
    
    // Basic validation
    if (!parsed.hostname || parsed.hostname.length < 3) {
      return { valid: false, error: 'Invalid hostname' };
    }
    
    if (!parsed.hostname.includes('.')) {
      return { valid: false, error: 'URL must include a domain extension' };
    }
    
    // Block localhost and internal IPs
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname.startsWith('127.') || hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
      return { valid: false, error: 'Cannot analyse local or internal URLs' };
    }
    
    return { valid: true, normalized };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

// ============================================================================
// Railway Integration
// ============================================================================

async function triggerRailwayAnalysis(jobId: string, url: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${RAILWAY_ANALYSIS_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.RAILWAY_API_KEY && { 'Authorization': `Bearer ${process.env.RAILWAY_API_KEY}` }),
      },
      body: JSON.stringify({
        jobId,
        url,
        userId,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData.error || 'Analysis service error' };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Error triggering Railway analysis:', err);
    return { success: true }; // Return success since job is created
  }
}

// ============================================================================
// API Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // 1. Require authentication
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // 2. Parse request body
    const body = await request.json().catch(() => ({}));
    const { url, previousReportId } = body;
    
    // 3. Validate URL
    const urlValidation = validateUrl(url);
    if (!urlValidation.valid) {
      return NextResponse.json(
        { success: false, error: urlValidation.error },
        { status: 400 }
      );
    }
    
    // 4. Get user from Supabase
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
    
    // 5. Check Pro plan - re-analyze is a Pro feature
    if (user.plan === 'free') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Re-analysis requires Pro plan',
          requiresUpgrade: true 
        },
        { status: 403 }
      );
    }
    
    // 6. Get weekly traffic from previous report (if available)
    let weeklyTraffic: number | null = null;
    
    if (previousReportId) {
      const { data: prevReport } = await supabase
        .from('reports')
        .select('id')
        .eq('id', previousReportId)
        .eq('user_id', user.id)
        .single();
      
      if (prevReport) {
        // Get traffic from the job that created the previous report
        // Type assertion needed due to Supabase types version mismatch
        const { data: prevJob } = await supabase
          .from('jobs')
          .select('weekly_traffic')
          .eq('id', previousReportId)
          .single() as { data: { weekly_traffic: number | null } | null; error: Error | null };
        
        if (prevJob?.weekly_traffic) {
          weeklyTraffic = prevJob.weekly_traffic;
        }
      }
    }
    
    // 7. Create new job
    const jobData: Record<string, unknown> = {
      url: urlValidation.normalized!,
      user_id: user.id,
      status: 'queued',
      progress: 0,
      current_step: 'Queued for re-analysis',
      weekly_traffic: weeklyTraffic,
    };
    
    const { data: job, error: insertError } = await supabase
      .from('jobs')
      .insert(jobData as never)
      .select('id')
      .single() as { data: { id: string } | null; error: Error | null };
    
    if (insertError || !job) {
      console.error('Error creating job:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to create analysis job' },
        { status: 500 }
      );
    }
    
    // 8. Trigger Railway analysis
    triggerRailwayAnalysis(job.id, urlValidation.normalized!, user.id);
    
    // 9. Return job ID for polling
    return NextResponse.json({
      success: true,
      jobId: job.id,
      status: 'queued',
      message: 'Re-analysis started. Track your progress in the results.',
    });
    
  } catch (error) {
    console.error('Error in reanalyze API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

