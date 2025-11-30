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

// Support both old (pro_29, pro_49) and new (pro) plan names for backwards compatibility
export type Plan = 'free' | 'pro' | 'pro_29' | 'pro_49' | 'agency';

/**
 * Normalizes plan name to canonical form
 * - pro_29 and pro_49 both map to 'pro' for feature checking
 */
export function normalizePlan(plan: string | null | undefined): Plan {
  if (!plan) return 'free';
  const p = plan.toLowerCase();
  // All pro variants map to 'pro' for feature checking
  if (p === 'pro' || p === 'pro_29' || p === 'pro_49') return 'pro';
  if (p === 'agency') return 'agency';
  return 'free';
}

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
 * Note: pro_29 and pro_49 are legacy names, 'pro' is the canonical name
 */
const PRO_FEATURES: Feature[] = [
  'unlimited_analyses',
  'historical_tracking',
  'competitor_comparison',
  'export_pdf',
  'revenue_estimates',
  'roi_recommendations',
  'priority_support',
];

const PLAN_FEATURES: Record<Plan, Feature[]> = {
  free: [],
  pro: PRO_FEATURES,
  pro_29: PRO_FEATURES, // Legacy - maps to pro
  pro_49: PRO_FEATURES, // Legacy - maps to pro
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
    minPlan: 'pro',
  },
  historical_tracking: {
    id: 'historical_tracking',
    name: 'Historical Tracking',
    description: 'Track your scores over time and see improvement trends.',
    icon: '📈',
    minPlan: 'pro',
  },
  competitor_comparison: {
    id: 'competitor_comparison',
    name: 'Competitor Comparison',
    description: 'Compare your page against up to 3 competitor landing pages.',
    icon: '🆚',
    minPlan: 'pro',
  },
  export_pdf: {
    id: 'export_pdf',
    name: 'Export as PDF',
    description: 'Download your analysis report as a professional PDF.',
    icon: '📄',
    minPlan: 'pro',
  },
  revenue_estimates: {
    id: 'revenue_estimates',
    name: 'Revenue Estimates',
    description: 'See estimated revenue impact of each recommendation.',
    icon: '💰',
    minPlan: 'pro',
  },
  roi_recommendations: {
    id: 'roi_recommendations',
    name: 'ROI-Prioritised Recommendations',
    description: 'Recommendations sorted by potential return on investment.',
    icon: '🎯',
    minPlan: 'pro',
  },
  white_label: {
    id: 'white_label',
    name: 'White-Label Reports',
    description: 'Remove Pirouette branding from exported reports.',
    icon: '🏷️',
    minPlan: 'agency',
  },
  api_access: {
    id: 'api_access',
    name: 'API Access',
    description: 'Integrate Pirouette analysis into your own tools.',
    icon: '🔗',
    minPlan: 'agency',
  },
  priority_support: {
    id: 'priority_support',
    name: 'Priority Support',
    description: 'Get faster responses from our support team.',
    icon: '💬',
    minPlan: 'pro',
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
  pro: { name: 'Pro', price: '£29/mo', badge: 'PRO' },
  pro_29: { name: 'Pro', price: '£29/mo', badge: 'PRO' }, // Legacy
  pro_49: { name: 'Pro', price: '£29/mo', badge: 'PRO' }, // Legacy
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
  const order: Plan[] = ['free', 'pro', 'pro_29', 'pro_49', 'agency'];
  const normalizedA = normalizePlan(a);
  const normalizedB = normalizePlan(b);
  return order.indexOf(normalizedA) - order.indexOf(normalizedB);
}

/**
 * Gets the upgrade path for a user's current plan
 */
export function getUpgradePath(currentPlan: Plan): Plan | null {
  const normalized = normalizePlan(currentPlan);
  switch (normalized) {
    case 'free':
      return 'pro';
    case 'pro':
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

