/**
 * Analysis Request API
 * 
 * POST /api/analyze
 * 
 * Creates a new analysis job and triggers the Railway analysis service.
 * 
 * Request Body:
 * - url: string (required) - URL to analyse
 * - weeklyTraffic: number (optional) - Weekly visitors for revenue calculations
 * 
 * Response:
 * - jobId: string - Unique job identifier for polling
 * - status: string - Initial job status ('queued')
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { checkRateLimit, getUserIdFromClerkId } from '@/lib/rate-limit';
import type { InsertJob } from '@/lib/supabase/types';

// ============================================================================
// Configuration
// ============================================================================

const RAILWAY_ANALYSIS_URL = process.env.ANALYSIS_SERVICE_URL || 'http://localhost:3001';

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
        // Add API key if configured
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
    // Don't fail the request - the job is queued and can be retried
    return { success: true }; // Return success since job is created
  }
}

// ============================================================================
// API Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: 'Please sign in to analyse a website' },
        { status: 401 }
      );
    }
    
    // 2. Parse request body
    const body = await request.json().catch(() => ({}));
    const { url, weeklyTraffic } = body;
    
    // 3. Validate URL
    const urlValidation = validateUrl(url);
    if (!urlValidation.valid) {
      return NextResponse.json(
        { success: false, error: urlValidation.error },
        { status: 400 }
      );
    }
    
    // 4. Validate traffic (if provided)
    let validatedTraffic: number | null = null;
    if (weeklyTraffic !== undefined && weeklyTraffic !== null && weeklyTraffic !== '') {
      const parsed = parseInt(weeklyTraffic, 10);
      if (isNaN(parsed) || parsed < 0) {
        return NextResponse.json(
          { success: false, error: 'Weekly traffic must be a positive number' },
          { status: 400 }
        );
      }
      validatedTraffic = parsed;
    }
    
    // 5. Check rate limit
    const rateLimitResult = await checkRateLimit(clerkUserId);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: rateLimitResult.message || 'Rate limit exceeded',
          resetAt: rateLimitResult.resetAt?.toISOString(),
        },
        { status: 429 }
      );
    }
    
    // 6. Get Supabase user ID
    const supabaseUserId = await getUserIdFromClerkId(clerkUserId);
    
    if (!supabaseUserId) {
      return NextResponse.json(
        { success: false, error: 'User account not found. Please try signing out and back in.' },
        { status: 400 }
      );
    }
    
    // 7. Create job in Supabase
    const supabase = supabaseAdmin;
    
    const jobData: InsertJob = {
      user_id: supabaseUserId,
      url: urlValidation.normalized!, // Guaranteed to exist after validation passes
      status: 'queued',
      progress: 0,
      current_step: 'Queued for analysis',
    };
    
    // Type assertion needed due to Supabase types version mismatch
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
    
    // 8. Trigger Railway analysis (fire and forget)
    // In production, this would be handled by BullMQ job queue
    triggerRailwayAnalysis(job.id, urlValidation.normalized!, supabaseUserId);
    
    // 9. Return job ID for polling
    return NextResponse.json({
      success: true,
      jobId: job.id,
      status: 'queued',
      message: 'Analysis started. You can check the status using the job ID.',
      ...(validatedTraffic && { weeklyTraffic: validatedTraffic }),
    });
    
  } catch (error) {
    console.error('Error in analyze API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

