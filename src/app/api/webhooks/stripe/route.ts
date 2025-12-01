/**
 * Stripe Webhook Handler
 * 
 * POST /api/webhooks/stripe
 * 
 * Handles subscription lifecycle events from Stripe:
 * - checkout.session.completed: New subscription created
 * - customer.subscription.updated: Subscription changed (+ send Trial Started / Subscription Confirmed email)
 * - customer.subscription.deleted: Subscription cancelled (+ send Subscription Cancelled email)
 * - invoice.payment_succeeded: Payment successful
 * - invoice.payment_failed: Payment failed (+ send Payment Failed email)
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase/server';
import { constructWebhookEvent, getPlanFromPriceId, stripe } from '@/lib/stripe';
import {
  sendTrialStartedEmail,
  sendSubscriptionConfirmedEmail,
  sendSubscriptionCancelledEmail,
  sendPaymentFailedEmail,
} from '@/lib/email';

// ============================================================================
// Types
// ============================================================================

type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';

// ============================================================================
// Webhook Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }
    
    // Verify webhook signature
    const event = constructWebhookEvent(body, signature);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }
    
    // Handle event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
        break;
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Handle successful checkout session
 */
async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id);
  
  const userId = session.client_reference_id || session.metadata?.userId;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  
  if (!userId || !customerId) {
    console.error('Missing userId or customerId in checkout session');
    return;
  }
  
  const supabase = supabaseAdmin;
  
  // Update user with Stripe customer ID
  const { error } = await supabase
    .from('users')
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
    } as never)
    .eq('id', userId);
  
  if (error) {
    console.error('Error updating user after checkout:', error);
  }
}

/**
 * Handle subscription creation or update
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id, subscription.status);
  
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;
  const status = subscription.status as SubscriptionStatus;
  
  if (!customerId || !priceId) {
    console.error('Missing customerId or priceId in subscription');
    return;
  }
  
  // Determine plan from price ID (returns 'pro' or 'agency')
  const plan = getPlanFromPriceId(priceId);
  console.log(`Subscription plan determined: ${plan} from price ${priceId}`);
  
  // Determine if subscription is active
  const isActive = status === 'active' || status === 'trialing';
  const isTrial = status === 'trialing';
  
  const supabase = supabaseAdmin;
  
  // Find user by Stripe customer ID
  interface UserRow {
    id: string;
    email: string;
    name: string | null;
    plan: string | null;
  }
  
  let user: UserRow | null = null;
  
  const { data: foundUser, error: findError } = await supabase
    .from('users')
    .select('id, email, name, plan')
    .eq('stripe_customer_id', customerId)
    .single() as { data: UserRow | null; error: Error | null };
  
  if (findError || !foundUser) {
    // Try to find by metadata
    const userId = subscription.metadata?.userId;
    if (!userId) {
      console.error('Could not find user for customer:', customerId);
      return;
    }
    
    // Get user by ID
    const { data: userById } = await supabase
      .from('users')
      .select('id, email, name, plan')
      .eq('id', userId)
      .single() as { data: UserRow | null; error: Error | null };
    
    user = userById;
    
    // Update user with customer ID and plan
    const { error: updateError } = await supabase
      .from('users')
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        plan: isActive ? plan : 'free',
      } as never)
      .eq('id', userId);
    
    if (updateError) {
      console.error('Error updating user subscription:', updateError);
    }
  } else {
    user = foundUser;
    
    // Update existing user
    const { error: updateError } = await supabase
      .from('users')
      .update({
        stripe_subscription_id: subscription.id,
        plan: isActive ? plan : 'free',
      } as never)
      .eq('id', foundUser.id);
    
    if (updateError) {
      console.error('Error updating user subscription:', updateError);
    }
  }
  
  // Send appropriate email if user found and subscription is newly active
  if (user && isActive) {
    const firstName = user.name?.split(' ')[0] || undefined;
    const wasFreePlan = !user.plan || user.plan === 'free';
    
    // Only send email if upgrading from free (avoid duplicate emails on renewals)
    if (wasFreePlan) {
      try {
        if (isTrial) {
          // Trial started
          const trialEnd = subscription.trial_end 
            ? new Date(subscription.trial_end * 1000) 
            : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
          
          await sendTrialStartedEmail({
            to: user.email,
            firstName,
            trialEndDate: trialEnd,
          });
          console.log(`📧 Trial started email sent to ${user.email}`);
        } else {
          // Subscription confirmed (not trial)
          const priceAmount = subscription.items.data[0]?.price.unit_amount || 0;
          const currency = subscription.items.data[0]?.price.currency || 'gbp';
          const interval = subscription.items.data[0]?.price.recurring?.interval || 'month';
          
          const amount = new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: currency.toUpperCase(),
          }).format(priceAmount / 100);
          
          // Access current_period_end from subscription item (Stripe API v2025+)
          const periodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end
            || subscription.items.data[0]?.current_period_end;
          const nextBilling = periodEnd
            ? new Date(periodEnd * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          
          await sendSubscriptionConfirmedEmail({
            to: user.email,
            firstName,
            planName: `Pirouette Pro (${interval}ly)`,
            amount: `${amount}/${interval}`,
            nextBillingDate: nextBilling,
          });
          console.log(`📧 Subscription confirmed email sent to ${user.email}`);
          
          // Trigger referral reward if this user was referred
          // This calls the referral reward endpoint which will send an email to the referrer
          triggerReferralReward(user.id).catch((err) => {
            console.error('Failed to trigger referral reward:', err);
          });
        }
      } catch (emailError) {
        console.error('Failed to send subscription email:', emailError);
      }
    }
  }
}

/**
 * Trigger referral reward processing (non-blocking)
 * Called when a user upgrades to Pro to reward their referrer
 */
async function triggerReferralReward(userId: string): Promise<void> {
  const rewardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://pirouette.app'}/api/referrals/reward`;
  const secret = process.env.INTERNAL_API_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!secret) {
    console.warn('[Referral] No API key for referral reward endpoint');
    return;
  }
  
  try {
    const response = await fetch(rewardUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secret}`,
      },
      body: JSON.stringify({ refereeUserId: userId }),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('[Referral] Reward processed:', result);
    } else {
      console.warn(`[Referral] Reward endpoint returned ${response.status}`);
    }
  } catch (error) {
    console.error('[Referral] Error calling reward endpoint:', error);
  }
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);
  
  const customerId = subscription.customer as string;
  
  if (!customerId) {
    console.error('Missing customerId in deleted subscription');
    return;
  }
  
  const supabase = supabaseAdmin;
  
  // Get user info for email
  interface UserRow {
    id: string;
    email: string;
    name: string | null;
  }
  
  const { data: user } = await supabase
    .from('users')
    .select('id, email, name')
    .eq('stripe_customer_id', customerId)
    .single() as { data: UserRow | null; error: Error | null };
  
  // Downgrade user to free plan
  const { error } = await supabase
    .from('users')
    .update({
      plan: 'free',
      stripe_subscription_id: null,
    } as never)
    .eq('stripe_customer_id', customerId);
  
  if (error) {
    console.error('Error downgrading user after subscription deletion:', error);
  }
  
  // Send cancellation email
  if (user) {
    try {
      const firstName = user.name?.split(' ')[0] || undefined;
      
      // Access end date is the current period end (user already paid for this period)
      // Use type assertion for Stripe API v2025+ compatibility
      const periodEndCancelled = (subscription as unknown as { current_period_end?: number }).current_period_end
        || subscription.items.data[0]?.current_period_end;
      const endDate = periodEndCancelled
        ? new Date(periodEndCancelled * 1000)
        : new Date();
      
      await sendSubscriptionCancelledEmail({
        to: user.email,
        firstName,
        endDate,
      });
      console.log(`📧 Subscription cancelled email sent to ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
    }
  }
}

/**
 * Handle successful payment
 * Clears any payment failure state and restores access
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded:', invoice.id);
  
  const customerId = typeof invoice.customer === 'string' 
    ? invoice.customer 
    : invoice.customer?.id;
  
  if (!customerId) return;
  
  const supabase = supabaseAdmin;
  
  // Note: In newer Stripe API versions, subscription might be an object or string
  const invoiceData = invoice as unknown as { subscription?: string | { id?: string } };
  const subscriptionId = typeof invoiceData.subscription === 'string'
    ? invoiceData.subscription
    : invoiceData.subscription?.id;
  
  // Update user: clear payment failure state and ensure subscription is linked
  const updateData: Record<string, unknown> = {
    payment_status: 'active',
    payment_failed_at: null,
    payment_retry_count: 0,
    last_payment_attempt: new Date().toISOString(),
  };
  
  if (subscriptionId) {
    updateData.stripe_subscription_id = subscriptionId;
  }
  
  const { error } = await supabase
    .from('users')
    .update(updateData as never)
    .eq('stripe_customer_id', customerId);
  
  if (error) {
    console.error('Error updating user after payment:', error);
  } else {
    console.log(`Payment recovered for customer ${customerId}`);
  }
}

/**
 * Handle failed payment
 * Updates payment status and tracks retry attempts
 * After grace period (7 days / ~3 retries), suspends Pro access
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Payment failed:', invoice.id);
  
  const customerId = typeof invoice.customer === 'string'
    ? invoice.customer
    : (invoice.customer as { id?: string })?.id;
  
  if (!customerId) {
    console.error('No customer ID in failed invoice');
    return;
  }
  
  const supabase = supabaseAdmin;
  
  // Get current user state
  interface UserPaymentState {
    id: string;
    email: string;
    name: string | null;
    payment_status: string | null;
    payment_retry_count: number | null;
    payment_failed_at: string | null;
  }
  
  const { data: user, error: findError } = await supabase
    .from('users')
    .select('id, email, name, payment_status, payment_retry_count, payment_failed_at')
    .eq('stripe_customer_id', customerId)
    .single() as { data: UserPaymentState | null; error: Error | null };
  
  if (findError || !user) {
    console.error('Could not find user for failed payment:', customerId);
    return;
  }
  
  const currentRetryCount = (user.payment_retry_count || 0) + 1;
  const now = new Date().toISOString();
  
  // Determine new payment status
  // - First failure: 'pending' (grace period starts)
  // - After 3 failures (~7 days with Stripe Smart Retries): 'failed' (suspend access)
  const GRACE_PERIOD_RETRIES = 3;
  const newStatus = currentRetryCount >= GRACE_PERIOD_RETRIES ? 'failed' : 'pending';
  
  // Update user payment state
  const updateData: Record<string, unknown> = {
    payment_status: newStatus,
    payment_retry_count: currentRetryCount,
    last_payment_attempt: now,
  };
  
  // Only set payment_failed_at on first failure
  if (!user.payment_failed_at) {
    updateData.payment_failed_at = now;
  }
  
  // If access is being suspended, downgrade plan
  if (newStatus === 'failed') {
    updateData.plan = 'free';
    console.warn(`Suspending Pro access for user ${user.id} after ${currentRetryCount} failed payments`);
  }
  
  const { error: updateError } = await supabase
    .from('users')
    .update(updateData as never)
    .eq('id', user.id);
  
  if (updateError) {
    console.error('Error updating user payment status:', updateError);
  } else {
    console.log(`Payment failure recorded for ${user.email}: attempt ${currentRetryCount}, status ${newStatus}`);
  }
  
  // Send payment failed email (dunning sequence based on retry count)
  try {
    const firstName = user.name?.split(' ')[0] || undefined;
    
    // Get invoice amount
    const amount = invoice.amount_due
      ? new Intl.NumberFormat('en-GB', {
          style: 'currency',
          currency: (invoice.currency || 'gbp').toUpperCase(),
        }).format(invoice.amount_due / 100)
      : 'your subscription';
    
    await sendPaymentFailedEmail({
      to: user.email,
      firstName,
      amount,
      retryCount: currentRetryCount,
    });
    console.log(`📧 Payment failed email (attempt ${currentRetryCount}) sent to ${user.email}`);
  } catch (emailError) {
    console.error('Failed to send payment failed email:', emailError);
  }
}

