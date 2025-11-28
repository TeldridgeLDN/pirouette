'use client';

/**
 * QuotaDisplay Component
 * 
 * Shows the user's analysis quota status with visual progress bar.
 * Displays differently for free users (quota) vs Pro users (unlimited).
 * Shows trial status for trialing users.
 */

import Link from 'next/link';
import type { Plan } from '@/lib/features';

// ============================================================================
// Types
// ============================================================================

interface QuotaDisplayProps {
  plan: Plan;
  analysesUsed: number;
  weeklyLimit: number; // -1 for unlimited
  resetDate: Date;
  // Optional trial info
  isTrialing?: boolean;
  trialDaysRemaining?: number;
  trialEnd?: Date | null;
}

// ============================================================================
// Component
// ============================================================================

export default function QuotaDisplay({
  plan,
  analysesUsed,
  weeklyLimit,
  resetDate,
  isTrialing = false,
  trialDaysRemaining = 0,
  trialEnd = null,
}: QuotaDisplayProps) {
  const isUnlimited = weeklyLimit === -1;
  const remaining = isUnlimited ? -1 : Math.max(0, weeklyLimit - analysesUsed);
  const percentUsed = isUnlimited ? 0 : Math.min(100, (analysesUsed / weeklyLimit) * 100);
  const isNearLimit = !isUnlimited && remaining <= 0;

  // Calculate days until reset
  const now = new Date();
  const daysUntilReset = Math.ceil((resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Trial users - show trial banner
  if (isTrialing && trialDaysRemaining > 0) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-slate-900">
                <span className="text-amber-700">{trialDaysRemaining} {trialDaysRemaining === 1 ? 'day' : 'days'}</span> left in your Pro trial
              </p>
              <p className="text-sm text-slate-600">
                Enjoy unlimited analyses until {trialEnd ? formatTrialEndDate(trialEnd) : 'your trial ends'}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/billing"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Add Payment
          </Link>
        </div>
      </div>
    );
  }

  if (isUnlimited) {
    // Pro users - show unlimited badge
    return (
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-slate-900">Unlimited Analyses</p>
              <p className="text-sm text-slate-600">
                You have {getPlanName(plan)} access — analyse as many pages as you need
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/billing"
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 bg-white text-indigo-700 rounded-full text-sm font-medium shadow-sm hover:bg-indigo-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
            </svg>
            PRO
          </Link>
        </div>
      </div>
    );
  }

  // Free users - show quota with progress bar
  return (
    <div className={`rounded-xl border px-6 py-4 ${
      isNearLimit 
        ? 'bg-amber-50 border-amber-200' 
        : 'bg-white border-slate-200'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <p className="font-medium text-slate-900">
              {isNearLimit ? (
                <span className="text-amber-700">Weekly limit reached</span>
              ) : (
                <>
                  <span className="text-indigo-600">{remaining}</span>
                  <span className="text-slate-600"> of {weeklyLimit} analyses remaining</span>
                </>
              )}
            </p>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isNearLimit ? 'bg-amber-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>

          {/* Reset info */}
          <p className="text-xs text-slate-500 mt-2">
            {isNearLimit ? (
              <>Quota resets in {daysUntilReset} {daysUntilReset === 1 ? 'day' : 'days'} ({formatResetDate(resetDate)})</>
            ) : (
              <>Resets every Sunday at midnight UTC</>
            )}
          </p>
        </div>

        {/* Upgrade CTA */}
        <div className="flex-shrink-0">
          <Link
            href="/pricing"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              isNearLimit
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Upgrade to Pro
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function getPlanName(plan: Plan): string {
  switch (plan) {
    case 'pro_29': return 'Pro';
    case 'pro_49': return 'Pro Plus';
    case 'agency': return 'Agency';
    default: return 'Free';
  }
}

function formatResetDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
}

function formatTrialEndDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

