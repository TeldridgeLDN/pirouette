/**
 * Analysis Complete Notification Endpoint
 * 
 * POST /api/notifications/analysis-complete
 * 
 * Called by the Railway worker after completing an analysis.
 * Sends an email to the user with their results.
 * 
 * Request body:
 * - jobId: string
 * - reportId: string
 * - url: string
 * - overallScore: number
 * - userId: string
 * - topRecommendation?: string
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { sendAnalysisCompleteEmail } from '@/lib/email';

// Secret for authenticating requests from Railway worker
const NOTIFICATION_SECRET = process.env.NOTIFICATION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;

interface NotificationRequest {
  jobId: string;
  reportId: string;
  url: string;
  overallScore: number;
  userId: string;
  topRecommendation?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from our Railway worker
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${NOTIFICATION_SECRET}`;
    
    if (!authHeader || authHeader !== expectedAuth) {
      console.warn('[Notification] Unauthorized request to analysis-complete endpoint');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: NotificationRequest = await request.json();
    const { jobId, reportId, url, overallScore, userId, topRecommendation } = body;

    // Validate required fields
    if (!jobId || !reportId || !url || overallScore === undefined || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: jobId, reportId, url, overallScore, userId' },
        { status: 400 }
      );
    }

    console.log(`[Notification] Analysis complete notification for job ${jobId}`);

    // Look up user email from Supabase
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('email, name')
      .eq('id', userId)
      .single() as { data: { email: string; name: string | null } | null; error: Error | null };

    if (userError || !user) {
      // User not found - might be anonymous analysis
      console.log(`[Notification] User ${userId} not found, skipping email`);
      return NextResponse.json({
        success: true,
        emailSent: false,
        reason: 'User not found (possibly anonymous)',
      });
    }

    // Extract first name from full name
    const firstName = user.name?.split(' ')[0] || undefined;

    // Send the email
    try {
      await sendAnalysisCompleteEmail({
        to: user.email,
        firstName,
        url,
        overallScore,
        reportId,
        topRecommendation,
      });

      console.log(`[Notification] 📧 Analysis complete email sent to ${user.email}`);

      return NextResponse.json({
        success: true,
        emailSent: true,
        recipient: user.email,
      });

    } catch (emailError) {
      // Log but don't fail the request - the analysis is still complete
      console.error('[Notification] Failed to send analysis complete email:', emailError);
      
      return NextResponse.json({
        success: true,
        emailSent: false,
        reason: 'Email sending failed',
        error: emailError instanceof Error ? emailError.message : 'Unknown error',
      });
    }

  } catch (error) {
    console.error('[Notification] Error processing analysis complete notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

