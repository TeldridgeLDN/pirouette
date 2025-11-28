/**
 * Feature Gating System
 * 
 * Controls access to Pro-only features based on user subscription plan.
 * 
 * Features:
 * - Feature flags per plan
 * - Type-safe feature checking
 * - Plan comparison utilities
 */

// ============================================================================
// Types
// ============================================================================

export type Plan = 'free' | 'pro_29' | 'pro_49' | 'agency';

export type Feature =
  | 'unlimited_analyses'
  | 'historical_tracking'
  | 'competitor_comparison'
  | 'export_pdf'
  | 'revenue_estimates'
  | 'roi_recommendations'
  | 'white_label'
  | 'api_access'
  | 'priority_support'
  | 'dedicated_support'
  | 'team_members';

export interface FeatureInfo {
  id: Feature;
  name: string;
  description: string;
  icon: string;
  minPlan: Plan;
}

// ============================================================================
// Configuration
// ============================================================================

/**
 * Features available for each plan
 */
const PLAN_FEATURES: Record<Plan, Feature[]> = {
  free: [],
  pro_29: [
    'unlimited_analyses',
    'historical_tracking',
    'competitor_comparison',
    'export_pdf',
    'revenue_estimates',
    'roi_recommendations',
    'priority_support',
  ],
  pro_49: [
    'unlimited_analyses',
    'historical_tracking',
    'competitor_comparison',
    'export_pdf',
    'revenue_estimates',
    'roi_recommendations',
    'white_label',
    'api_access',
    'priority_support',
  ],
  agency: [
    'unlimited_analyses',
    'historical_tracking',
    'competitor_comparison',
    'export_pdf',
    'revenue_estimates',
    'roi_recommendations',
    'white_label',
    'api_access',
    'team_members',
    'dedicated_support',
  ],
};

/**
 * Feature metadata for UI display
 */
export const FEATURE_INFO: Record<Feature, FeatureInfo> = {
  unlimited_analyses: {
    id: 'unlimited_analyses',
    name: 'Unlimited Analyses',
    description: 'Run as many analyses as you need, no weekly limits.',
    icon: '⚡',
    minPlan: 'pro_29',
  },
  historical_tracking: {
    id: 'historical_tracking',
    name: 'Historical Tracking',
    description: 'Track your scores over time and see improvement trends.',
    icon: '📈',
    minPlan: 'pro_29',
  },
  competitor_comparison: {
    id: 'competitor_comparison',
    name: 'Competitor Comparison',
    description: 'Compare your page against up to 3 competitor landing pages.',
    icon: '🆚',
    minPlan: 'pro_29',
  },
  export_pdf: {
    id: 'export_pdf',
    name: 'Export as PDF',
    description: 'Download your analysis report as a professional PDF.',
    icon: '📄',
    minPlan: 'pro_29',
  },
  revenue_estimates: {
    id: 'revenue_estimates',
    name: 'Revenue Estimates',
    description: 'See estimated revenue impact of each recommendation.',
    icon: '💰',
    minPlan: 'pro_29',
  },
  roi_recommendations: {
    id: 'roi_recommendations',
    name: 'ROI-Prioritised Recommendations',
    description: 'Recommendations sorted by potential return on investment.',
    icon: '🎯',
    minPlan: 'pro_29',
  },
  white_label: {
    id: 'white_label',
    name: 'White-Label Reports',
    description: 'Remove Pirouette branding from exported reports.',
    icon: '🏷️',
    minPlan: 'pro_49',
  },
  api_access: {
    id: 'api_access',
    name: 'API Access',
    description: 'Integrate Pirouette analysis into your own tools.',
    icon: '🔗',
    minPlan: 'pro_49',
  },
  priority_support: {
    id: 'priority_support',
    name: 'Priority Support',
    description: 'Get faster responses from our support team.',
    icon: '💬',
    minPlan: 'pro_29',
  },
  dedicated_support: {
    id: 'dedicated_support',
    name: 'Dedicated Support',
    description: 'Direct line to a dedicated account manager.',
    icon: '🤝',
    minPlan: 'agency',
  },
  team_members: {
    id: 'team_members',
    name: 'Team Members',
    description: 'Invite unlimited team members to your account.',
    icon: '👥',
    minPlan: 'agency',
  },
};

/**
 * Plan display information
 */
export const PLAN_INFO: Record<Plan, { name: string; price: string; badge: string }> = {
  free: { name: 'Free', price: '£0', badge: '' },
  pro_29: { name: 'Pro', price: '£29/mo', badge: 'PRO' },
  pro_49: { name: 'Pro Plus', price: '£49/mo', badge: 'PRO+' },
  agency: { name: 'Agency', price: '£99/mo', badge: 'AGENCY' },
};

// ============================================================================
// Feature Check Functions
// ============================================================================

/**
 * Checks if a plan has access to a specific feature
 */
export function hasFeature(plan: Plan, feature: Feature): boolean {
  return PLAN_FEATURES[plan]?.includes(feature) ?? false;
}

/**
 * Gets all features available for a plan
 */
export function getAvailableFeatures(plan: Plan): Feature[] {
  return PLAN_FEATURES[plan] || [];
}

/**
 * Gets all features NOT available for a plan (locked features)
 */
export function getLockedFeatures(plan: Plan): Feature[] {
  const available = new Set(getAvailableFeatures(plan));
  return (Object.keys(FEATURE_INFO) as Feature[]).filter(f => !available.has(f));
}

/**
 * Checks if a plan is a Pro plan (any paid plan)
 */
export function isProPlan(plan: Plan): boolean {
  return plan !== 'free';
}

/**
 * Gets the minimum plan required for a feature
 */
export function getMinPlanForFeature(feature: Feature): Plan {
  return FEATURE_INFO[feature]?.minPlan || 'agency';
}

/**
 * Compares two plans and returns which is higher tier
 * Returns: -1 if a < b, 0 if equal, 1 if a > b
 */
export function comparePlans(a: Plan, b: Plan): number {
  const order: Plan[] = ['free', 'pro_29', 'pro_49', 'agency'];
  return order.indexOf(a) - order.indexOf(b);
}

/**
 * Gets the upgrade path for a user's current plan
 */
export function getUpgradePath(currentPlan: Plan): Plan | null {
  switch (currentPlan) {
    case 'free':
      return 'pro_29';
    case 'pro_29':
      return 'pro_49';
    case 'pro_49':
      return 'agency';
    default:
      return null;
  }
}

// ============================================================================
// UI Helper Functions
// ============================================================================

/**
 * Gets feature info for display
 */
export function getFeatureInfo(feature: Feature): FeatureInfo {
  return FEATURE_INFO[feature];
}

/**
 * Gets plan info for display
 */
export function getPlanInfo(plan: Plan) {
  return PLAN_INFO[plan];
}

/**
 * Checks if a feature should show an upgrade prompt
 */
export function shouldShowUpgradePrompt(plan: Plan, feature: Feature): boolean {
  return !hasFeature(plan, feature);
}

/**
 * Gets features that would be unlocked by upgrading
 */
export function getFeaturesUnlockedByUpgrade(currentPlan: Plan, targetPlan: Plan): Feature[] {
  const currentFeatures = new Set(getAvailableFeatures(currentPlan));
  const targetFeatures = getAvailableFeatures(targetPlan);
  return targetFeatures.filter(f => !currentFeatures.has(f));
}

