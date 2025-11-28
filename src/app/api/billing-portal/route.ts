/**
 * Billing Portal API
 * 
 * POST /api/billing-portal
 * 
 * Creates a Stripe Billing Portal session for subscription management.
 * Allows users to:
 * - Update payment method
 * - Change subscription plan
 * - Cancel subscription
 * - View invoices
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createBillingPortalSession } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    // 1. Require authentication
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: 'Please sign in to access billing' },
        { status: 401 }
      );
    }
    
    // 2. Get user from Supabase
    const supabase = supabaseAdmin;
    
    interface UserRow {
      id: string;
      stripe_customer_id: string | null;
      plan: string;
    }
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, stripe_customer_id, plan')
      .eq('clerk_id', clerkUserId)
      .single() as { data: UserRow | null; error: Error | null };
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found. Please try signing out and back in.' },
        { status: 400 }
      );
    }
    
    // 3. Check if user has a Stripe customer ID
    if (!user.stripe_customer_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No subscription found. Subscribe to a plan first.',
          noSubscription: true,
        },
        { status: 400 }
      );
    }
    
    // 4. Create billing portal session
    const result = await createBillingPortalSession(user.stripe_customer_id);
    
    if (!result.success || !result.url) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to create billing portal session' },
        { status: 500 }
      );
    }
    
    // 5. Return portal URL
    return NextResponse.json({
      success: true,
      url: result.url,
    });
    
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

