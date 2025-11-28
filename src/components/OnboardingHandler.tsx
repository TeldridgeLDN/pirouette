'use client';

/**
 * Onboarding Handler
 * 
 * Manages the onboarding experience:
 * - Shows welcome modal for new users
 * - Displays progress checklist
 * - Tracks step completion
 */

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import OnboardingWelcome from './OnboardingWelcome';
import OnboardingChecklist from './OnboardingChecklist';
import { useOnboarding } from '@/hooks/useOnboarding';

interface OnboardingHandlerProps {
  // Completion triggers from parent
  hasCompletedAnalysis?: boolean;
  hasViewedReport?: boolean;
  hasExploredRecommendation?: boolean;
  hasCheckedComparison?: boolean;
}

export default function OnboardingHandler({
  hasCompletedAnalysis,
  hasViewedReport,
  hasExploredRecommendation,
  hasCheckedComparison,
}: OnboardingHandlerProps) {
  const { user } = useUser();
  const {
    state,
    steps,
    progress,
    isComplete,
    markWelcomeSeen,
    completeStep,
  } = useOnboarding();

  // Auto-complete steps based on props
  useEffect(() => {
    if (hasCompletedAnalysis) completeStep('first_analysis');
  }, [hasCompletedAnalysis, completeStep]);

  useEffect(() => {
    if (hasViewedReport) completeStep('view_report');
  }, [hasViewedReport, completeStep]);

  useEffect(() => {
    if (hasExploredRecommendation) completeStep('explore_recommendation');
  }, [hasExploredRecommendation, completeStep]);

  useEffect(() => {
    if (hasCheckedComparison) completeStep('check_comparison');
  }, [hasCheckedComparison, completeStep]);

  // Don't show onboarding if already complete
  if (isComplete) return null;

  return (
    <>
      {/* Welcome Modal - shown once for new users */}
      <OnboardingWelcome
        isOpen={state.isNewUser && !state.hasSeenWelcome}
        onClose={markWelcomeSeen}
        userName={user?.firstName || undefined}
      />

      {/* Checklist - shown after welcome is dismissed */}
      {state.hasSeenWelcome && (
        <OnboardingChecklist
          steps={steps}
          progress={progress}
          isComplete={isComplete}
        />
      )}
    </>
  );
}

