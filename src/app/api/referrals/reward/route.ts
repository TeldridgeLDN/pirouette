/**
 * Referral Reward API
 * 
 * POST /api/referrals/reward - Apply referral reward (called by webhook when referee upgrades)
 * 
 * Sends reward earned email to the referrer when their referred friend upgrades.
 * TODO: Implement full Stripe credit application once Supabase types are generated
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { sendRewardEarnedEmail } from '@/lib/email';

// ============================================================================
// POST - Process referral reward
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Verify this is from our webhook or internal call
    const authHeader = request.headers.get('authorization');
    const internalKey = process.env.INTERNAL_API_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!authHeader || authHeader !== `Bearer ${internalKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { refereeUserId } = await request.json();
    
    if (!refereeUserId) {
      return NextResponse.json({ error: 'Missing refereeUserId' }, { status: 400 });
    }
    
    const supabase = supabaseAdmin;
    
    // Get the referee (the person who upgraded) to find who referred them
    interface RefereeRow {
      id: string;
      name: string | null;
      referred_by: string | null;
    }
    
    const { data: referee, error: refereeError } = await supabase
      .from('users')
      .select('id, name, referred_by')
      .eq('id', refereeUserId)
      .single() as { data: RefereeRow | null; error: Error | null };
    
    if (refereeError || !referee) {
      console.error('[Referral Reward] Referee not found:', refereeUserId);
      return NextResponse.json({ error: 'Referee not found' }, { status: 404 });
    }
    
    if (!referee.referred_by) {
      // User wasn't referred by anyone
      console.log('[Referral Reward] User was not referred:', refereeUserId);
      return NextResponse.json({
        success: true,
        message: 'User was not referred - no reward to process',
        refereeUserId,
      });
    }
    
    // Get the referrer (the person who referred them) to send them an email
    interface ReferrerRow {
      id: string;
      email: string;
      name: string | null;
      referral_code: string | null;
      referral_rewards_earned: number | null;
    }
    
    const { data: referrer, error: referrerError } = await supabase
      .from('users')
      .select('id, email, name, referral_code, referral_rewards_earned')
      .eq('id', referee.referred_by)
      .single() as { data: ReferrerRow | null; error: Error | null };
    
    if (referrerError || !referrer) {
      console.error('[Referral Reward] Referrer not found:', referee.referred_by);
      return NextResponse.json({ error: 'Referrer not found' }, { status: 404 });
    }
    
    // Increment the referrer's reward count
    const newRewardCount = (referrer.referral_rewards_earned || 0) + 1;
    
    const { error: updateError } = await supabase
      .from('users')
      .update({ referral_rewards_earned: newRewardCount } as never)
      .eq('id', referrer.id);
    
    if (updateError) {
      console.error('[Referral Reward] Failed to update reward count:', updateError);
    }
    
    // Send reward earned email to the referrer
    try {
      const referrerFirstName = referrer.name?.split(' ')[0] || undefined;
      const refereeName = referee.name || 'Your friend';
      
      await sendRewardEarnedEmail({
        to: referrer.email,
        firstName: referrerFirstName,
        friendName: refereeName,
        totalRewards: newRewardCount,
        referralCode: referrer.referral_code || undefined,
      });
      console.log(`[Referral Reward] 📧 Reward earned email sent to ${referrer.email}`);
    } catch (emailError) {
      console.error('[Referral Reward] Failed to send reward earned email:', emailError);
    }
    
    console.log('[Referral Reward] Processed successfully:', {
      referrerId: referrer.id,
      refereeId: referee.id,
      newRewardCount,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json({
      success: true,
      message: 'Referral reward processed successfully',
      refereeUserId,
      referrerId: referrer.id,
      totalRewards: newRewardCount,
    });
    
  } catch (error) {
    console.error('Error processing referral reward:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
