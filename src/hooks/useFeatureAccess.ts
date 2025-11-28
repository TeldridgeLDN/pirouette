'use client';

/**
 * useFeatureAccess Hook
 * 
 * Provides feature access checking for React components.
 * Integrates with user plan from the server.
 */

import { useUser } from '@clerk/nextjs';
import { useCallback, useState, useEffect } from 'react';
import { 
  Plan, 
  Feature, 
  hasFeature, 
  getAvailableFeatures, 
  getLockedFeatures,
  isProPlan,
  getFeatureInfo,
  getPlanInfo,
} from '@/lib/features';

// ============================================================================
// Types
// ============================================================================

interface UserPlanData {
  plan: Plan;
  analysesThisMonth: number;
  analysesLimit: number;
  stripeCustomerId?: string | null;
}

interface FeatureAccessHook {
  // Plan info
  plan: Plan;
  planName: string;
  isPro: boolean;
  isLoading: boolean;
  
  // Feature access
  canAccess: (feature: Feature) => boolean;
  availableFeatures: Feature[];
  lockedFeatures: Feature[];
  
  // UI helpers
  shouldShowUpgrade: (feature: Feature) => boolean;
  getFeatureInfo: typeof getFeatureInfo;
  getPlanInfo: typeof getPlanInfo;
  
  // Usage info
  analysesUsed: number;
  analysesLimit: number;
  analysesRemaining: number;
  
  // Actions
  refreshPlan: () => Promise<void>;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useFeatureAccess(): FeatureAccessHook {
  const { user, isLoaded } = useUser();
  const [planData, setPlanData] = useState<UserPlanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch user plan data from API
  const fetchPlanData = useCallback(async () => {
    if (!user) {
      setPlanData(null);
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/user/plan');
      if (response.ok) {
        const data = await response.json();
        setPlanData(data.data);
      } else {
        // Default to free plan on error
        setPlanData({
          plan: 'free',
          analysesThisMonth: 0,
          analysesLimit: 1,
        });
      }
    } catch (err) {
      console.error('Error fetching plan data:', err);
      setPlanData({
        plan: 'free',
        analysesThisMonth: 0,
        analysesLimit: 1,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  // Fetch plan data on mount and when user changes
  useEffect(() => {
    if (isLoaded) {
      fetchPlanData();
    }
  }, [isLoaded, fetchPlanData]);
  
  // Current plan (default to free)
  const plan: Plan = planData?.plan || 'free';
  const isPro = isProPlan(plan);
  
  // Analyses usage
  const analysesUsed = planData?.analysesThisMonth || 0;
  const analysesLimit = planData?.analysesLimit || (isPro ? -1 : 1);
  const analysesRemaining = isPro ? -1 : Math.max(0, analysesLimit - analysesUsed);
  
  // Feature access functions
  const canAccess = useCallback((feature: Feature) => hasFeature(plan, feature), [plan]);
  const shouldShowUpgrade = useCallback((feature: Feature) => !hasFeature(plan, feature), [plan]);
  
  return {
    // Plan info
    plan,
    planName: getPlanInfo(plan).name,
    isPro,
    isLoading: !isLoaded || isLoading,
    
    // Feature access
    canAccess,
    availableFeatures: getAvailableFeatures(plan),
    lockedFeatures: getLockedFeatures(plan),
    
    // UI helpers
    shouldShowUpgrade,
    getFeatureInfo,
    getPlanInfo,
    
    // Usage info
    analysesUsed,
    analysesLimit,
    analysesRemaining,
    
    // Actions
    refreshPlan: fetchPlanData,
  };
}

export default useFeatureAccess;

