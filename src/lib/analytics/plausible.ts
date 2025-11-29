/**
 * Plausible Analytics Tracking Utilities for Pirouette
 *
 * Privacy-friendly analytics. No cookies, GDPR compliant.
 * Adapted from portfolio-redesign skill.
 *
 * @see https://plausible.io/docs/custom-event-goals
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Type-safe event names for Plausible tracking
 */
export type PlausibleEvent =
  // Conversion Events (Primary KPIs)
  | 'Analysis_Submitted' // User submits URL for analysis
  | 'Analysis_Completed' // Analysis results displayed
  | 'Signup_Started' // User clicks sign-up CTA
  | 'Signup_Completed' // User completes registration
  | 'Trial_Started' // User begins Pro trial
  | 'Upgrade_Clicked' // User clicks upgrade CTA
  | 'Subscription_Created' // User converts to paid
  | 'Report_Saved' // Anonymous user saves report
  // Engagement Events
  | 'Report_Viewed' // User views analysis report
  | 'Recommendation_Clicked' // User expands recommendation
  | 'PDF_Downloaded' // User downloads PDF report
  | 'Share_Clicked' // User shares report
  | 'Dashboard_Visited' // User visits dashboard
  | 'Pricing_Viewed' // User views pricing page
  | 'Plan_Compared' // User views plan details
  // Scroll Depth Events
  | 'Scroll_Depth_50' // User scrolls 50% of page
  | 'Scroll_Depth_75' // User scrolls 75% of page
  | 'Scroll_Depth_100' // User reaches bottom of page
  // Navigation Events
  | 'Outbound_Click' // User clicks external link
  | 'CTA_Click'; // User clicks any CTA button

/**
 * Properties that can be attached to Plausible events
 */
export interface PlausibleEventProps {
  /**
   * Revenue value for ecommerce tracking (in GBP)
   */
  revenue?: number;

  /**
   * Custom properties for event segmentation
   */
  props?: Record<string, string | number | boolean>;
}

/**
 * Common event property types for type safety
 */
export interface AnalysisEventProps {
  source: 'hero' | 'dashboard' | 'report';
  url?: string;
  score?: number;
}

export interface SignupEventProps {
  source: string;
  plan?: 'free' | 'pro' | 'agency';
  method?: 'email' | 'google';
}

export interface UpgradeEventProps {
  source: string;
  plan: 'pro' | 'agency';
  trigger?: 'limit_reached' | 'feature_gate' | 'pricing_page' | 'trial_end';
}

export interface CTAEventProps {
  variant: 'primary' | 'secondary';
  label: string;
  location?: string;
}

// ============================================================================
// CORE TRACKING FUNCTION
// ============================================================================

/**
 * Track a custom event with Plausible Analytics
 *
 * @param eventName - The name of the event to track
 * @param eventProps - Optional event properties for segmentation
 *
 * @example
 * ```ts
 * // Track a simple event
 * trackEvent('Analysis_Submitted');
 *
 * // Track with properties
 * trackEvent('Analysis_Submitted', { props: { source: 'hero' } });
 *
 * // Track with revenue
 * trackEvent('Subscription_Created', { revenue: 29, props: { plan: 'pro' } });
 * ```
 */
export function trackEvent(
  eventName: PlausibleEvent,
  eventProps?: PlausibleEventProps
): void {
  // Check if window and plausible are available (client-side only)
  if (typeof window === 'undefined' || !window.plausible) {
    // In development, log to console for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[Plausible Dev]', eventName, eventProps);
    }
    return;
  }

  try {
    // Build the options object for Plausible
    const options: { props?: Record<string, string | number | boolean>; revenue?: { amount: number; currency: string } } = {};

    if (eventProps?.props && Object.keys(eventProps.props).length > 0) {
      options.props = eventProps.props;
    }

    if (eventProps?.revenue) {
      options.revenue = { amount: eventProps.revenue, currency: 'GBP' };
    }

    // Track the event with Plausible
    if (Object.keys(options).length > 0) {
      window.plausible(eventName, options);
    } else {
      window.plausible(eventName);
    }
  } catch (error) {
    // Fail silently in production, log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Plausible Error]', error);
    }
  }
}

// ============================================================================
// CONVENIENCE TRACKING FUNCTIONS
// ============================================================================

/**
 * Track analysis form submissions
 */
export function trackAnalysisSubmitted(
  source: 'hero' | 'dashboard' | 'report'
): void {
  trackEvent('Analysis_Submitted', { props: { source } });
}

/**
 * Track analysis completion with score
 */
export function trackAnalysisCompleted(score: number, url?: string): void {
  const props: Record<string, string | number> = { score };
  if (url) {
    // Only include domain for privacy
    try {
      props.domain = new URL(url).hostname;
    } catch {
      // Invalid URL, skip domain
    }
  }
  trackEvent('Analysis_Completed', { props });
}

/**
 * Track signup intent
 */
export function trackSignupStarted(
  source: string,
  plan?: 'free' | 'pro' | 'agency'
): void {
  const props: Record<string, string> = { source };
  if (plan) props.plan = plan;
  trackEvent('Signup_Started', { props });
}

/**
 * Track signup completion
 */
export function trackSignupCompleted(method: 'email' | 'google'): void {
  trackEvent('Signup_Completed', { props: { method } });
}

/**
 * Track trial start
 */
export function trackTrialStarted(source: string): void {
  trackEvent('Trial_Started', { props: { source } });
}

/**
 * Track upgrade CTA clicks
 */
export function trackUpgradeClicked(
  source: string,
  plan: 'pro' | 'agency',
  trigger?: string
): void {
  const props: Record<string, string> = { source, plan };
  if (trigger) props.trigger = trigger;
  trackEvent('Upgrade_Clicked', { props });
}

/**
 * Track subscription creation with revenue
 */
export function trackSubscriptionCreated(
  plan: 'pro' | 'agency',
  revenue: number,
  interval: 'monthly' | 'annual'
): void {
  trackEvent('Subscription_Created', {
    revenue,
    props: { plan, interval },
  });
}

/**
 * Track report saves (anonymous users)
 */
export function trackReportSaved(method: 'email' | 'signup'): void {
  trackEvent('Report_Saved', { props: { method } });
}

/**
 * Track report views
 */
export function trackReportViewed(isOwner: boolean): void {
  trackEvent('Report_Viewed', { props: { is_owner: isOwner } });
}

/**
 * Track recommendation expansion
 */
export function trackRecommendationClicked(
  type: string,
  priority: string
): void {
  trackEvent('Recommendation_Clicked', { props: { type, priority } });
}

/**
 * Track PDF downloads
 */
export function trackPDFDownloaded(): void {
  trackEvent('PDF_Downloaded');
}

/**
 * Track share button clicks
 */
export function trackShareClicked(method: string): void {
  trackEvent('Share_Clicked', { props: { method } });
}

/**
 * Track dashboard visits
 */
export function trackDashboardVisited(analysisCount: number): void {
  trackEvent('Dashboard_Visited', { props: { analysis_count: analysisCount } });
}

/**
 * Track pricing page views
 */
export function trackPricingViewed(source?: string): void {
  const props: Record<string, string> = {};
  if (source) props.source = source;
  trackEvent('Pricing_Viewed', Object.keys(props).length > 0 ? { props } : undefined);
}

/**
 * Track plan comparison views
 */
export function trackPlanCompared(plan: string): void {
  trackEvent('Plan_Compared', { props: { plan } });
}

/**
 * Track CTA button clicks
 */
export function trackCTA(
  variant: 'primary' | 'secondary',
  label: string,
  location?: string
): void {
  const props: Record<string, string> = { variant, label };
  if (location) props.location = location;
  trackEvent('CTA_Click', { props });
}

/**
 * Track outbound link clicks
 */
export function trackOutboundClick(url: string, label?: string): void {
  const props: Record<string, string> = { url };
  if (label) props.label = label;
  trackEvent('Outbound_Click', { props });
}

/**
 * Track scroll depth milestones
 */
export function trackScrollDepth(percentage: 50 | 75 | 100): void {
  const eventName = `Scroll_Depth_${percentage}` as PlausibleEvent;
  trackEvent(eventName);
}

// ============================================================================
// SCROLL TRACKING SETUP
// ============================================================================

/**
 * Set up automatic scroll depth tracking
 * Call this once when the page loads (client-side only)
 */
export function setupScrollTracking(): (() => void) | undefined {
  if (typeof window === 'undefined') return;

  const milestones = new Set<number>();

  const checkScroll = () => {
    const scrollPercentage =
      ((window.scrollY + window.innerHeight) /
        document.documentElement.scrollHeight) *
      100;

    if (scrollPercentage >= 50 && !milestones.has(50)) {
      milestones.add(50);
      trackScrollDepth(50);
    }
    if (scrollPercentage >= 75 && !milestones.has(75)) {
      milestones.add(75);
      trackScrollDepth(75);
    }
    if (scrollPercentage >= 99 && !milestones.has(100)) {
      milestones.add(100);
      trackScrollDepth(100);
    }
  };

  // Debounce scroll events
  let scrollTimeout: NodeJS.Timeout;
  const handleScroll = () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(checkScroll, 100);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', handleScroll);
    clearTimeout(scrollTimeout);
  };
}

// ============================================================================
// GLOBAL TYPE DECLARATION
// ============================================================================

declare global {
  interface Window {
    plausible?: (
      eventName: string,
      options?: {
        props?: Record<string, string | number | boolean>;
        revenue?: { amount: number; currency: string };
      }
    ) => void;
  }
}

