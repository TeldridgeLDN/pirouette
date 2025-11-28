/**
 * Email Module
 * 
 * Re-exports all email functionality for easy imports.
 * 
 * Usage:
 * import { sendWelcomeEmail, sendAnalysisCompleteEmail } from '@/lib/email';
 */

// Client and config
export { sendEmail, sendBatchEmails, EMAIL_CONFIG, resend } from './resend';

// High-level send functions
export {
  sendWelcomeEmail,
  sendAnalysisCompleteEmail,
  sendTrialStartedEmail,
  sendTrialEndingEmail,
  sendSubscriptionConfirmedEmail,
  sendPaymentFailedEmail,
  sendSubscriptionCancelledEmail,
  sendFriendSignedUpEmail,
  sendRewardEarnedEmail,
} from './send';

// Templates (for preview/testing)
export { default as WelcomeEmail } from './templates/WelcomeEmail';
export { default as AnalysisCompleteEmail } from './templates/AnalysisCompleteEmail';
export {
  TrialStartedEmail,
  TrialEndingEmail,
  SubscriptionConfirmedEmail,
  PaymentFailedEmail,
  SubscriptionCancelledEmail,
} from './templates/SubscriptionEmail';
export {
  FriendSignedUpEmail,
  RewardEarnedEmail,
} from './templates/ReferralEmail';

