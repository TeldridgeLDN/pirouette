'use client';

/**
 * Payment Failed Banner
 * 
 * Displays a prominent warning when payment has failed.
 * Shows days remaining in grace period and CTA to update payment.
 */

import { useState } from 'react';

// ============================================================================
// Types
// ============================================================================

interface PaymentFailedBannerProps {
  daysRemaining: number;
  onUpdatePayment: () => void;
}

// ============================================================================
// Component
// ============================================================================

export default function PaymentFailedBanner({ 
  daysRemaining, 
  onUpdatePayment 
}: PaymentFailedBannerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onUpdatePayment();
    } finally {
      setIsLoading(false);
    }
  };

  // Determine urgency based on days remaining
  const isUrgent = daysRemaining <= 2;
  const isCritical = daysRemaining <= 0;

  return (
    <div className={`rounded-xl px-6 py-4 ${
      isCritical 
        ? 'bg-red-600 text-white' 
        : isUrgent 
          ? 'bg-red-100 border border-red-200' 
          : 'bg-amber-50 border border-amber-200'
    }`}>
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isCritical 
            ? 'bg-red-700' 
            : isUrgent 
              ? 'bg-red-200' 
              : 'bg-amber-100'
        }`}>
          <svg 
            className={`w-5 h-5 ${
              isCritical 
                ? 'text-white' 
                : isUrgent 
                  ? 'text-red-600' 
                  : 'text-amber-600'
            }`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className={`font-semibold ${
            isCritical ? 'text-white' : isUrgent ? 'text-red-900' : 'text-amber-900'
          }`}>
            {isCritical 
              ? 'Your Pro access has been suspended' 
              : 'Payment failed — action required'}
          </p>
          <p className={`text-sm ${
            isCritical ? 'text-red-100' : isUrgent ? 'text-red-700' : 'text-amber-700'
          }`}>
            {isCritical ? (
              'Update your payment method to restore Pro features.'
            ) : daysRemaining === 1 ? (
              'Your Pro access will be suspended tomorrow. Update your payment method now.'
            ) : (
              `We couldn't process your payment. You have ${daysRemaining} days to update your payment method.`
            )}
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={handleClick}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex-shrink-0 ${
            isCritical 
              ? 'bg-white text-red-600 hover:bg-red-50' 
              : 'bg-red-600 text-white hover:bg-red-700'
          } disabled:opacity-50`}
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
            'Update Payment'
          )}
        </button>
      </div>
    </div>
  );
}

