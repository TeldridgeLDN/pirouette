/**
 * Subscription Cancellation API
 * 
 * POST /api/subscription/cancel
 * 
 * Cancels the user's subscription at the end of the current billing period.
 * Optionally accepts a cancellation reason for analytics.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getStripe, getActiveSubscription } from '@/lib/stripe';

// ============================================================================
// Types
// ============================================================================

interface CancelRequest {
  reason?: string;
  feedback?: string;
}

interface UserData {
  id: string;
  plan: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

// ============================================================================
// Handler
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
    const body: CancelRequest = await request.json().catch(() => ({}));
    
    const supabase = supabaseAdmin;
    
    // 3. Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, plan, stripe_customer_id, stripe_subscription_id')
      .eq('clerk_id', clerkUserId)
      .single() as { data: UserData | null; error: Error | null };
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // 4. Check if user has an active subscription
    if (!user.stripe_customer_id) {
      return NextResponse.json(
        { success: false, error: 'No active subscription found' },
        { status: 400 }
      );
    }
    
    // 5. Get active subscription from Stripe
    const subscription = await getActiveSubscription(user.stripe_customer_id);
    
    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'No active subscription found' },
        { status: 400 }
      );
    }
    
    // 6. Cancel at period end (don't cancel immediately)
    const stripe = getStripe();
    
    const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
      metadata: {
        cancellation_reason: body.reason || 'not_specified',
        cancellation_feedback: body.feedback || '',
        cancelled_at: new Date().toISOString(),
      },
    });
    
    // 7. Log cancellation for analytics
    const periodEnd = updatedSubscription.current_period_end 
      ? new Date(updatedSubscription.current_period_end * 1000).toISOString()
      : new Date().toISOString();
      
    console.log(`Subscription cancellation scheduled: ${subscription.id}`, {
      userId: user.id,
      reason: body.reason,
      periodEnd,
    });
    
    // 8. Return success with period end date
    return NextResponse.json({
      success: true,
      message: 'Subscription will be cancelled at the end of your billing period',
      periodEnd,
    });
    
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/subscription/cancel/revert
 * 
 * Reverts a scheduled cancellation (reactivates the subscription).
 */
export async function DELETE(request: NextRequest) {
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
      .select('id, stripe_customer_id')
      .eq('clerk_id', clerkUserId)
      .single() as { data: { id: string; stripe_customer_id: string | null } | null; error: Error | null };
    
    if (userError || !user || !user.stripe_customer_id) {
      return NextResponse.json(
        { success: false, error: 'No subscription found' },
        { status: 404 }
      );
    }
    
    // 3. Get subscription
    const subscription = await getActiveSubscription(user.stripe_customer_id);
    
    if (!subscription) {
      return NextResponse.json(
        { success: false, error: 'No active subscription found' },
        { status: 400 }
      );
    }
    
    // 4. Check if cancellation is pending
    if (!subscription.cancel_at_period_end) {
      return NextResponse.json(
        { success: false, error: 'Subscription is not scheduled for cancellation' },
        { status: 400 }
      );
    }
    
    // 5. Revert cancellation
    const stripe = getStripe();
    
    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: false,
    });
    
    console.log(`Subscription cancellation reverted: ${subscription.id}`);
    
    return NextResponse.json({
      success: true,
      message: 'Subscription reactivated successfully',
    });
    
  } catch (error) {
    console.error('Error reverting cancellation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to revert cancellation' },
      { status: 500 }
    );
  }
}

