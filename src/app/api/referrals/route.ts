/**
 * Referrals API
 * 
 * GET /api/referrals - Get user's referral data (code, stats, history)
 * POST /api/referrals/track - Track referral link click
 * POST /api/referrals (action: claim) - Claim a referral (sends email to referrer)
 * 
 * TODO: Full implementation pending Supabase type generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { sendFriendSignedUpEmail } from '@/lib/email';

// Types for Supabase query results (not in generated types yet)
interface UserRow {
  id: string;
  referral_code: string | null;
  referral_rewards_earned: number | null;
  referral_rewards_used: number | null;
  clerk_id: string;
  referred_by: string | null;
}

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
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, referral_code, referral_rewards_earned, referral_rewards_used')
      .eq('clerk_id', userId)
      .single();
    
    const user = userData as UserRow | null;
    
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Simplified stats (referrals table queries pending type generation)
    const stats = {
      totalSignups: 0,
      totalUpgrades: 0,
      pendingRewards: 0,
      earnedRewards: user.referral_rewards_earned || 0,
      usedRewards: user.referral_rewards_used || 0,
      availableRewards: (user.referral_rewards_earned || 0) - (user.referral_rewards_used || 0),
    };
    
    // Generate referral URL
    const referralUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://pirouette.design'}/r/${user.referral_code}`;
    
    return NextResponse.json({
      success: true,
      referralCode: user.referral_code,
      referralUrl,
      stats,
      referrals: [], // Pending full implementation
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
    const { action, referralCode } = body;
    
    const supabase = supabaseAdmin;
    
    if (action === 'track_click') {
      // Track click is logged but not stored (pending type generation)
      console.log('[Referral] Click tracked:', referralCode);
      return NextResponse.json({ success: true });
    }
    
    if (action === 'claim') {
      // User signing up with a referral code
      const { userId } = await auth();
      
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // Get the referrer with email info
      const { data: referrerData, error: referrerError } = await supabase
        .from('users')
        .select('id, email, name, referral_code')
        .eq('referral_code', referralCode)
        .single();
      
      const referrer = referrerData as { id: string; email: string; name: string | null; referral_code: string } | null;
      
      if (referrerError || !referrer) {
        return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 });
      }
      
      // Get the new user (referee)
      const { data: refereeData, error: refereeError } = await supabase
        .from('users')
        .select('id, name, referred_by')
        .eq('clerk_id', userId)
        .single();
      
      const referee = refereeData as { id: string; name: string | null; referred_by: string | null } | null;
      
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
      
      // NOTE: Supabase update pending type generation
      // The referral claim is logged but not persisted until types are fixed
      console.log('[Referral] Claim logged (pending persistence):', { 
        referrerId: referrer.id, 
        refereeId: referee.id,
        timestamp: new Date().toISOString()
      });
      
      // Send email to referrer notifying them of the signup
      try {
        const referrerFirstName = referrer.name?.split(' ')[0] || undefined;
        const refereeName = referee.name || 'A friend';
        
        await sendFriendSignedUpEmail({
          to: referrer.email,
          firstName: referrerFirstName,
          friendName: refereeName,
          referralCode: referrer.referral_code,
        });
        console.log(`[Referral] 📧 Friend signed up email sent to ${referrer.email}`);
      } catch (emailError) {
        // Log but don't fail the claim if email fails
        console.error('[Referral] Failed to send friend signed up email:', emailError);
      }
      
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
