'use client';

/**
 * useUserPlan Hook
 * 
 * Provides comprehensive user plan and subscription information
 * for React components, including trial status.
 */

import { useUser } from '@clerk/nextjs';
import { useCallback, useState, useEffect } from 'react';
import type { Plan } from '@/lib/features';

// ============================================================================
// Types
// ============================================================================

export interface SubscriptionStatus {
  plan: Plan;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'none';
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  trialEnd: string | null;
  analysesThisMonth: number;
  hasStripeCustomer: boolean;
}

export interface UserPlanHook {
  // Plan info
  plan: Plan;
  isPro: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Subscription status
  status: SubscriptionStatus['status'];
  isTrialing: boolean;
  trialDaysRemaining: number;
  trialEnd: Date | null;
  
  // Billing info
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  hasStripeCustomer: boolean;
  
  // Usage
  analysesThisMonth: number;
  
  // Actions
  refresh: () => Promise<void>;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getDaysRemaining(dateString: string | null): number {
  if (!dateString) return 0;
  const diff = new Date(dateString).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useUserPlan(): UserPlanHook {
  const { user, isLoaded } = useUser();
  const [data, setData] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) {
      setData(null);
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await fetch('/api/user/subscription');
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch subscription');
        }
      } else {
        // Fallback to free plan
        setData({
          plan: 'free',
          status: 'none',
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
          trialEnd: null,
          analysesThisMonth: 0,
          hasStripeCustomer: false,
        });
      }
    } catch (err) {
      console.error('Error fetching user plan:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch plan');
      setData({
        plan: 'free',
        status: 'none',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        trialEnd: null,
        analysesThisMonth: 0,
        hasStripeCustomer: false,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isLoaded) {
      fetchData();
    }
  }, [isLoaded, fetchData]);

  // Derived values
  const plan = data?.plan || 'free';
  const isPro = plan !== 'free';
  const status = data?.status || 'none';
  const isTrialing = status === 'trialing';
  const trialDaysRemaining = getDaysRemaining(data?.trialEnd || null);
  const trialEnd = data?.trialEnd ? new Date(data.trialEnd) : null;
  const currentPeriodEnd = data?.currentPeriodEnd ? new Date(data.currentPeriodEnd) : null;

  return {
    // Plan info
    plan,
    isPro,
    isLoading: !isLoaded || isLoading,
    error,
    
    // Subscription status
    status,
    isTrialing,
    trialDaysRemaining,
    trialEnd,
    
    // Billing info
    currentPeriodEnd,
    cancelAtPeriodEnd: data?.cancelAtPeriodEnd || false,
    hasStripeCustomer: data?.hasStripeCustomer || false,
    
    // Usage
    analysesThisMonth: data?.analysesThisMonth || 0,
    
    // Actions
    refresh: fetchData,
  };
}

export default useUserPlan;

