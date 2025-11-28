/**
 * Billing Page
 * 
 * Shows subscription status, plan details, and billing management options.
 * Integrates with Stripe Customer Portal for payment management.
 */

import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getActiveSubscription, getStripe } from '@/lib/stripe';
import Link from 'next/link';
import BillingClient from './BillingClient';
import type { Plan } from '@/lib/features';

// ============================================================================
// Types
// ============================================================================

interface UserData {
  id: string;
  plan: Plan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  analyses_this_month: number;
}

interface SubscriptionInfo {
  plan: Plan;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'none';
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  trialEnd: string | null;
  paymentMethod: { brand: string; last4: string } | null;
  priceAmount: number | null;
  priceCurrency: string | null;
  billingInterval: 'month' | 'year' | null;
  analysesThisMonth: number;
  hasStripeCustomer: boolean;
}

// ============================================================================
// Data Fetching
// ============================================================================

async function getSubscriptionInfo(clerkUserId: string): Promise<SubscriptionInfo | null> {
  // Get user from Supabase
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id, plan, stripe_customer_id, stripe_subscription_id, analyses_this_month')
    .eq('clerk_id', clerkUserId)
    .single() as { data: UserData | null; error: Error | null };

  if (error || !user) {
    return null;
  }

  const baseInfo: SubscriptionInfo = {
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
    hasStripeCustomer: !!user.stripe_customer_id,
  };

  // If no Stripe customer, return free tier
  if (!user.stripe_customer_id) {
    return baseInfo;
  }

  // Fetch subscription from Stripe
  const subscription = await getActiveSubscription(user.stripe_customer_id);
  
  if (!subscription) {
    return baseInfo;
  }

  // Get payment method details
  let paymentMethod: SubscriptionInfo['paymentMethod'] = null;
  
  if (subscription.default_payment_method) {
    try {
      const stripe = getStripe();
      const pmId = typeof subscription.default_payment_method === 'string'
        ? subscription.default_payment_method
        : subscription.default_payment_method.id;
      
      const pm = await stripe.paymentMethods.retrieve(pmId);
      if (pm.card) {
        paymentMethod = {
          brand: pm.card.brand || 'card',
          last4: pm.card.last4 || '****',
        };
      }
    } catch (e) {
      console.error('Error fetching payment method:', e);
    }
  }

  // Get price details
  const priceItem = subscription.items.data[0];
  const price = priceItem?.price;

  // In Stripe SDK v20+ with API 2025-11-17.clover, current_period_end is on SubscriptionItem
  return {
    plan: user.plan || 'free',
    status: subscription.status as SubscriptionInfo['status'],
    currentPeriodEnd: priceItem?.current_period_end
      ? new Date(priceItem.current_period_end * 1000).toISOString()
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
    hasStripeCustomer: true,
  };
}

// ============================================================================
// Component
// ============================================================================

export default async function BillingPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const subscriptionInfo = await getSubscriptionInfo(user.id);

  if (!subscriptionInfo) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Billing & Subscription</h1>
              <p className="mt-1 text-slate-600">Manage your plan and payment details</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <BillingClient subscriptionInfo={subscriptionInfo} />
      </div>
    </div>
  );
}

