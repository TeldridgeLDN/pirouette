/**
 * Subscription Email Templates
 * 
 * Various emails related to subscription lifecycle.
 */

import * as React from 'react';
import BaseEmail, { 
  EmailHeading, 
  EmailText, 
  EmailButton, 
  EmailDivider,
  EmailMuted,
} from './BaseEmail';
import { Text, Section } from '@react-email/components';

// ============================================================================
// Trial Started Email
// ============================================================================

interface TrialStartedEmailProps {
  firstName?: string;
  trialEndDate: string;
  dashboardUrl?: string;
}

export function TrialStartedEmail({ 
  firstName,
  trialEndDate,
  dashboardUrl = 'https://pirouette.app/dashboard',
}: TrialStartedEmailProps) {
  return (
    <BaseEmail previewText="Your Pirouette Pro trial has started!">
      <EmailHeading>
        Your Pro Trial Has Started! 🚀
      </EmailHeading>
      
      <EmailText>
        {firstName ? `Hey ${firstName}, ` : ''}Welcome to Pirouette Pro! 
        You now have access to all premium features for the next 14 days.
      </EmailText>

      <Section style={{
        backgroundColor: '#f0fdf4',
        border: '1px solid #86efac',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
      }}>
        <Text style={{
          color: '#166534',
          fontSize: '14px',
          margin: '0',
        }}>
          ✨ Your trial ends on <strong>{trialEndDate}</strong>
        </Text>
      </Section>

      <Text style={{
        color: '#0f172a',
        fontSize: '18px',
        fontWeight: '600',
        margin: '0 0 16px 0',
      }}>
        What&apos;s Included:
      </Text>

      <Section style={{ marginBottom: '24px' }}>
        {[
          '📊 Unlimited analyses',
          '📈 Historical tracking',
          '🏆 Industry benchmarking',
          '📄 PDF exports',
          '🔄 Competitor comparison',
        ].map((feature, i) => (
          <Text key={i} style={{
            color: '#334155',
            fontSize: '14px',
            margin: '0 0 8px 0',
          }}>
            {feature}
          </Text>
        ))}
      </Section>

      <EmailButton href={dashboardUrl}>
        Start Analysing →
      </EmailButton>

      <EmailDivider />

      <EmailMuted>
        Add a payment method anytime to continue after your trial.
      </EmailMuted>
    </BaseEmail>
  );
}

// ============================================================================
// Trial Ending Soon Email
// ============================================================================

interface TrialEndingEmailProps {
  firstName?: string;
  daysRemaining: number;
  upgradeUrl?: string;
}

export function TrialEndingEmail({ 
  firstName,
  daysRemaining,
  upgradeUrl = 'https://pirouette.app/pricing',
}: TrialEndingEmailProps) {
  return (
    <BaseEmail previewText={`Your Pirouette trial ends in ${daysRemaining} days`}>
      <EmailHeading>
        Your Trial Ends in {daysRemaining} Day{daysRemaining > 1 ? 's' : ''} ⏰
      </EmailHeading>
      
      <EmailText>
        {firstName ? `Hey ${firstName}, ` : ''}Just a heads up - your Pirouette Pro 
        trial is almost over. Add a payment method to keep your premium features.
      </EmailText>

      <Section style={{
        backgroundColor: '#fef3c7',
        border: '1px solid #fcd34d',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
      }}>
        <Text style={{
          color: '#92400e',
          fontSize: '14px',
          margin: '0',
        }}>
          ⚠️ Without upgrading, you&apos;ll lose access to unlimited analyses, 
          historical tracking, and all Pro features.
        </Text>
      </Section>

      <EmailButton href={upgradeUrl}>
        Continue with Pro →
      </EmailButton>

      <EmailDivider />

      <EmailMuted>
        Questions? Reply to this email and we&apos;ll help.
      </EmailMuted>
    </BaseEmail>
  );
}

// ============================================================================
// Subscription Confirmed Email
// ============================================================================

interface SubscriptionConfirmedEmailProps {
  firstName?: string;
  planName: string;
  amount: string;
  nextBillingDate: string;
  dashboardUrl?: string;
}

export function SubscriptionConfirmedEmail({ 
  firstName,
  planName,
  amount,
  nextBillingDate,
  dashboardUrl = 'https://pirouette.app/dashboard',
}: SubscriptionConfirmedEmailProps) {
  return (
    <BaseEmail previewText="Welcome to Pirouette Pro - Your subscription is confirmed!">
      <EmailHeading>
        You&apos;re Now a Pro! 🎉
      </EmailHeading>
      
      <EmailText>
        {firstName ? `Hey ${firstName}, ` : ''}Thank you for subscribing to 
        Pirouette Pro! Your account has been upgraded and all premium features 
        are now unlocked.
      </EmailText>

      <Section style={{
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
      }}>
        <Text style={{ color: '#64748b', fontSize: '12px', margin: '0 0 4px 0' }}>
          Plan
        </Text>
        <Text style={{ color: '#0f172a', fontSize: '16px', fontWeight: '600', margin: '0 0 12px 0' }}>
          {planName}
        </Text>
        
        <Text style={{ color: '#64748b', fontSize: '12px', margin: '0 0 4px 0' }}>
          Amount
        </Text>
        <Text style={{ color: '#0f172a', fontSize: '16px', fontWeight: '600', margin: '0 0 12px 0' }}>
          {amount}
        </Text>
        
        <Text style={{ color: '#64748b', fontSize: '12px', margin: '0 0 4px 0' }}>
          Next billing date
        </Text>
        <Text style={{ color: '#0f172a', fontSize: '16px', fontWeight: '600', margin: '0' }}>
          {nextBillingDate}
        </Text>
      </Section>

      <EmailButton href={dashboardUrl}>
        Go to Dashboard →
      </EmailButton>

      <EmailDivider />

      <EmailMuted>
        Manage your subscription anytime in Settings → Billing.
      </EmailMuted>
    </BaseEmail>
  );
}

// ============================================================================
// Payment Failed Email
// ============================================================================

interface PaymentFailedEmailProps {
  firstName?: string;
  amount: string;
  updatePaymentUrl?: string;
}

export function PaymentFailedEmail({ 
  firstName,
  amount,
  updatePaymentUrl = 'https://pirouette.app/dashboard/billing',
}: PaymentFailedEmailProps) {
  return (
    <BaseEmail previewText="Action required: Your Pirouette payment failed">
      <EmailHeading>
        Payment Failed ⚠️
      </EmailHeading>
      
      <EmailText>
        {firstName ? `Hey ${firstName}, ` : ''}We couldn&apos;t process your 
        payment of {amount} for Pirouette Pro. Please update your payment 
        method to keep your subscription active.
      </EmailText>

      <Section style={{
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
      }}>
        <Text style={{
          color: '#991b1b',
          fontSize: '14px',
          margin: '0',
        }}>
          🚨 Your Pro access will be suspended if payment isn&apos;t received 
          within 7 days.
        </Text>
      </Section>

      <EmailButton href={updatePaymentUrl}>
        Update Payment Method →
      </EmailButton>

      <EmailDivider />

      <EmailMuted>
        If you&apos;re having trouble, reply to this email and we&apos;ll help.
      </EmailMuted>
    </BaseEmail>
  );
}

// ============================================================================
// Subscription Cancelled Email
// ============================================================================

interface SubscriptionCancelledEmailProps {
  firstName?: string;
  endDate: string;
  reactivateUrl?: string;
}

export function SubscriptionCancelledEmail({ 
  firstName,
  endDate,
  reactivateUrl = 'https://pirouette.app/pricing',
}: SubscriptionCancelledEmailProps) {
  return (
    <BaseEmail previewText="Your Pirouette subscription has been cancelled">
      <EmailHeading>
        Subscription Cancelled 😢
      </EmailHeading>
      
      <EmailText>
        {firstName ? `Hey ${firstName}, ` : ''}We&apos;re sorry to see you go. 
        Your Pirouette Pro subscription has been cancelled.
      </EmailText>

      <Section style={{
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
      }}>
        <Text style={{
          color: '#334155',
          fontSize: '14px',
          margin: '0',
        }}>
          You&apos;ll have access to Pro features until <strong>{endDate}</strong>. 
          After that, your account will revert to the free plan.
        </Text>
      </Section>

      <EmailText>
        Changed your mind? You can reactivate anytime before your access ends.
      </EmailText>

      <EmailButton href={reactivateUrl}>
        Reactivate Subscription →
      </EmailButton>

      <EmailDivider />

      <EmailMuted>
        We&apos;d love to know why you left. Reply to this email with feedback.
      </EmailMuted>
    </BaseEmail>
  );
}

