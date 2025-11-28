/**
 * Referrals API
 * 
 * GET /api/referrals - Get user's referral data (code, stats, history)
 * POST /api/referrals/track - Track referral link click
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// ============================================================================
// GET - Get user's referral data
// ============================================================================

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const supabase = supabaseAdmin;
    
    // Get user's referral code and stats
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, referral_code, referral_rewards_earned, referral_rewards_used')
      .eq('clerk_id', userId)
      .single();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get referral stats
    const { data: referrals, error: referralsError } = await supabase
      .from('referrals')
      .select('id, status, referee_email, created_at, signed_up_at, upgraded_at')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });
    
    if (referralsError) {
      console.error('Error fetching referrals:', referralsError);
    }
    
    // Calculate stats
    const stats = {
      totalSignups: referrals?.filter(r => ['signed_up', 'upgraded', 'rewarded'].includes(r.status)).length || 0,
      totalUpgrades: referrals?.filter(r => ['upgraded', 'rewarded'].includes(r.status)).length || 0,
      pendingRewards: referrals?.filter(r => r.status === 'upgraded').length || 0,
      earnedRewards: user.referral_rewards_earned || 0,
      usedRewards: user.referral_rewards_used || 0,
      availableRewards: (user.referral_rewards_earned || 0) - (user.referral_rewards_used || 0),
    };
    
    // Generate referral URL
    const referralUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://pirouette.app'}/r/${user.referral_code}`;
    
    return NextResponse.json({
      success: true,
      referralCode: user.referral_code,
      referralUrl,
      stats,
      referrals: referrals || [],
    });
    
  } catch (error) {
    console.error('Error in referrals GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// POST - Create/track referral
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, referralCode, email } = body;
    
    const supabase = supabaseAdmin;
    
    if (action === 'track_click') {
      // Track a referral link click (anonymous)
      const { data: referrer } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', referralCode)
        .single();
      
      if (referrer) {
        await supabase.from('referral_clicks').insert({
          referral_code: referralCode,
          referrer_id: referrer.id,
          user_agent: request.headers.get('user-agent') || null,
        });
      }
      
      return NextResponse.json({ success: true });
    }
    
    if (action === 'claim') {
      // User signing up with a referral code
      const { userId } = await auth();
      
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // Get the referrer
      const { data: referrer, error: referrerError } = await supabase
        .from('users')
        .select('id, referral_code')
        .eq('referral_code', referralCode)
        .single();
      
      if (referrerError || !referrer) {
        return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 });
      }
      
      // Get the new user (referee)
      const { data: referee, error: refereeError } = await supabase
        .from('users')
        .select('id, referred_by')
        .eq('clerk_id', userId)
        .single();
      
      if (refereeError || !referee) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      // Check if already referred
      if (referee.referred_by) {
        return NextResponse.json({ error: 'Already referred' }, { status: 400 });
      }
      
      // Can't refer yourself
      if (referrer.id === referee.id) {
        return NextResponse.json({ error: 'Cannot refer yourself' }, { status: 400 });
      }
      
      // Update referee with referrer
      await supabase
        .from('users')
        .update({ referred_by: referrer.id })
        .eq('id', referee.id);
      
      // Create referral record
      await supabase.from('referrals').insert({
        referrer_id: referrer.id,
        referee_id: referee.id,
        referral_code: referralCode,
        status: 'signed_up',
        signed_up_at: new Date().toISOString(),
      });
      
      return NextResponse.json({ 
        success: true,
        message: 'Referral claimed successfully',
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    console.error('Error in referrals POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

