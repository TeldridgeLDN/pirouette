/**
 * Analytics module exports
 *
 * Re-exports all Plausible tracking utilities for easy importing:
 * import { trackEvent, trackAnalysisSubmitted } from '@/lib/analytics';
 */

export {
  // Core tracking
  trackEvent,
  // Types
  type PlausibleEvent,
  type PlausibleEventProps,
  type AnalysisEventProps,
  type SignupEventProps,
  type UpgradeEventProps,
  type CTAEventProps,
  // Convenience functions
  trackAnalysisSubmitted,
  trackAnalysisCompleted,
  trackSignupStarted,
  trackSignupCompleted,
  trackTrialStarted,
  trackUpgradeClicked,
  trackSubscriptionCreated,
  trackReportSaved,
  trackReportViewed,
  trackRecommendationClicked,
  trackPDFDownloaded,
  trackShareClicked,
  trackDashboardVisited,
  trackPricingViewed,
  trackPlanCompared,
  trackCTA,
  trackOutboundClick,
  trackScrollDepth,
  // Scroll tracking setup
  setupScrollTracking,
} from './plausible';

