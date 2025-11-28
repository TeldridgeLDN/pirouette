'use client';

/**
 * useOnboarding Hook
 * 
 * Tracks onboarding progress for new users.
 * Stores state in localStorage with sync to server for analytics.
 */

import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  href?: string;
}

export interface OnboardingState {
  isNewUser: boolean;
  hasSeenWelcome: boolean;
  completedSteps: string[];
  completedAt: string | null;
  startedAt: string;
  lastActiveAt: string;
}

export interface UseOnboardingReturn {
  // State
  state: OnboardingState;
  steps: OnboardingStep[];
  isComplete: boolean;
  progress: number; // 0-100
  
  // Actions
  markWelcomeSeen: () => void;
  completeStep: (stepId: string) => void;
  resetOnboarding: () => void;
  
  // Helpers
  isStepComplete: (stepId: string) => boolean;
  getNextStep: () => OnboardingStep | null;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'pirouette_onboarding';

const DEFAULT_STEPS: OnboardingStep[] = [
  {
    id: 'first_analysis',
    title: 'Run your first analysis',
    description: 'Enter a URL to see Pirouette in action',
    completed: false,
    href: '/dashboard',
  },
  {
    id: 'view_report',
    title: 'View your report',
    description: 'Explore your design scores and recommendations',
    completed: false,
  },
  {
    id: 'explore_recommendation',
    title: 'Explore a recommendation',
    description: 'Click on a recommendation to see details',
    completed: false,
  },
  {
    id: 'check_comparison',
    title: 'Check industry comparison',
    description: 'See how you compare to similar sites',
    completed: false,
  },
];

const DEFAULT_STATE: OnboardingState = {
  isNewUser: true,
  hasSeenWelcome: false,
  completedSteps: [],
  completedAt: null,
  startedAt: new Date().toISOString(),
  lastActiveAt: new Date().toISOString(),
};

// ============================================================================
// Hook
// ============================================================================

export function useOnboarding(): UseOnboardingReturn {
  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as OnboardingState;
        setState(parsed);
      } catch {
        // Invalid stored data, use defaults
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATE));
      }
    } else {
      // New user, save default state
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATE));
    }
    setIsLoaded(true);
  }, []);

  // Save state changes to localStorage
  const saveState = useCallback((newState: OnboardingState) => {
    setState(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }, []);

  // Mark welcome modal as seen
  const markWelcomeSeen = useCallback(() => {
    saveState({
      ...state,
      hasSeenWelcome: true,
      lastActiveAt: new Date().toISOString(),
    });
  }, [state, saveState]);

  // Complete a step
  const completeStep = useCallback((stepId: string) => {
    if (state.completedSteps.includes(stepId)) return;

    const newCompletedSteps = [...state.completedSteps, stepId];
    const allComplete = newCompletedSteps.length >= DEFAULT_STEPS.length;

    saveState({
      ...state,
      completedSteps: newCompletedSteps,
      completedAt: allComplete ? new Date().toISOString() : state.completedAt,
      isNewUser: !allComplete,
      lastActiveAt: new Date().toISOString(),
    });
  }, [state, saveState]);

  // Reset onboarding (for testing)
  const resetOnboarding = useCallback(() => {
    saveState({
      ...DEFAULT_STATE,
      startedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    });
  }, [saveState]);

  // Check if a step is complete
  const isStepComplete = useCallback((stepId: string) => {
    return state.completedSteps.includes(stepId);
  }, [state.completedSteps]);

  // Get next incomplete step
  const getNextStep = useCallback((): OnboardingStep | null => {
    return DEFAULT_STEPS.find(step => !state.completedSteps.includes(step.id)) || null;
  }, [state.completedSteps]);

  // Build steps with completion status
  const steps: OnboardingStep[] = DEFAULT_STEPS.map(step => ({
    ...step,
    completed: state.completedSteps.includes(step.id),
  }));

  // Calculate progress
  const progress = Math.round((state.completedSteps.length / DEFAULT_STEPS.length) * 100);
  const isComplete = state.completedSteps.length >= DEFAULT_STEPS.length;

  return {
    state: isLoaded ? state : DEFAULT_STATE,
    steps,
    isComplete,
    progress,
    markWelcomeSeen,
    completeStep,
    resetOnboarding,
    isStepComplete,
    getNextStep,
  };
}

export default useOnboarding;

