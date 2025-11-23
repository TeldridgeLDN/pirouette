/**
 * Manual User Sync API Route
 * 
 * This endpoint manually syncs the current Clerk user to Supabase.
 * Useful for development before webhooks are configured.
 * 
 * Usage: Visit /api/sync-user while signed in
 */

import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get current Clerk user
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get primary email
    const primaryEmail = user.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId
    );

    if (!primaryEmail) {
      return NextResponse.json(
        { error: 'No email found' },
        { status: 400 }
      );
    }

    // Check if user already exists in Supabase
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single();

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: 'User already exists in Supabase',
        user: {
          clerk_id: user.id,
          email: primaryEmail.emailAddress,
        },
      });
    }

    // Create user in Supabase
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        clerk_id: user.id,
        email: primaryEmail.emailAddress,
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.firstName || null,
        plan: 'free',
        analyses_this_month: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user in Supabase:', error);
      return NextResponse.json(
        { error: 'Failed to create user', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '✅ User synced to Supabase successfully!',
      user: data,
    });
  } catch (error: any) {
    console.error('Sync user error:', error);
    return NextResponse.json(
      { error: 'Unexpected error', details: error.message },
      { status: 500 }
    );
  }
}

