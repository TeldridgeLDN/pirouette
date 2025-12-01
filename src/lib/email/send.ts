/**
 * Email Send Functions
 * 
 * High-level functions for sending specific email types.
 */

import { sendEmail, EMAIL_CONFIG } from './resend';
import WelcomeEmail from './templates/WelcomeEmail';
import AnalysisCompleteEmail from './templates/AnalysisCompleteEmail';
import { 
  TrialStartedEmail, 
  TrialEndingEmail,
  SubscriptionConfirmedEmail,
  PaymentFailedEmail,
  SubscriptionCancelledEmail,
} from './templates/SubscriptionEmail';
import {
  FriendSignedUpEmail,
  RewardEarnedEmail,
} from './templates/ReferralEmail';

// ============================================================================
// Welcome Email
// ============================================================================

export async function sendWelcomeEmail(params: {
  to: string;
  firstName?: string;
}) {
  return sendEmail({
    to: params.to,
    subject: 'Welcome to Pirouette! 🎉',
    react: WelcomeEmail({
      firstName: params.firstName,
      dashboardUrl: `${EMAIL_CONFIG.appUrl}/dashboard`,
    }),
    tags: [{ name: 'type', value: 'welcome' }],
  });
}

// ============================================================================
// Analysis Complete Email
// ============================================================================

export async function sendAnalysisCompleteEmail(params: {
  to: string;
  firstName?: string;
  url: string;
  overallScore: number;
  reportId: string;
  topRecommendation?: string;
}) {
  return sendEmail({
    to: params.to,
    subject: `Analysis complete - Score: ${params.overallScore}/100`,
    react: AnalysisCompleteEmail({
      firstName: params.firstName,
      url: params.url,
      overallScore: params.overallScore,
      reportUrl: `${EMAIL_CONFIG.appUrl}/report/${params.reportId}`,
      topRecommendation: params.topRecommendation,
    }),
    tags: [{ name: 'type', value: 'analysis_complete' }],
  });
}

// ============================================================================
// Trial Started Email
// ============================================================================

export async function sendTrialStartedEmail(params: {
  to: string;
  firstName?: string;
  trialEndDate: Date;
}) {
  return sendEmail({
    to: params.to,
    subject: 'Your Pirouette Pro trial has started! 🚀',
    react: TrialStartedEmail({
      firstName: params.firstName,
      trialEndDate: params.trialEndDate.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
      dashboardUrl: `${EMAIL_CONFIG.appUrl}/dashboard`,
    }),
    tags: [{ name: 'type', value: 'trial_started' }],
  });
}

// ============================================================================
// Trial Ending Email
// ============================================================================

export async function sendTrialEndingEmail(params: {
  to: string;
  firstName?: string;
  daysRemaining: number;
}) {
  return sendEmail({
    to: params.to,
    subject: `Your Pirouette trial ends in ${params.daysRemaining} days ⏰`,
    react: TrialEndingEmail({
      firstName: params.firstName,
      daysRemaining: params.daysRemaining,
      upgradeUrl: `${EMAIL_CONFIG.appUrl}/pricing`,
    }),
    tags: [{ name: 'type', value: 'trial_ending' }],
  });
}

// ============================================================================
// Subscription Confirmed Email
// ============================================================================

export async function sendSubscriptionConfirmedEmail(params: {
  to: string;
  firstName?: string;
  planName: string;
  amount: string;
  nextBillingDate: Date;
}) {
  return sendEmail({
    to: params.to,
    subject: 'Welcome to Pirouette Pro! 🎉',
    react: SubscriptionConfirmedEmail({
      firstName: params.firstName,
      planName: params.planName,
      amount: params.amount,
      nextBillingDate: params.nextBillingDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      dashboardUrl: `${EMAIL_CONFIG.appUrl}/dashboard`,
    }),
    tags: [{ name: 'type', value: 'subscription_confirmed' }],
  });
}

// ============================================================================
// Payment Failed Email
// ============================================================================

export async function sendPaymentFailedEmail(params: {
  to: string;
  firstName?: string;
  amount: string;
  retryCount?: number; // Retry attempt number for dunning sequence
}) {
  const isFinalWarning = (params.retryCount || 1) >= 3;
  const subject = isFinalWarning
    ? 'Action needed: Your Pro access is at risk ⚠️'
    : 'Quick heads up about your payment';
    
  return sendEmail({
    to: params.to,
    subject,
    react: PaymentFailedEmail({
      firstName: params.firstName,
      amount: params.amount,
      retryCount: params.retryCount,
      updatePaymentUrl: `${EMAIL_CONFIG.appUrl}/dashboard/billing`,
    }),
    tags: [{ name: 'type', value: 'payment_failed' }],
  });
}

// ============================================================================
// Subscription Cancelled Email
// ============================================================================

export async function sendSubscriptionCancelledEmail(params: {
  to: string;
  firstName?: string;
  endDate: Date;
}) {
  return sendEmail({
    to: params.to,
    subject: 'Your Pirouette subscription has been cancelled',
    react: SubscriptionCancelledEmail({
      firstName: params.firstName,
      endDate: params.endDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      reactivateUrl: `${EMAIL_CONFIG.appUrl}/pricing`,
    }),
    tags: [{ name: 'type', value: 'subscription_cancelled' }],
  });
}

// ============================================================================
// Referral: Friend Signed Up Email
// ============================================================================

export async function sendFriendSignedUpEmail(params: {
  to: string;
  firstName?: string;
  friendName: string;
  referralCode?: string;
}) {
  return sendEmail({
    to: params.to,
    subject: `${params.friendName} signed up using your link! 🎉`,
    react: FriendSignedUpEmail({
      firstName: params.firstName,
      friendName: params.friendName,
      referralUrl: `${EMAIL_CONFIG.appUrl}/dashboard`,
      referralCode: params.referralCode,
    }),
    tags: [{ name: 'type', value: 'referral_signup' }],
  });
}

// ============================================================================
// Referral: Reward Earned Email
// ============================================================================

export async function sendRewardEarnedEmail(params: {
  to: string;
  firstName?: string;
  friendName: string;
  totalRewards: number;
  referralCode?: string;
}) {
  return sendEmail({
    to: params.to,
    subject: 'You earned a free month of Pro! 🎁',
    react: RewardEarnedEmail({
      firstName: params.firstName,
      friendName: params.friendName,
      totalRewards: params.totalRewards,
      dashboardUrl: `${EMAIL_CONFIG.appUrl}/dashboard`,
      referralCode: params.referralCode,
    }),
    tags: [{ name: 'type', value: 'referral_reward' }],
  });
}

