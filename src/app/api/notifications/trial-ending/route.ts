/**
 * Trial Ending Notification Endpoint
 * 
 * POST /api/notifications/trial-ending
 * 
 * Called by the Railway cron job to send trial ending reminder emails.
 * 
 * Request body:
 * - userId: string
 * - email: string
 * - firstName?: string
 * - daysRemaining: number
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendTrialEndingEmail } from '@/lib/email';

// Secret for authenticating requests from Railway worker
const NOTIFICATION_SECRET = process.env.NOTIFICATION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;

interface NotificationRequest {
  userId: string;
  email: string;
  firstName?: string;
  daysRemaining: number;
}

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from our Railway worker
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${NOTIFICATION_SECRET}`;
    
    if (!authHeader || authHeader !== expectedAuth) {
      console.warn('[Notification] Unauthorized request to trial-ending endpoint');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: NotificationRequest = await request.json();
    const { userId, email, firstName, daysRemaining } = body;

    // Validate required fields
    if (!userId || !email || daysRemaining === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, email, daysRemaining' },
        { status: 400 }
      );
    }

    console.log(`[Notification] Trial ending notification for user ${userId} (${daysRemaining} days)`);

    // Send the email
    try {
      await sendTrialEndingEmail({
        to: email,
        firstName,
        daysRemaining,
      });

      console.log(`[Notification] 📧 Trial ending email (${daysRemaining} days) sent to ${email}`);

      return NextResponse.json({
        success: true,
        emailSent: true,
        recipient: email,
        daysRemaining,
      });

    } catch (emailError) {
      console.error('[Notification] Failed to send trial ending email:', emailError);
      
      return NextResponse.json({
        success: false,
        emailSent: false,
        error: emailError instanceof Error ? emailError.message : 'Unknown error',
      }, { status: 500 });
    }

  } catch (error) {
    console.error('[Notification] Error processing trial ending notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

