/**
 * Clerk Webhook Handler
 * 
 * Syncs Clerk user events to Supabase database
 * Events handled:
 * - user.created → Create user in Supabase + Send welcome email
 * - user.updated → Update user in Supabase
 * - user.deleted → Delete user from Supabase
 */

import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { InsertUser, UpdateUser } from '@/lib/supabase/types';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(req: Request) {
  // Get the Svix headers for verification
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Get the webhook secret from environment
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  // Create a new Svix instance with your secret
  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;

  // Verify the webhook signature
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle the webhook
  const eventType = evt.type;

  try {
    switch (eventType) {
      case 'user.created': {
        const { id, email_addresses, first_name, last_name } = evt.data;
        const primaryEmail = email_addresses.find(
          (email) => email.id === evt.data.primary_email_address_id
        );

        if (!primaryEmail) {
          return NextResponse.json(
            { error: 'No primary email found' },
            { status: 400 }
          );
        }

        // Create user in Supabase
        const userData: InsertUser = {
          clerk_id: id,
          email: primaryEmail.email_address,
          name: first_name && last_name ? `${first_name} ${last_name}` : first_name || null,
          plan: 'free',
          analyses_this_month: 0,
        };
        const { error } = await supabaseAdmin.from('users').insert(userData as never);

        if (error) {
          console.error('Error creating user in Supabase:', error);
          // Don't return error to Clerk - we don't want to fail the webhook
          // User can be synced later if needed
        } else {
          console.log(`✅ User created in Supabase: ${id}`);
        }

        // Send welcome email (don't fail webhook if email fails)
        try {
          await sendWelcomeEmail({
            to: primaryEmail.email_address,
            firstName: first_name || undefined,
          });
          console.log(`📧 Welcome email sent to: ${primaryEmail.email_address}`);
        } catch (emailError) {
          // Log but don't fail the webhook - user is still created
          console.error('Failed to send welcome email:', emailError);
        }

        break;
      }

      case 'user.updated': {
        const { id, email_addresses, first_name, last_name } = evt.data;
        const primaryEmail = email_addresses.find(
          (email) => email.id === evt.data.primary_email_address_id
        );

        if (!primaryEmail) {
          return NextResponse.json(
            { error: 'No primary email found' },
            { status: 400 }
          );
        }

        // Update user in Supabase
        const updateData: UpdateUser = {
          email: primaryEmail.email_address,
          name: first_name && last_name ? `${first_name} ${last_name}` : first_name || null,
        };
        const { error } = await supabaseAdmin
          .from('users')
          .update(updateData as never)
          .eq('clerk_id', id);

        if (error) {
          console.error('Error updating user in Supabase:', error);
        } else {
          console.log(`✅ User updated in Supabase: ${id}`);
        }

        break;
      }

      case 'user.deleted': {
        const { id } = evt.data;

        if (!id) {
          return NextResponse.json(
            { error: 'No user ID provided' },
            { status: 400 }
          );
        }

        // Delete user from Supabase (CASCADE will handle related records)
        const { error } = await supabaseAdmin
          .from('users')
          .delete()
          .eq('clerk_id', id);

        if (error) {
          console.error('Error deleting user from Supabase:', error);
        } else {
          console.log(`✅ User deleted from Supabase: ${id}`);
        }

        break;
      }

      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}



