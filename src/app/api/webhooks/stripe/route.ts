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
  
  // Determine plan from price ID
  const plan = getPlanFromPriceId(priceId);
  
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
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded:', invoice.id);
  
  // Could be used for:
  // - Sending receipt emails
  // - Updating payment history
  // - Resetting any "past due" flags
  
  const customerId = typeof invoice.customer === 'string' 
    ? invoice.customer 
    : invoice.customer?.id;
  
  if (!customerId) return;
  
  const supabase = supabaseAdmin;
  
  // Ensure user is on correct plan after successful payment
  // Note: In newer Stripe API versions, subscription might be an object or string
  const invoiceData = invoice as unknown as { subscription?: string | { id?: string } };
  const subscriptionId = typeof invoiceData.subscription === 'string'
    ? invoiceData.subscription
    : invoiceData.subscription?.id;
    
  if (subscriptionId) {
    const { error } = await supabase
      .from('users')
      .update({
        stripe_subscription_id: subscriptionId,
      } as never)
      .eq('stripe_customer_id', customerId);
    
    if (error) {
      console.error('Error updating user after payment:', error);
    }
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Payment failed:', invoice.id);
  
  // Could be used for:
  // - Sending dunning emails
  // - Updating user status to "past_due"
  // - Restricting access after X failed attempts
  
  const customerId = invoice.customer as string;
  
  if (!customerId) return;
  
  // For now, just log the failure
  // In production, you might want to:
  // 1. Send an email to the user
  // 2. Show a banner in the app
  // 3. Downgrade after multiple failures
  
  console.warn(`Payment failed for customer ${customerId}`);
}

