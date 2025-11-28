/**
 * Referral Reward API
 * 
 * POST /api/referrals/reward - Apply referral reward (called by webhook when referee upgrades)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

// Maximum free months a user can earn per year
const MAX_REWARDS_PER_YEAR = 12;

// Type definitions for Supabase queries
interface RefereeRow {
  id: string;
  referred_by: string | null;
  stripe_customer_id: string | null;
}

interface ReferrerRow {
  id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  referral_rewards_earned: number | null;
}

interface ReferralRow {
  id: string;
  status: string;
  reward_applied: boolean;
}

// ============================================================================
// POST - Process referral reward
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Verify this is from our webhook or internal call
    const authHeader = request.headers.get('authorization');
    const internalKey = process.env.INTERNAL_API_KEY;
    
    if (authHeader !== `Bearer ${internalKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { refereeUserId } = await request.json();
    
    if (!refereeUserId) {
      return NextResponse.json({ error: 'Missing refereeUserId' }, { status: 400 });
    }
    
    const supabase = supabaseAdmin;
    
    // Get the referee and their referrer
    const { data: refereeData, error: refereeError } = await supabase
      .from('users')
      .select('id, referred_by, stripe_customer_id')
      .eq('id', refereeUserId)
      .single();
    
    const referee = refereeData as RefereeRow | null;
    
    if (refereeError || !referee || !referee.referred_by) {
      return NextResponse.json({ 
        success: false, 
        message: 'No referrer found for this user' 
      });
    }
    
    // Get the referrer
    const { data: referrerData, error: referrerError } = await supabase
      .from('users')
      .select('id, stripe_customer_id, stripe_subscription_id, referral_rewards_earned')
      .eq('id', referee.referred_by)
      .single();
    
    const referrer = referrerData as ReferrerRow | null;
    
    if (referrerError || !referrer) {
      return NextResponse.json({ 
        success: false, 
        message: 'Referrer not found' 
      });
    }
    
    // Check reward cap
    if ((referrer.referral_rewards_earned || 0) >= MAX_REWARDS_PER_YEAR) {
      return NextResponse.json({ 
        success: false, 
        message: 'Referrer has reached maximum rewards for the year' 
      });
    }
    
    // Find the referral record
    const { data: referralData, error: referralError } = await supabase
      .from('referrals')
      .select('id, status, reward_applied')
      .eq('referrer_id', referrer.id)
      .eq('referee_id', referee.id)
      .single();
    
    const referral = referralData as ReferralRow | null;
    
    if (referralError || !referral) {
      return NextResponse.json({ 
        success: false, 
        message: 'Referral record not found' 
      });
    }
    
    // Check if reward already applied
    if (referral.reward_applied) {
      return NextResponse.json({ 
        success: false, 
        message: 'Reward already applied' 
      });
    }
    
    // Apply reward to referrer's Stripe subscription
    let rewardApplied = false;
    
    if (referrer.stripe_subscription_id) {
      try {
        // Get the subscription to find the current price
        const subscription = await stripe.subscriptions.retrieve(referrer.stripe_subscription_id);
        
        if (subscription.status === 'active') {
          // Create a 100% off coupon for 1 month
          const coupon = await stripe.coupons.create({
            percent_off: 100,
            duration: 'once',
            name: 'Referral Reward - 1 Free Month',
            metadata: {
              referral_id: referral.id,
              referrer_id: referrer.id,
              referee_id: referee.id,
            },
          });
          
          // Apply coupon to the subscription
          await stripe.subscriptions.update(referrer.stripe_subscription_id, {
            coupon: coupon.id,
          });
          
          rewardApplied = true;
        }
      } catch (stripeError) {
        console.error('Stripe error applying reward:', stripeError);
        // Continue - we'll still track the reward in our system
      }
    }
    
    // Update referral status
    await supabase
      .from('referrals')
      .update({
        status: 'rewarded',
        reward_applied: rewardApplied,
        upgraded_at: new Date().toISOString(),
        rewarded_at: new Date().toISOString(),
      })
      .eq('id', referral.id);
    
    // Increment referrer's reward count
    await supabase
      .from('users')
      .update({
        referral_rewards_earned: (referrer.referral_rewards_earned || 0) + 1,
      })
      .eq('id', referrer.id);
    
    // TODO: Send email notification to referrer
    // await sendReferralRewardEmail(referrer.email, refereeName);
    
    return NextResponse.json({
      success: true,
      message: 'Referral reward processed',
      rewardApplied,
    });
    
  } catch (error) {
    console.error('Error processing referral reward:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

