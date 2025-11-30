/**
 * Stripe Webhook Handler
 * 
 * POST /api/webhooks/stripe
 * 
 * Handles subscription lifecycle events from Stripe:
 * - checkout.session.completed: New subscription created
 * - customer.subscription.updated: Subscription changed
 * - customer.subscription.deleted: Subscription cancelled
 * - invoice.payment_succeeded: Payment successful
 * - invoice.payment_failed: Payment failed
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase/server';
import { constructWebhookEvent, getPlanFromPriceId } from '@/lib/stripe';

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
  
  const supabase = supabaseAdmin;
  
  // Find user by Stripe customer ID
  interface UserRow {
    id: string;
  }
  
  const { data: user, error: findError } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single() as { data: UserRow | null; error: Error | null };
  
  if (findError || !user) {
    // Try to find by metadata
    const userId = subscription.metadata?.userId;
    if (!userId) {
      console.error('Could not find user for customer:', customerId);
      return;
    }
    
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
    return;
  }
  
  // Update existing user
  const { error: updateError } = await supabase
    .from('users')
    .update({
      stripe_subscription_id: subscription.id,
      plan: isActive ? plan : 'free',
    } as never)
    .eq('id', user.id);
  
  if (updateError) {
    console.error('Error updating user subscription:', updateError);
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
    payment_status: string | null;
    payment_retry_count: number | null;
    payment_failed_at: string | null;
  }
  
  const { data: user, error: findError } = await supabase
    .from('users')
    .select('id, email, payment_status, payment_retry_count, payment_failed_at')
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
  
  // TODO: Send dunning email based on retry count
  // - Attempt 1: "Payment failed - update your card"
  // - Attempt 2: "Action required - Pro access ending soon"
  // - Attempt 3: "Your Pro access has been suspended"
}

