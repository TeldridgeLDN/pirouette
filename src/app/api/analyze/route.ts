/**
 * Analysis Request API
 * 
 * POST /api/analyze
 * 
 * Creates a new analysis job and triggers the Railway analysis service.
 * Supports both authenticated and anonymous users with different rate limits.
 * 
 * Rate Limits:
 * - Anonymous (no account): 1 analysis per IP per day
 * - Free account: 3 analyses per week
 * - Pro users: Unlimited analyses
 * 
 * Request Body:
 * - url: string (required) - URL to analyse
 * - weeklyTraffic: number (optional) - Weekly visitors for revenue calculations
 * 
 * Response:
 * - jobId: string - Unique job identifier for polling
 * - status: string - Initial job status ('queued')
 * - isAnonymous: boolean - Whether this was an anonymous analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { 
  checkRateLimit, 
  getUserIdFromClerkId,
  getClientIp,
  checkAnonymousRateLimit,
  recordAnonymousAnalysis,
} from '@/lib/rate-limit';
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
    // 1. Check authentication status (don't require it)
    const { userId: clerkUserId } = await auth();
    const isAuthenticated = !!clerkUserId;
    
    // 2. Get client IP for anonymous rate limiting
    const clientIp = getClientIp(request.headers);
    const userAgent = request.headers.get('user-agent') || undefined;
    
    // 3. Parse request body
    const body = await request.json().catch(() => ({}));
    const { url, weeklyTraffic } = body;
    
    // 4. Validate URL
    const urlValidation = validateUrl(url);
    if (!urlValidation.valid) {
      return NextResponse.json(
        { success: false, error: urlValidation.error },
        { status: 400 }
      );
    }
    
    // 5. Validate traffic (if provided)
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
    
    // 6. Check rate limit (different for authenticated vs anonymous)
    let supabaseUserId: string | null = null;
    
    if (isAuthenticated) {
      // Authenticated user: check user-based rate limit
      const rateLimitResult = await checkRateLimit(clerkUserId);
      
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          { 
            success: false, 
            error: rateLimitResult.message || 'Rate limit exceeded',
            resetAt: rateLimitResult.resetAt?.toISOString(),
            isAuthenticated: true,
          },
          { status: 429 }
        );
      }
      
      // Get Supabase user ID
      supabaseUserId = await getUserIdFromClerkId(clerkUserId);
      
      if (!supabaseUserId) {
        return NextResponse.json(
          { success: false, error: 'User account not found. Please try signing out and back in.' },
          { status: 400 }
        );
      }
    } else {
      // Anonymous user: check IP-based rate limit
      const anonymousRateLimit = await checkAnonymousRateLimit(clientIp);
      
      if (!anonymousRateLimit.allowed) {
        return NextResponse.json(
          { 
            success: false, 
            error: anonymousRateLimit.message || 'Rate limit exceeded',
            resetAt: anonymousRateLimit.resetAt?.toISOString(),
            isAuthenticated: false,
            suggestSignup: true,
          },
          { status: 429 }
        );
      }
    }
    
    // 7. Create job in Supabase
    const supabase = supabaseAdmin;
    
    // Build job data - user_id is nullable for anonymous users
    const jobData: Record<string, unknown> = {
      url: urlValidation.normalized!,
      status: 'queued',
      progress: 0,
      current_step: 'Queued for analysis',
      weekly_traffic: validatedTraffic, // Store traffic data for recommendations
    };
    
    if (supabaseUserId) {
      jobData.user_id = supabaseUserId;
    } else {
      // Anonymous user: store IP for tracking
      jobData.ip_address = clientIp;
    }
    
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
    
    // 8. Record anonymous analysis for rate limiting (if anonymous)
    if (!isAuthenticated) {
      await recordAnonymousAnalysis(clientIp, urlValidation.normalized!, job.id, userAgent);
    }
    
    // 9. Trigger Railway analysis (fire and forget)
    // In production, this would be handled by BullMQ job queue
    // Pass user ID or 'anonymous' for logging purposes
    triggerRailwayAnalysis(job.id, urlValidation.normalized!, supabaseUserId || 'anonymous');
    
    // 10. Return job ID for polling
    return NextResponse.json({
      success: true,
      jobId: job.id,
      status: 'queued',
      isAnonymous: !isAuthenticated,
      message: isAuthenticated 
        ? 'Analysis started. You can check the status using the job ID.'
        : 'Analysis started! Create a free account to save your results and get weekly analyses.',
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

