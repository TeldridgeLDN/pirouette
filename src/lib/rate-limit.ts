// @ts-nocheck
/**
 * Rate Limiting Utilities
 * 
 * Implements rate limiting based on user authentication and subscription plan.
 * 
 * Rate Limits:
 * - Anonymous (no account): 1 analysis per IP per day
 * - Free account: 3 analyses per week
 * - Pro users: Unlimited analyses
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
  /** For anonymous users, indicates they should sign up for more */
  suggestSignup?: boolean;
}

export interface UserPlanInfo {
  plan: UserPlan;
  isProUser: boolean;
  analysesThisMonth: number;
}

export interface AnonymousRateLimitResult extends RateLimitResult {
  /** IP address that was checked */
  ip: string;
}

// ============================================================================
// Configuration
// ============================================================================

const RATE_LIMITS: Record<UserPlan, number> = {
  free: 3, // 3 per week (upgrade from anonymous 1/day)
  pro_29: -1, // Unlimited
  pro_49: -1, // Unlimited
  agency: -1, // Unlimited
};

/** Anonymous users: 1 analysis per day per IP */
const ANONYMOUS_RATE_LIMIT = 1;

/** Rate limit window for registered free users: 1 week */
const RATE_LIMIT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds

/** Rate limit window for anonymous users: 1 day */
const ANONYMOUS_RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 1 day in milliseconds

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
        ? 'You\'ve used your 3 free analyses this week. Upgrade to Pro for unlimited analyses.'
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
      ? `You've used your 3 free analyses this week. ${resetAt ? `Try again ${formatResetTime(resetAt)}.` : ''} Upgrade to Pro for unlimited analyses.`
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

/**
 * Formats hours for display
 */
function formatResetTimeHours(resetAt: Date): string {
  const now = new Date();
  const diffMs = resetAt.getTime() - now.getTime();
  const diffHours = Math.ceil(diffMs / (60 * 60 * 1000));
  
  if (diffHours <= 0) {
    return 'soon';
  } else if (diffHours === 1) {
    return 'in 1 hour';
  } else if (diffHours < 24) {
    return `in ${diffHours} hours`;
  } else {
    return 'tomorrow';
  }
}

// ============================================================================
// Anonymous Rate Limiting Functions
// ============================================================================

/**
 * Extracts client IP address from request headers.
 * Handles Vercel's x-forwarded-for header format.
 */
export function getClientIp(headers: Headers): string {
  // Vercel and most proxies use x-forwarded-for
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs: "client, proxy1, proxy2"
    // The first one is the original client
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    return ips[0] || 'unknown';
  }
  
  // Fallback headers
  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  // Cloudflare
  const cfIp = headers.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp;
  }
  
  return 'unknown';
}

/**
 * Counts anonymous analyses from an IP in the past 24 hours
 */
export async function countAnonymousAnalyses(ip: string): Promise<number> {
  try {
    const supabase = supabaseAdmin;
    
    const oneDayAgo = new Date(Date.now() - ANONYMOUS_RATE_LIMIT_WINDOW_MS).toISOString();
    
    const { count, error } = await supabase
      .from('anonymous_analyses')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('created_at', oneDayAgo);
    
    if (error) {
      console.error('Error counting anonymous analyses:', error);
      return 0;
    }
    
    return count || 0;
  } catch (err) {
    console.error('Exception counting anonymous analyses:', err);
    return 0;
  }
}

/**
 * Checks if an anonymous (unauthenticated) user is allowed to submit an analysis.
 * Anonymous users get 1 free analysis per day per IP address.
 */
export async function checkAnonymousRateLimit(ip: string): Promise<AnonymousRateLimitResult> {
  // Don't rate limit unknown IPs (fallback to allowing)
  if (!ip || ip === 'unknown') {
    console.warn('Could not determine client IP for rate limiting');
    return {
      allowed: true,
      remaining: 1,
      ip: 'unknown',
    };
  }
  
  const recentCount = await countAnonymousAnalyses(ip);
  const remaining = Math.max(0, ANONYMOUS_RATE_LIMIT - recentCount);
  
  // Calculate reset time if rate limited
  let resetAt: Date | undefined;
  if (remaining === 0) {
    const supabase = supabaseAdmin;
    const oneDayAgo = new Date(Date.now() - ANONYMOUS_RATE_LIMIT_WINDOW_MS).toISOString();
    
    // Find the oldest analysis in the window to calculate reset
    const { data: oldestAnalysis } = await supabase
      .from('anonymous_analyses')
      .select('created_at')
      .eq('ip_address', ip)
      .gte('created_at', oneDayAgo)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();
    
    if (oldestAnalysis) {
      resetAt = new Date(new Date(oldestAnalysis.created_at).getTime() + ANONYMOUS_RATE_LIMIT_WINDOW_MS);
    } else {
      // Fallback: reset in 24 hours
      resetAt = new Date(Date.now() + ANONYMOUS_RATE_LIMIT_WINDOW_MS);
    }
  }
  
  return {
    allowed: remaining > 0,
    remaining,
    resetAt,
    ip,
    suggestSignup: remaining === 0,
    message: remaining === 0
      ? `You've used your free analysis today. ${resetAt ? `Try again ${formatResetTimeHours(resetAt)}.` : ''} Create a free account for 3 analyses per week!`
      : undefined,
  };
}

/**
 * Records an anonymous analysis for rate limiting purposes.
 * Call this AFTER successfully creating a job for an anonymous user.
 */
export async function recordAnonymousAnalysis(
  ip: string, 
  url: string, 
  jobId: string,
  userAgent?: string
): Promise<boolean> {
  try {
    const supabase = supabaseAdmin;
    
    const { error } = await supabase
      .from('anonymous_analyses')
      .insert({
        ip_address: ip,
        url,
        job_id: jobId,
        user_agent: userAgent,
      });
    
    if (error) {
      console.error('Error recording anonymous analysis:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Exception recording anonymous analysis:', err);
    return false;
  }
}

// ============================================================================
// Exports
// ============================================================================

export default {
  // Authenticated user functions
  getUserPlanInfo,
  countRecentAnalyses,
  getUserIdFromClerkId,
  checkRateLimit,
  // Anonymous user functions
  getClientIp,
  countAnonymousAnalyses,
  checkAnonymousRateLimit,
  recordAnonymousAnalysis,
};

