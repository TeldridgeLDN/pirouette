// @ts-nocheck
/**
 * Rate Limiting Utilities
 * 
 * Implements rate limiting based on user subscription plan.
 * Free users: 1 analysis per week
 * Pro users: Unlimited analyses
 * 
 * NOTE: TypeScript checking disabled due to Supabase type generation issues.
 */

import { supabaseAdmin } from '@/lib/supabase/server';

// ============================================================================
// Types
// ============================================================================

export type UserPlan = 'free' | 'pro_29' | 'pro_49' | 'agency';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt?: Date;
  message?: string;
}

export interface UserPlanInfo {
  plan: UserPlan;
  isProUser: boolean;
  analysesThisMonth: number;
}

// ============================================================================
// Plan Configuration
// ============================================================================

const RATE_LIMITS: Record<UserPlan, number> = {
  free: 1, // 1 per week
  pro_29: -1, // Unlimited
  pro_49: -1, // Unlimited
  agency: -1, // Unlimited
};

const RATE_LIMIT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds

// ============================================================================
// Rate Limiting Functions
// ============================================================================

/**
 * Gets user plan information from Supabase
 */
export async function getUserPlanInfo(userId: string): Promise<UserPlanInfo | null> {
  try {
    const supabase = supabaseAdmin;
    
    const { data: user, error } = await supabase
      .from('users')
      .select('plan, analyses_this_month')
      .eq('clerk_id', userId)
      .single();
    
    if (error || !user) {
      console.error('Error fetching user plan:', error);
      return null;
    }
    
    const plan = (user.plan as UserPlan) || 'free';
    
    return {
      plan,
      isProUser: plan !== 'free',
      analysesThisMonth: user.analyses_this_month || 0,
    };
  } catch (err) {
    console.error('Exception fetching user plan:', err);
    return null;
  }
}

/**
 * Counts user's analyses in the past week
 */
export async function countRecentAnalyses(userId: string): Promise<number> {
  try {
    const supabase = supabaseAdmin;
    
    const oneWeekAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    
    const { count, error } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', oneWeekAgo);
    
    if (error) {
      console.error('Error counting analyses:', error);
      return 0;
    }
    
    return count || 0;
  } catch (err) {
    console.error('Exception counting analyses:', err);
    return 0;
  }
}

/**
 * Gets the user's Supabase UUID from their Clerk ID
 */
export async function getUserIdFromClerkId(clerkId: string): Promise<string | null> {
  try {
    const supabase = supabaseAdmin;
    
    const { data: user, error } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkId)
      .single();
    
    if (error || !user) {
      console.error('Error fetching user ID:', error);
      return null;
    }
    
    return user.id;
  } catch (err) {
    console.error('Exception fetching user ID:', err);
    return null;
  }
}

/**
 * Checks if a user is allowed to submit a new analysis
 */
export async function checkRateLimit(clerkUserId: string): Promise<RateLimitResult> {
  // Get user's Supabase ID
  const supabaseUserId = await getUserIdFromClerkId(clerkUserId);
  
  if (!supabaseUserId) {
    return {
      allowed: false,
      remaining: 0,
      message: 'User not found. Please try signing out and back in.',
    };
  }
  
  // Get user plan
  const planInfo = await getUserPlanInfo(clerkUserId);
  
  if (!planInfo) {
    // Default to free tier if we can't get plan info
    const recentCount = await countRecentAnalyses(supabaseUserId);
    const remaining = Math.max(0, 1 - recentCount);
    
    return {
      allowed: remaining > 0,
      remaining,
      resetAt: new Date(Date.now() + RATE_LIMIT_WINDOW_MS),
      message: remaining === 0 
        ? 'You\'ve used your free analysis this week. Upgrade to Pro for unlimited analyses.'
        : undefined,
    };
  }
  
  // Pro users have unlimited analyses
  if (planInfo.isProUser) {
    return {
      allowed: true,
      remaining: -1, // Unlimited
    };
  }
  
  // Check free tier limit
  const limit = RATE_LIMITS[planInfo.plan];
  const recentCount = await countRecentAnalyses(supabaseUserId);
  const remaining = Math.max(0, limit - recentCount);
  
  // Calculate reset time (find oldest analysis and add 1 week)
  let resetAt: Date | undefined;
  if (remaining === 0) {
    const supabase = supabaseAdmin;
    const oneWeekAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    
    const { data: oldestJob } = await supabase
      .from('jobs')
      .select('created_at')
      .eq('user_id', supabaseUserId)
      .gte('created_at', oneWeekAgo)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();
    
    if (oldestJob) {
      resetAt = new Date(new Date(oldestJob.created_at).getTime() + RATE_LIMIT_WINDOW_MS);
    }
  }
  
  return {
    allowed: remaining > 0,
    remaining,
    resetAt,
    message: remaining === 0 
      ? `You've used your free analysis this week. ${resetAt ? `Try again ${formatResetTime(resetAt)}.` : ''} Upgrade to Pro for unlimited analyses.`
      : undefined,
  };
}

/**
 * Formats reset time for display
 */
function formatResetTime(resetAt: Date): string {
  const now = new Date();
  const diffMs = resetAt.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  
  if (diffDays <= 0) {
    return 'soon';
  } else if (diffDays === 1) {
    return 'tomorrow';
  } else {
    return `in ${diffDays} days`;
  }
}

// ============================================================================
// Exports
// ============================================================================

export default {
  getUserPlanInfo,
  countRecentAnalyses,
  getUserIdFromClerkId,
  checkRateLimit,
};

