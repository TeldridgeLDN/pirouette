/**
 * User Subscription API
 * 
 * GET /api/user/subscription
 * 
 * Returns detailed subscription information for the current user,
 * including plan, billing cycle, payment method, and usage stats.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getStripe, getActiveSubscription } from '@/lib/stripe';
import type { Plan } from '@/lib/features';

// ============================================================================
// Types
// ============================================================================

interface SubscriptionData {
  plan: Plan;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'none';
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  trialEnd: string | null;
  paymentMethod: {
    brand: string;
    last4: string;
  } | null;
  priceAmount: number | null;
  priceCurrency: string | null;
  billingInterval: 'month' | 'year' | null;
  analysesThisMonth: number;
  stripeCustomerId: string | null;
  // Payment failure tracking
  paymentStatus: 'active' | 'pending' | 'failed';
  paymentFailedAt: string | null;
  gracePeriodDaysRemaining: number | null;
}

// ============================================================================
// Handler
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // 1. Require authentication
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // 2. Get user from Supabase
    const supabase = supabaseAdmin;
    
    interface UserRow {
      id: string;
      plan: Plan;
      stripe_customer_id: string | null;
      stripe_subscription_id: string | null;
      analyses_this_month: number;
      payment_status: 'active' | 'pending' | 'failed' | null;
      payment_failed_at: string | null;
    }
    
    const { data: user, error } = await supabase
      .from('users')
      .select('id, plan, stripe_customer_id, stripe_subscription_id, analyses_this_month, payment_status, payment_failed_at')
      .eq('clerk_id', clerkUserId)
      .single() as { data: UserRow | null; error: Error | null };
    
    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Calculate grace period days remaining (7 day grace period)
    const GRACE_PERIOD_DAYS = 7;
    let gracePeriodDaysRemaining: number | null = null;
    
    if (user.payment_status === 'pending' && user.payment_failed_at) {
      const failedDate = new Date(user.payment_failed_at);
      const gracePeriodEnd = new Date(failedDate.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);
      const now = new Date();
      gracePeriodDaysRemaining = Math.max(0, Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
    }
    
    // 3. Build base response for free users
    const baseResponse: SubscriptionData = {
      plan: user.plan || 'free',
      status: 'none',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      trialEnd: null,
      paymentMethod: null,
      priceAmount: null,
      priceCurrency: null,
      billingInterval: null,
      analysesThisMonth: user.analyses_this_month || 0,
      stripeCustomerId: user.stripe_customer_id,
      paymentStatus: user.payment_status || 'active',
      paymentFailedAt: user.payment_failed_at,
      gracePeriodDaysRemaining,
    };
    
    // 4. If no Stripe customer, return free tier info
    if (!user.stripe_customer_id) {
      return NextResponse.json({
        success: true,
        data: baseResponse,
      });
    }
    
    // 5. Fetch subscription from Stripe
    const subscription = await getActiveSubscription(user.stripe_customer_id);
    
    if (!subscription) {
      return NextResponse.json({
        success: true,
        data: baseResponse,
      });
    }
    
    // 6. Get payment method details
    let paymentMethod: SubscriptionData['paymentMethod'] = null;
    
    if (subscription.default_payment_method) {
      const stripe = getStripe();
      const pmId = typeof subscription.default_payment_method === 'string'
        ? subscription.default_payment_method
        : subscription.default_payment_method.id;
      
      try {
        const pm = await stripe.paymentMethods.retrieve(pmId);
        if (pm.card) {
          paymentMethod = {
            brand: pm.card.brand || 'card',
            last4: pm.card.last4 || '****',
          };
        }
      } catch (pmError) {
        console.error('Error fetching payment method:', pmError);
      }
    }
    
    // 7. Get price details
    const priceItem = subscription.items.data[0];
    const price = priceItem?.price;
    
    // 8. Build full response
    const subscriptionData: SubscriptionData = {
      plan: user.plan || 'free',
      status: subscription.status as SubscriptionData['status'],
      currentPeriodEnd: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
      paymentMethod,
      priceAmount: price?.unit_amount ? price.unit_amount / 100 : null,
      priceCurrency: price?.currency?.toUpperCase() || null,
      billingInterval: price?.recurring?.interval as 'month' | 'year' | null,
      analysesThisMonth: user.analyses_this_month || 0,
      stripeCustomerId: user.stripe_customer_id,
      paymentStatus: user.payment_status || 'active',
      paymentFailedAt: user.payment_failed_at,
      gracePeriodDaysRemaining,
    };
    
    return NextResponse.json({
      success: true,
      data: subscriptionData,
    });
    
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

