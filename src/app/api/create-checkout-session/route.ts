/**
 * Create Checkout Session API
 * 
 * POST /api/create-checkout-session
 * 
 * Creates a Stripe Checkout session for subscription purchase.
 * 
 * Request Body:
 * - plan: string - The plan to subscribe to ('pro_29' or 'pro')
 * - billingCycle: 'monthly' | 'annual' - Billing frequency
 * - priceId: string (optional) - Direct price ID override
 * - includeTrial: boolean (optional) - Whether to include trial period
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createCheckoutSession, getOrCreateCustomer, getPriceIdForPlan, getValidPriceIds, BillingCycle } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    // 1. Require authentication
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: 'Please sign in to subscribe' },
        { status: 401 }
      );
    }
    
    // 2. Parse request body
    const body = await request.json().catch(() => ({}));
    const { plan, billingCycle = 'monthly', priceId: directPriceId, includeTrial = true } = body;
    
    // 3. Determine price ID from plan + billingCycle, or use direct priceId
    let priceId = directPriceId;
    
    if (!priceId && plan) {
      // Map old plan names to new ones
      const mappedPlan = plan === 'pro_29' ? 'pro' : plan;
      priceId = getPriceIdForPlan(mappedPlan, billingCycle as BillingCycle);
    }
    
    // 4. Validate price ID
    const validPriceIds = getValidPriceIds();
    
    if (!priceId || !validPriceIds.includes(priceId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid price selected' },
        { status: 400 }
      );
    }
    
    // 4. Get user from Supabase
    const supabase = supabaseAdmin;
    
    interface UserRow {
      id: string;
      email: string;
      name: string | null;
      stripe_customer_id: string | null;
      plan: string;
    }
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name, stripe_customer_id, plan')
      .eq('clerk_id', clerkUserId)
      .single() as { data: UserRow | null; error: Error | null };
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found. Please try signing out and back in.' },
        { status: 400 }
      );
    }
    
    // 5. Check if user already has a paid plan
    if (user.plan !== 'free') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'You already have a paid subscription. Use the billing portal to change plans.',
          redirectToBilling: true,
        },
        { status: 400 }
      );
    }
    
    // 6. Get or create Stripe customer
    let customerId = user.stripe_customer_id;
    
    if (!customerId) {
      const customerResult = await getOrCreateCustomer(
        user.id,
        user.email,
        user.name || undefined
      );
      
      if (!customerResult.customerId) {
        return NextResponse.json(
          { success: false, error: customerResult.error || 'Failed to create customer' },
          { status: 500 }
        );
      }
      
      customerId = customerResult.customerId;
      
      // Save customer ID to user
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId } as never)
        .eq('id', user.id);
    }
    
    // 7. Create checkout session
    const result = await createCheckoutSession({
      userId: user.id,
      userEmail: user.email,
      priceId,
      customerId,
      includeTrial,
    });
    
    if (!result.success || !result.url) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to create checkout session' },
        { status: 500 }
      );
    }
    
    // 8. Return checkout URL
    return NextResponse.json({
      success: true,
      url: result.url,
      sessionId: result.sessionId,
    });
    
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

