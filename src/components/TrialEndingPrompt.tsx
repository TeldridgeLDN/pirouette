'use client';

/**
 * Trial Ending Prompt
 * 
 * Shown in dashboard when trial is ending soon (Day 5+).
 * Prompts user to add payment method or upgrade.
 */

import Link from 'next/link';

interface TrialEndingPromptProps {
  daysRemaining: number;
  trialEnd: Date | null;
  hasPaymentMethod?: boolean;
}

export default function TrialEndingPrompt({
  daysRemaining,
  trialEnd,
  hasPaymentMethod = false,
}: TrialEndingPromptProps) {
  // Only show for 2 days or less
  if (daysRemaining > 2) {
    return null;
  }

  const isLastDay = daysRemaining <= 1;
  const formattedEnd = trialEnd
    ? trialEnd.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
    : 'soon';

  return (
    <div className={`rounded-xl border-2 px-6 py-5 ${
      isLastDay 
        ? 'bg-red-50 border-red-200' 
        : 'bg-amber-50 border-amber-200'
    }`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
          isLastDay ? 'bg-red-100' : 'bg-amber-100'
        }`}>
          {isLastDay ? (
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className={`font-semibold ${isLastDay ? 'text-red-900' : 'text-amber-900'}`}>
            {isLastDay 
              ? 'Last day of your trial!' 
              : `${daysRemaining} days left in your trial`
            }
          </h3>
          <p className={`text-sm mt-1 ${isLastDay ? 'text-red-700' : 'text-amber-700'}`}>
            {hasPaymentMethod ? (
              <>Your Pro subscription will start automatically on {formattedEnd}.</>
            ) : (
              <>
                {isLastDay 
                  ? 'Add a payment method now to keep your Pro features after today.'
                  : `Your trial ends on ${formattedEnd}. Add a payment method to continue with Pro.`
                }
              </>
            )}
          </p>

          {/* Features they'll lose */}
          {!hasPaymentMethod && (
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded text-xs text-slate-600">
                <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Unlimited analyses
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded text-xs text-slate-600">
                <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Historical tracking
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded text-xs text-slate-600">
                <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                PDF exports
              </span>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="flex-shrink-0">
          {hasPaymentMethod ? (
            <Link
              href="/dashboard/billing"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg font-medium text-sm hover:bg-slate-50 transition-colors"
            >
              View Subscription
            </Link>
          ) : (
            <Link
              href="/dashboard/billing"
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-white rounded-lg font-medium text-sm transition-colors ${
                isLastDay 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              {isLastDay ? 'Add Payment Now' : 'Add Payment'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

