/**
 * Account Deletion API
 * 
 * POST /api/account/delete
 * 
 * Initiates account deletion process.
 * Deletes all user data from Supabase.
 * Note: Clerk account deletion should be handled separately or via webhook.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getStripe, getActiveSubscription } from '@/lib/stripe';

// ============================================================================
// Types
// ============================================================================

interface DeleteRequest {
  confirmation: string; // Must be "DELETE"
}

interface UserData {
  id: string;
  email: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

// ============================================================================
// Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // 1. Require authentication
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // 2. Validate confirmation
    const body: DeleteRequest = await request.json();
    
    if (body.confirmation !== 'DELETE') {
      return NextResponse.json(
        { success: false, error: 'Invalid confirmation. Please type DELETE to confirm.' },
        { status: 400 }
      );
    }
    
    const supabase = supabaseAdmin;
    
    // 3. Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, stripe_customer_id, stripe_subscription_id')
      .eq('clerk_id', clerkUserId)
      .single() as { data: UserData | null; error: Error | null };
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // 4. Cancel Stripe subscription if exists
    if (user.stripe_customer_id) {
      try {
        const stripe = getStripe();
        const subscription = await getActiveSubscription(user.stripe_customer_id);
        
        if (subscription) {
          await stripe.subscriptions.cancel(subscription.id, {
            invoice_now: false,
            prorate: true,
          });
          console.log(`Cancelled subscription ${subscription.id} for user ${user.id}`);
        }
      } catch (stripeError) {
        console.error('Error cancelling Stripe subscription:', stripeError);
        // Continue with deletion even if Stripe fails
      }
    }
    
    // 5. Delete screenshots from storage (if any)
    // Note: This assumes screenshots are stored with user_id prefix
    try {
      const { data: files } = await supabase.storage
        .from('screenshots')
        .list(user.id);
      
      if (files && files.length > 0) {
        const filePaths = files.map(f => `${user.id}/${f.name}`);
        await supabase.storage.from('screenshots').remove(filePaths);
        console.log(`Deleted ${filePaths.length} screenshots for user ${user.id}`);
      }
    } catch (storageError) {
      console.error('Error deleting screenshots:', storageError);
      // Continue with deletion even if storage cleanup fails
    }
    
    // 6. Delete reports (cascade from jobs should handle this, but be explicit)
    const { error: reportsError } = await supabase
      .from('reports')
      .delete()
      .eq('user_id', user.id);
    
    if (reportsError) {
      console.error('Error deleting reports:', reportsError);
    }
    
    // 7. Delete jobs
    const { error: jobsError } = await supabase
      .from('jobs')
      .delete()
      .eq('user_id', user.id);
    
    if (jobsError) {
      console.error('Error deleting jobs:', jobsError);
    }
    
    // 8. Delete user record
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id);
    
    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete account. Please contact support.' },
        { status: 500 }
      );
    }
    
    // 9. Log deletion for audit
    console.log(`Account deleted: ${user.email} (ID: ${user.id}, Clerk: ${clerkUserId})`);
    
    // Note: Clerk account should be deleted separately
    // This can be done via:
    // - Clerk Dashboard manually
    // - A webhook that triggers when Supabase user is deleted
    // - Or by calling Clerk API here (requires backend API key)
    
    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully. You will be signed out shortly.',
    });
    
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}

