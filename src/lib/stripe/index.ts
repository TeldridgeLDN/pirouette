/**
 * Stripe Configuration and Utilities
 * 
 * Handles Stripe initialization and provides utilities for:
 * - Creating checkout sessions
 * - Managing subscriptions
 * - Handling webhooks
 */

import Stripe from 'stripe';

// ============================================================================
// Stripe Client (Lazy Initialization)
// ============================================================================

let _stripe: Stripe | null = null;

/**
 * Gets the Stripe client instance.
 * Lazily initialized to avoid build-time errors when STRIPE_SECRET_KEY is not set.
 */
export function getStripe(): Stripe {
  if (!_stripe) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured. Payment features require a Stripe API key.');
    }
    
    _stripe = new Stripe(apiKey, {
      apiVersion: '2025-11-17.clover',
      typescript: true,
    });
  }
  
  return _stripe;
}

// For backwards compatibility, but prefer getStripe()
export const stripe = {
  get checkout() { return getStripe().checkout; },
  get customers() { return getStripe().customers; },
  get subscriptions() { return getStripe().subscriptions; },
  get billingPortal() { return getStripe().billingPortal; },
  get webhooks() { return getStripe().webhooks; },
} as unknown as Stripe;

// ============================================================================
// Configuration
// ============================================================================

export const STRIPE_CONFIG = {
  // Price IDs (set in environment variables)
  prices: {
    pro_29: process.env.STRIPE_PRO_29_PRICE_ID || '',
    pro_49: process.env.STRIPE_PRO_49_PRICE_ID || '',
    agency: process.env.STRIPE_AGENCY_PRICE_ID || '',
  },
  
  // Plan mapping
  planFromPrice: {
    [process.env.STRIPE_PRO_29_PRICE_ID || '']: 'pro_29' as const,
    [process.env.STRIPE_PRO_49_PRICE_ID || '']: 'pro_49' as const,
    [process.env.STRIPE_AGENCY_PRICE_ID || '']: 'agency' as const,
  },
  
  // Trial settings
  trialDays: 7,
  
  // URLs
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
  cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?cancelled=true`,
  billingPortalReturnUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
} as const;

// ============================================================================
// Types
// ============================================================================

export type PlanType = 'free' | 'pro_29' | 'pro_49' | 'agency';

export interface CreateCheckoutOptions {
  userId: string;
  userEmail: string;
  priceId: string;
  customerId?: string;
  includeTrial?: boolean;
}

export interface CheckoutResult {
  success: boolean;
  sessionId?: string;
  url?: string;
  error?: string;
}

export interface PortalResult {
  success: boolean;
  url?: string;
  error?: string;
}

// ============================================================================
// Checkout Session
// ============================================================================

/**
 * Creates a Stripe Checkout session for subscription
 */
export async function createCheckoutSession(
  options: CreateCheckoutOptions
): Promise<CheckoutResult> {
  try {
    const { userId, userEmail, priceId, customerId, includeTrial = true } = options;
    
    // Validate price ID
    if (!priceId) {
      return { success: false, error: 'Invalid price ID' };
    }
    
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: STRIPE_CONFIG.successUrl,
      cancel_url: STRIPE_CONFIG.cancelUrl,
      client_reference_id: userId,
      customer_email: customerId ? undefined : userEmail,
      customer: customerId || undefined,
      metadata: {
        userId,
      },
      allow_promotion_codes: true,
    };
    
    // Add trial if enabled
    if (includeTrial && STRIPE_CONFIG.trialDays > 0) {
      sessionConfig.subscription_data = {
        trial_period_days: STRIPE_CONFIG.trialDays,
        metadata: {
          userId,
        },
      };
    }
    
    const session = await stripe.checkout.sessions.create(sessionConfig);
    
    return {
      success: true,
      sessionId: session.id,
      url: session.url || undefined,
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create checkout session',
    };
  }
}

// ============================================================================
// Billing Portal
// ============================================================================

/**
 * Creates a Stripe Billing Portal session for subscription management
 */
export async function createBillingPortalSession(
  customerId: string
): Promise<PortalResult> {
  try {
    if (!customerId) {
      return { success: false, error: 'Customer ID is required' };
    }
    
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: STRIPE_CONFIG.billingPortalReturnUrl,
    });
    
    return {
      success: true,
      url: session.url,
    };
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create billing portal session',
    };
  }
}

// ============================================================================
// Customer Management
// ============================================================================

/**
 * Gets or creates a Stripe customer for a user
 */
export async function getOrCreateCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<{ customerId: string | null; error?: string }> {
  try {
    // First, search for existing customer
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });
    
    if (existingCustomers.data.length > 0) {
      const customer = existingCustomers.data[0];
      
      // Update metadata if needed
      if (customer.metadata?.userId !== userId) {
        await stripe.customers.update(customer.id, {
          metadata: { userId },
        });
      }
      
      return { customerId: customer.id };
    }
    
    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
      metadata: {
        userId,
      },
    });
    
    return { customerId: customer.id };
  } catch (error) {
    console.error('Error getting/creating customer:', error);
    return {
      customerId: null,
      error: error instanceof Error ? error.message : 'Failed to get or create customer',
    };
  }
}

// ============================================================================
// Subscription Management
// ============================================================================

/**
 * Gets the active subscription for a customer
 */
export async function getActiveSubscription(
  customerId: string
): Promise<Stripe.Subscription | null> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });
    
    if (subscriptions.data.length > 0) {
      return subscriptions.data[0];
    }
    
    // Also check for trialing subscriptions
    const trialingSubs = await stripe.subscriptions.list({
      customer: customerId,
      status: 'trialing',
      limit: 1,
    });
    
    if (trialingSubs.data.length > 0) {
      return trialingSubs.data[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error getting active subscription:', error);
    return null;
  }
}

/**
 * Cancels a subscription at period end
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel subscription',
    };
  }
}

// ============================================================================
// Webhook Verification
// ============================================================================

/**
 * Verifies and constructs Stripe webhook event
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event | null {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return null;
  }
  
  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return null;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Gets plan type from Stripe price ID
 */
export function getPlanFromPriceId(priceId: string): PlanType {
  return STRIPE_CONFIG.planFromPrice[priceId] || 'free';
}

/**
 * Gets price ID for a plan
 */
export function getPriceIdForPlan(plan: PlanType): string | null {
  switch (plan) {
    case 'pro_29':
      return STRIPE_CONFIG.prices.pro_29 || null;
    case 'pro_49':
      return STRIPE_CONFIG.prices.pro_49 || null;
    case 'agency':
      return STRIPE_CONFIG.prices.agency || null;
    default:
      return null;
  }
}

