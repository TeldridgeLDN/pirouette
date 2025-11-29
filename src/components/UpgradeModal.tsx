'use client';

/**
 * Upgrade Modal
 * 
 * Displayed when:
 * - Free users hit their rate limit
 * - Users try to access Pro-only features
 * - Users click upgrade buttons
 * 
 * Features:
 * - Pro plan benefits
 * - Pricing options (£29/mo and £49/mo)
 * - 7-day free trial option
 * - Direct Stripe Checkout integration
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trackUpgradeClicked, trackTrialStarted } from '@/lib/analytics';

// ============================================================================
// Types
// ============================================================================

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: 'rate_limit' | 'pro_feature' | 'manual';
  currentUsage?: {
    used: number;
    limit: number;
    resetDate?: Date;
  };
  featureName?: string; // For pro_feature trigger
}

type PlanOption = 'pro_29' | 'pro_49';

// ============================================================================
// Configuration
// ============================================================================

const PLANS = {
  pro_29: {
    name: 'Pro',
    price: '£29',
    period: '/month',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_29_PRICE_ID || '',
    features: [
      'Unlimited analyses',
      'Full recommendation list',
      'Revenue impact estimates',
      'Historical tracking',
      'Priority support',
    ],
    recommended: true,
  },
  pro_49: {
    name: 'Pro Plus',
    price: '£49',
    period: '/month',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_49_PRICE_ID || '',
    features: [
      'Everything in Pro',
      'White-label reports',
      'API access',
      'Export as PDF',
      'Competitor comparison',
      'Dedicated support',
    ],
    recommended: false,
  },
};

const PRO_BENEFITS = [
  { icon: '⚡', text: 'Unlimited analyses' },
  { icon: '📈', text: 'Historical tracking' },
  { icon: '🆚', text: 'Competitor comparison' },
  { icon: '📄', text: 'Export as PDF' },
  { icon: '💰', text: 'Revenue impact estimates' },
  { icon: '🎯', text: 'ROI-prioritised recommendations' },
];

// ============================================================================
// Helper Functions
// ============================================================================

function formatResetDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function getHeadline(trigger: string, featureName?: string): string {
  switch (trigger) {
    case 'rate_limit':
      return "You've used your free analysis this week";
    case 'pro_feature':
      return featureName 
        ? `${featureName} is a Pro feature`
        : 'This is a Pro feature';
    default:
      return 'Upgrade to Pro';
  }
}

function getSubheadline(trigger: string): string {
  switch (trigger) {
    case 'rate_limit':
      return 'Upgrade to Pro for unlimited analyses and unlock powerful features.';
    case 'pro_feature':
      return 'Get access to advanced features with a Pro subscription.';
    default:
      return 'Take your landing page optimisation to the next level.';
  }
}

// ============================================================================
// Component
// ============================================================================

export default function UpgradeModal({
  isOpen,
  onClose,
  trigger,
  currentUsage,
  featureName,
}: UpgradeModalProps) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PlanOption>('pro_29');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  if (!isOpen) return null;
  
  const handleUpgrade = async (includeTrial: boolean = true) => {
    setIsLoading(true);
    setError(null);
    
    // Track upgrade intent
    const triggerMap = {
      rate_limit: 'limit_reached' as const,
      pro_feature: 'feature_gate' as const,
      manual: 'pricing_page' as const,
    };
    trackUpgradeClicked('upgrade_modal', selectedPlan === 'pro_29' ? 'pro' : 'agency', triggerMap[trigger]);
    
    if (includeTrial) {
      trackTrialStarted('upgrade_modal');
    }
    
    try {
      const plan = PLANS[selectedPlan];
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: plan.priceId,
          includeTrial,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.redirectToBilling) {
          // User already has a subscription, redirect to billing portal
          const portalResponse = await fetch('/api/billing-portal', {
            method: 'POST',
          });
          const portalData = await portalResponse.json();
          
          if (portalData.success && portalData.url) {
            window.location.href = portalData.url;
            return;
          }
        }
        
        throw new Error(data.error || 'Failed to start checkout');
      }
      
      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors z-10"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-4">
              {trigger === 'rate_limit' ? (
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {getHeadline(trigger, featureName)}
            </h2>
            <p className="text-indigo-100">
              {getSubheadline(trigger)}
            </p>
            
            {/* Usage indicator for rate limit trigger */}
            {trigger === 'rate_limit' && currentUsage && (
              <div className="mt-4 inline-block bg-white/10 rounded-lg px-4 py-2">
                <span className="text-white/90 text-sm">
                  Used {currentUsage.used} of {currentUsage.limit} free analysis
                  {currentUsage.resetDate && (
                    <> • Resets {formatResetDate(currentUsage.resetDate)}</>
                  )}
                </span>
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="p-6">
            {/* Benefits list */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {PRO_BENEFITS.map((benefit) => (
                <div 
                  key={benefit.text}
                  className="flex items-center gap-2 text-sm text-slate-600"
                >
                  <span className="text-lg">{benefit.icon}</span>
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>
            
            {/* Plan selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {(Object.entries(PLANS) as [PlanOption, typeof PLANS.pro_29][]).map(([key, plan]) => (
                <button
                  key={key}
                  onClick={() => setSelectedPlan(key)}
                  className={`
                    relative p-4 rounded-xl border-2 text-left transition-all
                    ${selectedPlan === key 
                      ? 'border-indigo-500 bg-indigo-50 shadow-lg' 
                      : 'border-slate-200 hover:border-slate-300'
                    }
                  `}
                >
                  {plan.recommended && (
                    <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-orange-500 text-white text-xs font-medium rounded-full">
                      Popular
                    </span>
                  )}
                  
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-2xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-500">{plan.period}</span>
                  </div>
                  <div className="font-medium text-slate-900 mb-2">{plan.name}</div>
                  <ul className="space-y-1">
                    {plan.features.slice(0, 3).map((feature) => (
                      <li key={feature} className="text-xs text-slate-500 flex items-center gap-1">
                        <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                    {plan.features.length > 3 && (
                      <li className="text-xs text-indigo-600">+{plan.features.length - 3} more</li>
                    )}
                  </ul>
                  
                  {/* Selection indicator */}
                  <div className={`
                    absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${selectedPlan === key 
                      ? 'border-indigo-500 bg-indigo-500' 
                      : 'border-slate-300'
                    }
                  `}>
                    {selectedPlan === key && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            {/* CTA buttons */}
            <div className="space-y-3">
              <button
                onClick={() => handleUpgrade(true)}
                disabled={isLoading}
                className={`
                  w-full px-6 py-3 rounded-xl text-white font-semibold text-lg
                  transition-all hover:-translate-y-0.5
                  ${isLoading 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30'
                  }
                `}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Start 7-Day Free Trial'
                )}
              </button>
              
              <button
                onClick={() => handleUpgrade(false)}
                disabled={isLoading}
                className="w-full px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Subscribe Now (Skip Trial)
              </button>
            </div>
            
            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500 mb-2">
                Cancel anytime • No credit card needed for trial
              </p>
              <button
                onClick={() => router.push('/pricing')}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View full pricing details →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

