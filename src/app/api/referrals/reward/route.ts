/**
 * Referral Reward API
 * 
 * POST /api/referrals/reward - Apply referral reward (called by webhook when referee upgrades)
 * 
 * TODO: Implement full referral reward processing once Supabase types are generated
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// POST - Process referral reward (stubbed for now)
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
    
    // TODO: Full implementation pending Supabase type generation
    // For now, log the request and return success
    // The actual reward processing will be implemented when we have:
    // 1. Generated Supabase types that include the referrals table
    // 2. Stripe coupon/credit functionality tested
    
    console.log('[Referral Reward] Request received:', {
      refereeUserId,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json({
      success: true,
      message: 'Referral reward logged (full processing pending)',
      refereeUserId,
    });
    
  } catch (error) {
    console.error('Error processing referral reward:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
