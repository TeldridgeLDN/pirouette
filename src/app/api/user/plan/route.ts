/**
 * User Plan API
 * 
 * GET /api/user/plan
 * 
 * Returns the current user's plan information and usage.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// Rate limit configuration per plan
const PLAN_LIMITS: Record<string, number> = {
  free: 1,      // 1 per week
  pro_29: -1,   // Unlimited
  pro_49: -1,   // Unlimited
  agency: -1,   // Unlimited
};

export async function GET(request: NextRequest) {
  try {
    // 1. Require authentication
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // 2. Get user from Supabase
    const supabase = supabaseAdmin;
    
    interface UserRow {
      id: string;
      plan: string;
      analyses_this_month: number;
      stripe_customer_id: string | null;
      stripe_subscription_id: string | null;
    }
    
    const { data: user, error } = await supabase
      .from('users')
      .select('id, plan, analyses_this_month, stripe_customer_id, stripe_subscription_id')
      .eq('clerk_id', clerkUserId)
      .single() as { data: UserRow | null; error: Error | null };
    
    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // 3. Count analyses in the past week
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const { count: weeklyAnalyses } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', oneWeekAgo);
    
    // 4. Get plan limit
    const plan = user.plan || 'free';
    const analysesLimit = PLAN_LIMITS[plan] ?? 1;
    
    // 5. Return plan data
    return NextResponse.json({
      success: true,
      data: {
        plan,
        analysesThisMonth: user.analyses_this_month || 0,
        analysesThisWeek: weeklyAnalyses || 0,
        analysesLimit,
        stripeCustomerId: user.stripe_customer_id,
        hasActiveSubscription: !!user.stripe_subscription_id,
      },
    });
    
  } catch (error) {
    console.error('Error fetching user plan:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

