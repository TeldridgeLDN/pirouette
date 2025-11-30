/**
 * Competitor Analysis API
 * 
 * POST /api/competitors/analyze
 * 
 * Triggers analysis of competitor URLs for comparison.
 * Pro users only - each competitor counts against quota.
 * 
 * Request Body:
 * - reportId: string (required) - The user's report to compare against
 * - competitors: string[] (required) - Up to 3 competitor URLs
 * 
 * Response:
 * - analyses: { id: string, url: string, status: string }[] - Created competitor analyses
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getUserIdFromClerkId } from '@/lib/rate-limit';

// ============================================================================
// Configuration
// ============================================================================

const RAILWAY_ANALYSIS_URL = process.env.ANALYSIS_SERVICE_URL || 'http://localhost:3001';
const MAX_COMPETITORS = 3;

// ============================================================================
// Types
// ============================================================================

interface CompetitorAnalysisRecord {
  id: string;
  competitor_url: string;
  status: string;
}

interface UserRecord {
  id: string;
  plan: string | null;
}

interface ReportRecord {
  id: string;
  user_id: string | null;
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

async function triggerCompetitorAnalysis(
  competitorAnalysisId: string, 
  url: string, 
  userId: string,
  reportId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${RAILWAY_ANALYSIS_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.RAILWAY_API_KEY && { 'Authorization': `Bearer ${process.env.RAILWAY_API_KEY}` }),
      },
      body: JSON.stringify({
        jobId: competitorAnalysisId, // Use competitor analysis ID as job ID
        url,
        userId,
        isCompetitorAnalysis: true,
        reportId, // Link back to user's report
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData.error || 'Analysis service error' };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Error triggering competitor analysis:', err);
    return { success: true }; // Return success since record is created - can be retried
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
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // 2. Get user and check Pro status
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, plan')
      .eq('clerk_id', clerkUserId)
      .single() as { data: UserRecord | null; error: Error | null };
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    const isPro = user.plan === 'pro_29' || user.plan === 'pro_49' || user.plan === 'agency';
    if (!isPro) {
      return NextResponse.json(
        { success: false, error: 'Competitor analysis requires a Pro subscription' },
        { status: 403 }
      );
    }
    
    // 3. Parse request body
    const body = await request.json().catch(() => ({}));
    const { reportId, competitors } = body;
    
    // 4. Validate reportId
    if (!reportId || typeof reportId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Report ID is required' },
        { status: 400 }
      );
    }
    
    // 5. Validate competitors array
    if (!Array.isArray(competitors) || competitors.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one competitor URL is required' },
        { status: 400 }
      );
    }
    
    if (competitors.length > MAX_COMPETITORS) {
      return NextResponse.json(
        { success: false, error: `Maximum ${MAX_COMPETITORS} competitors allowed` },
        { status: 400 }
      );
    }
    
    // 6. Validate each competitor URL
    const validatedUrls: string[] = [];
    for (const url of competitors) {
      if (!url || (typeof url === 'string' && url.trim() === '')) {
        continue; // Skip empty URLs
      }
      
      const validation = validateUrl(url);
      if (!validation.valid) {
        return NextResponse.json(
          { success: false, error: `Invalid URL "${url}": ${validation.error}` },
          { status: 400 }
        );
      }
      validatedUrls.push(validation.normalized!);
    }
    
    if (validatedUrls.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one valid competitor URL is required' },
        { status: 400 }
      );
    }
    
    // 7. Verify the report exists and belongs to the user
    const { data: report, error: reportError } = await supabaseAdmin
      .from('reports')
      .select('id, user_id')
      .eq('id', reportId)
      .single() as { data: ReportRecord | null; error: Error | null };
    
    if (reportError || !report) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }
    
    if (report.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to add competitors to this report' },
        { status: 403 }
      );
    }
    
    // 8. Check for existing competitor analyses for this report
    const { data: existingAnalyses } = await supabaseAdmin
      .from('competitor_analyses')
      .select('id, competitor_url, status')
      .eq('report_id', reportId)
      .eq('user_id', user.id) as { data: CompetitorAnalysisRecord[] | null; error: Error | null };
    
    const existingUrls = new Set(
      (existingAnalyses || []).map(a => a.competitor_url.toLowerCase())
    );
    
    // Filter out URLs that are already being analysed
    const newUrls = validatedUrls.filter(
      url => !existingUrls.has(url.toLowerCase())
    );
    
    // Check if adding new would exceed limit
    const totalAfterAdd = (existingAnalyses?.length || 0) + newUrls.length;
    if (totalAfterAdd > MAX_COMPETITORS) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Adding ${newUrls.length} competitor(s) would exceed the limit of ${MAX_COMPETITORS}. You already have ${existingAnalyses?.length || 0} competitor(s).` 
        },
        { status: 400 }
      );
    }
    
    // 9. Create competitor analysis records
    const createdAnalyses: CompetitorAnalysisRecord[] = [];
    
    for (const url of newUrls) {
      const { data: analysis, error: insertError } = await supabaseAdmin
        .from('competitor_analyses')
        .insert({
          report_id: reportId,
          user_id: user.id,
          competitor_url: url,
          status: 'pending',
          overall_score: 0, // Will be updated when analysis completes
          dimensions: {},
        } as never)
        .select('id, competitor_url, status')
        .single() as { data: CompetitorAnalysisRecord | null; error: Error | null };
      
      if (insertError || !analysis) {
        console.error('Error creating competitor analysis:', insertError);
        continue;
      }
      
      createdAnalyses.push(analysis);
      
      // 10. Trigger Railway analysis (fire and forget)
      triggerCompetitorAnalysis(analysis.id, url, user.id, reportId);
    }
    
    // 11. Return results
    const allAnalyses = [
      ...(existingAnalyses || []),
      ...createdAnalyses,
    ];
    
    return NextResponse.json({
      success: true,
      message: createdAnalyses.length > 0 
        ? `Started analysis for ${createdAnalyses.length} competitor(s)` 
        : 'All URLs are already being analysed',
      analyses: allAnalyses.map(a => ({
        id: a.id,
        url: a.competitor_url,
        status: a.status,
      })),
      newAnalyses: createdAnalyses.map(a => ({
        id: a.id,
        url: a.competitor_url,
        status: a.status,
      })),
    });
    
  } catch (error) {
    console.error('Error in competitor analyze API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET - Fetch existing competitor analyses for a report
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // 2. Get user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, plan')
      .eq('clerk_id', clerkUserId)
      .single() as { data: UserRecord | null; error: Error | null };
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // 3. Get reportId from query params
    const reportId = request.nextUrl.searchParams.get('reportId');
    
    if (!reportId) {
      return NextResponse.json(
        { success: false, error: 'Report ID is required' },
        { status: 400 }
      );
    }
    
    // 4. Fetch competitor analyses
    const { data: analyses, error: fetchError } = await supabaseAdmin
      .from('competitor_analyses')
      .select('*')
      .eq('report_id', reportId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    
    if (fetchError) {
      console.error('Error fetching competitor analyses:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch competitor analyses' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      analyses: analyses || [],
    });
    
  } catch (error) {
    console.error('Error in competitor GET API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

