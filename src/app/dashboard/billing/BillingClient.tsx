'use client';

/**
 * Billing Client Component
 * 
 * Handles interactive billing UI:
 * - Subscription card display
 * - Manage Billing button (Stripe Portal)
 * - Plan upgrade/change options
 */

import { useState } from 'react';
import Link from 'next/link';
import type { Plan } from '@/lib/features';

// ============================================================================
// Types
// ============================================================================

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

interface BillingClientProps {
  subscriptionInfo: SubscriptionInfo;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getPlanName(plan: Plan): string {
  switch (plan) {
    case 'pro_29': return 'Pro';
    case 'pro_49': return 'Pro Plus';
    case 'agency': return 'Agency';
    default: return 'Free';
  }
}

function getStatusBadge(status: SubscriptionInfo['status'], cancelAtPeriodEnd: boolean) {
  if (cancelAtPeriodEnd) {
    return { label: 'Cancelling', color: 'bg-amber-100 text-amber-700' };
  }
  
  switch (status) {
    case 'active':
      return { label: 'Active', color: 'bg-emerald-100 text-emerald-700' };
    case 'trialing':
      return { label: 'Trial', color: 'bg-indigo-100 text-indigo-700' };
    case 'past_due':
      return { label: 'Past Due', color: 'bg-red-100 text-red-700' };
    case 'canceled':
      return { label: 'Cancelled', color: 'bg-slate-100 text-slate-600' };
    default:
      return { label: 'No Subscription', color: 'bg-slate-100 text-slate-600' };
  }
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatCardBrand(brand: string): string {
  return brand.charAt(0).toUpperCase() + brand.slice(1);
}

function getDaysUntil(dateString: string | null): number {
  if (!dateString) return 0;
  const diff = new Date(dateString).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ============================================================================
// Component
// ============================================================================

export default function BillingClient({ subscriptionInfo }: BillingClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPro = subscriptionInfo.plan !== 'free';
  const statusBadge = getStatusBadge(subscriptionInfo.status, subscriptionInfo.cancelAtPeriodEnd);
  const trialDaysRemaining = subscriptionInfo.trialEnd ? getDaysUntil(subscriptionInfo.trialEnd) : 0;

  const handleManageBilling = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/billing-portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to open billing portal');
        return;
      }

      // Redirect to Stripe billing portal
      window.location.href = data.url;
    } catch (err) {
      console.error('Error opening billing portal:', err);
      setError('Failed to open billing portal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Trial Banner */}
      {subscriptionInfo.status === 'trialing' && trialDaysRemaining > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium text-indigo-900">
                {trialDaysRemaining} {trialDaysRemaining === 1 ? 'day' : 'days'} left in your trial
              </p>
              <p className="text-sm text-indigo-700">
                Your trial ends on {formatDate(subscriptionInfo.trialEnd)}.
                {subscriptionInfo.paymentMethod
                  ? ' Your card will be charged automatically.'
                  : ' Add a payment method to continue after your trial.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Warning */}
      {subscriptionInfo.cancelAtPeriodEnd && subscriptionInfo.currentPeriodEnd && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium text-amber-900">Subscription ending</p>
              <p className="text-sm text-amber-700">
                Your {getPlanName(subscriptionInfo.plan)} plan will end on {formatDate(subscriptionInfo.currentPeriodEnd)}.
                You can reactivate anytime before then.
              </p>
            </div>
            <button
              onClick={handleManageBilling}
              disabled={isLoading}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium text-sm hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              Reactivate
            </button>
          </div>
        </div>
      )}

      {/* Payment Failed Warning */}
      {subscriptionInfo.status === 'past_due' && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium text-red-900">Payment failed</p>
              <p className="text-sm text-red-700">
                We couldn't process your latest payment. Please update your payment method to continue using Pro features.
              </p>
            </div>
            <button
              onClick={handleManageBilling}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              Update Payment
            </button>
          </div>
        </div>
      )}

      {/* Subscription Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Your Subscription</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadge.color}`}>
              {statusBadge.label}
            </span>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Plan */}
            <div>
              <dt className="text-sm font-medium text-slate-500 mb-1">Plan</dt>
              <dd className="flex items-center gap-2">
                <span className="text-lg font-semibold text-slate-900">
                  {getPlanName(subscriptionInfo.plan)}
                </span>
                {isPro && (
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">
                    PRO
                  </span>
                )}
              </dd>
            </div>

            {/* Price */}
            {subscriptionInfo.priceAmount && (
              <div>
                <dt className="text-sm font-medium text-slate-500 mb-1">Price</dt>
                <dd className="text-lg font-semibold text-slate-900">
                  £{subscriptionInfo.priceAmount}/{subscriptionInfo.billingInterval === 'year' ? 'year' : 'month'}
                </dd>
              </div>
            )}

            {/* Next Billing */}
            {subscriptionInfo.currentPeriodEnd && !subscriptionInfo.cancelAtPeriodEnd && (
              <div>
                <dt className="text-sm font-medium text-slate-500 mb-1">Next Billing Date</dt>
                <dd className="text-slate-900">{formatDate(subscriptionInfo.currentPeriodEnd)}</dd>
              </div>
            )}

            {/* Payment Method */}
            {subscriptionInfo.paymentMethod && (
              <div>
                <dt className="text-sm font-medium text-slate-500 mb-1">Payment Method</dt>
                <dd className="flex items-center gap-2 text-slate-900">
                  <span className="font-mono">{formatCardBrand(subscriptionInfo.paymentMethod.brand)} •••• {subscriptionInfo.paymentMethod.last4}</span>
                </dd>
              </div>
            )}

            {/* Usage */}
            <div>
              <dt className="text-sm font-medium text-slate-500 mb-1">Analyses This Month</dt>
              <dd className="text-slate-900">
                {subscriptionInfo.analysesThisMonth} {isPro ? '(Unlimited)' : 'of 4'}
              </dd>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
          {error && (
            <p className="text-sm text-red-600 mb-3">{error}</p>
          )}
          
          <div className="flex flex-wrap gap-3">
            {isPro && subscriptionInfo.hasStripeCustomer ? (
              <>
                <button
                  onClick={handleManageBilling}
                  disabled={isLoading}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium text-sm hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    'Manage Billing'
                  )}
                </button>
                <Link
                  href="/pricing"
                  className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg font-medium text-sm hover:bg-slate-50 transition-colors"
                >
                  Change Plan
                </Link>
              </>
            ) : (
              <Link
                href="/pricing"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors"
              >
                Upgrade to Pro
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Features Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">
            {isPro ? 'Your Pro Features' : 'Upgrade to Unlock'}
          </h2>
        </div>

        <ul className="divide-y divide-slate-100">
          {[
            { name: 'Unlimited Analyses', icon: '⚡', available: isPro },
            { name: 'Historical Tracking', icon: '📈', available: isPro },
            { name: 'Competitor Comparison', icon: '🆚', available: isPro },
            { name: 'Export as PDF', icon: '📄', available: isPro },
            { name: 'Revenue Estimates', icon: '💰', available: isPro },
            { name: 'Priority Support', icon: '💬', available: isPro },
          ].map((feature) => (
            <li key={feature.name} className="px-6 py-3 flex items-center gap-3">
              <span className="text-lg">{feature.icon}</span>
              <span className={`flex-1 ${feature.available ? 'text-slate-900' : 'text-slate-400'}`}>
                {feature.name}
              </span>
              {feature.available ? (
                <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              )}
            </li>
          ))}
        </ul>

        {!isPro && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
            <Link
              href="/pricing"
              className="block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors"
            >
              View Plans & Pricing
            </Link>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-5">
        <h3 className="font-medium text-slate-900 mb-2">Need Help?</h3>
        <p className="text-sm text-slate-600 mb-3">
          If you have questions about billing or need to make changes to your account,
          our support team is here to help.
        </p>
        <a
          href="mailto:support@pirouette.design"
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Contact Support →
        </a>
      </div>
    </>
  );
}

