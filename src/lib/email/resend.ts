/**
 * Resend Email Client
 * 
 * Configuration and helper functions for sending emails via Resend.
 */

import { Resend } from 'resend';

// ============================================================================
// Client (lazy initialization to avoid build-time errors)
// ============================================================================

let _resend: Resend | null = null;

function getResendClient(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

// Keep for backwards compatibility export
const resend = { 
  emails: { send: async (...args: Parameters<Resend['emails']['send']>) => getResendClient().emails.send(...args) },
  batch: { send: async (...args: Parameters<Resend['batch']['send']>) => getResendClient().batch.send(...args) },
};

// ============================================================================
// Configuration
// ============================================================================

export const EMAIL_CONFIG = {
  from: {
    default: 'Pirouette <hello@pirouette.app>',
    noreply: 'Pirouette <noreply@pirouette.app>',
    support: 'Pirouette Support <support@pirouette.app>',
  },
  replyTo: 'support@pirouette.app',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://pirouette.app',
};

// ============================================================================
// Types
// ============================================================================

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  from?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

// ============================================================================
// Send Email Function
// ============================================================================

export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: options.from || EMAIL_CONFIG.from.default,
      to: options.to,
      subject: options.subject,
      react: options.react,
      replyTo: options.replyTo || EMAIL_CONFIG.replyTo,
      tags: options.tags,
    });

    if (error) {
      console.error('Email send error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      id: data?.id,
    };
  } catch (error) {
    console.error('Email send exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// Batch Send Function
// ============================================================================

export async function sendBatchEmails(
  emails: SendEmailOptions[]
): Promise<{ success: boolean; results?: { id: string }[]; error?: string }> {
  try {
    const { data, error } = await resend.batch.send(
      emails.map((email) => ({
        from: email.from || EMAIL_CONFIG.from.default,
        to: email.to,
        subject: email.subject,
        react: email.react,
        replyTo: email.replyTo || EMAIL_CONFIG.replyTo,
        tags: email.tags,
      }))
    );

    if (error) {
      console.error('Batch email error:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      results: data?.data,
    };
  } catch (error) {
    console.error('Batch email exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export { resend };

