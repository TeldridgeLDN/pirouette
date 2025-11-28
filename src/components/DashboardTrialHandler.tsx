'use client';

/**
 * Dashboard Trial Handler
 * 
 * Manages trial-related modals and prompts:
 * - Shows welcome modal after successful checkout
 * - Shows trial ending prompt when trial is ending soon
 * - Shows expired modal when trial has ended
 */

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import TrialWelcomeModal from './TrialWelcomeModal';
import TrialExpiredModal from './TrialExpiredModal';
import TrialEndingPrompt from './TrialEndingPrompt';
import PaymentFailedBanner from './PaymentFailedBanner';
import { useUserPlan } from '@/hooks/useUserPlan';

interface DashboardTrialHandlerProps {
  children: React.ReactNode;
}

export default function DashboardTrialHandler({ children }: DashboardTrialHandlerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { 
    isPro, 
    isTrialing, 
    trialDaysRemaining, 
    trialEnd, 
    status, 
    isLoading, 
    hasPaymentMethod,
    hasPaymentIssue,
    gracePeriodDaysRemaining,
  } = useUserPlan();
  
  const [showWelcome, setShowWelcome] = useState(false);
  const [showExpired, setShowExpired] = useState(false);
  const [hasShownExpired, setHasShownExpired] = useState(false);

  // Check for successful checkout (session_id in URL)
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (sessionId) {
      // Show welcome modal after a short delay
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 500);
      
      // Clear the URL parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('session_id');
      router.replace(newUrl.pathname, { scroll: false });
      
      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  // Check if trial has expired (was trialing, now on free)
  useEffect(() => {
    if (isLoading) return;
    
    // Check localStorage to see if we've already shown expired modal this session
    const expiredShown = sessionStorage.getItem('trial_expired_shown');
    
    if (!isPro && !isTrialing && status === 'none' && !hasShownExpired && !expiredShown) {
      // Check if user was previously on trial
      const wasTrialing = localStorage.getItem('was_trialing');
      
      if (wasTrialing === 'true') {
        setShowExpired(true);
        setHasShownExpired(true);
        sessionStorage.setItem('trial_expired_shown', 'true');
        localStorage.removeItem('was_trialing');
      }
    }
    
    // Track if currently trialing
    if (isTrialing) {
      localStorage.setItem('was_trialing', 'true');
    }
  }, [isPro, isTrialing, status, isLoading, hasShownExpired]);

  const handleWelcomeClose = () => {
    setShowWelcome(false);
  };

  const handleExpiredClose = () => {
    setShowExpired(false);
  };

  // Don't render prompts while loading
  const shouldShowEndingPrompt = !isLoading && isTrialing && trialDaysRemaining <= 2;
  const shouldShowPaymentBanner = !isLoading && hasPaymentIssue && gracePeriodDaysRemaining !== null;

  // Handle opening billing portal for payment update
  const handleUpdatePayment = async () => {
    try {
      const response = await fetch('/api/billing-portal', { method: 'POST' });
      const data = await response.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Error opening billing portal:', err);
    }
  };

  return (
    <>
      {/* Payment failed banner - highest priority */}
      {shouldShowPaymentBanner && (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-6">
          <PaymentFailedBanner
            daysRemaining={gracePeriodDaysRemaining || 0}
            onUpdatePayment={handleUpdatePayment}
          />
        </div>
      )}

      {/* Trial ending prompt - rendered above children when trial is ending */}
      {shouldShowEndingPrompt && !shouldShowPaymentBanner && (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-6">
          <TrialEndingPrompt
            daysRemaining={trialDaysRemaining}
            trialEnd={trialEnd}
            hasPaymentMethod={hasPaymentMethod}
          />
        </div>
      )}
      
      {children}

      {/* Modals */}
      <TrialWelcomeModal
        isOpen={showWelcome}
        onClose={handleWelcomeClose}
        trialDays={7}
      />

      <TrialExpiredModal
        isOpen={showExpired}
        onClose={handleExpiredClose}
      />
    </>
  );
}

