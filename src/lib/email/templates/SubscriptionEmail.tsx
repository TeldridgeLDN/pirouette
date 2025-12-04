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
  dashboardUrl = 'https://pirouette.design/dashboard',
}: TrialStartedEmailProps) {
  const greeting = firstName ? `Hey ${firstName}` : 'Hey there';
  
  return (
    <BaseEmail previewText="Your 14-day Pro trial is live! Let's make some magic ✨">
      <EmailHeading>
        You&apos;re in! 🎉
      </EmailHeading>
      
      <EmailText>
        {greeting}, your Pirouette Pro trial just kicked off. For the next 14 days, 
        you&apos;ve got the full toolkit at your fingertips.
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
          ✨ Your trial runs until <strong>{trialEndDate}</strong> — no card required
        </Text>
      </Section>

      <Text style={{
        color: '#0f172a',
        fontSize: '18px',
        fontWeight: '600',
        margin: '0 0 16px 0',
      }}>
        Here&apos;s what you&apos;ve unlocked:
      </Text>

      <Section style={{ marginBottom: '24px' }}>
        {[
          { icon: '📊', text: 'Unlimited analyses — go wild' },
          { icon: '📈', text: 'Historical tracking — watch your scores climb' },
          { icon: '🏆', text: 'Industry benchmarks — see how you stack up' },
          { icon: '📄', text: 'PDF exports — share with clients & stakeholders' },
          { icon: '🔍', text: 'Competitor comparison — spy on the competition' },
        ].map((feature, i) => (
          <Text key={i} style={{
            color: '#334155',
            fontSize: '14px',
            margin: '0 0 8px 0',
          }}>
            {feature.icon} {feature.text}
          </Text>
        ))}
      </Section>

      <EmailButton href={dashboardUrl}>
        Start Analysing →
      </EmailButton>

      <EmailDivider />

      <EmailMuted>
        Loving it? You can upgrade anytime in Settings → Billing. 
        No pressure—we&apos;ll remind you before your trial ends.
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
  upgradeUrl = 'https://pirouette.design/pricing',
}: TrialEndingEmailProps) {
  const greeting = firstName ? `Hey ${firstName}` : 'Hey there';
  const dayWord = daysRemaining === 1 ? 'day' : 'days';
  
  return (
    <BaseEmail previewText={`Quick heads up: ${daysRemaining} ${dayWord} left on your Pro trial ⏰`}>
      <EmailHeading>
        {daysRemaining} {dayWord} left on your trial ⏰
      </EmailHeading>
      
      <EmailText>
        {greeting}, just a friendly nudge—your Pirouette Pro trial wraps up in {daysRemaining} {dayWord}.
      </EmailText>
      
      <EmailText>
        If you&apos;ve been finding the unlimited analyses and benchmarking useful, 
        now&apos;s a good time to lock in your subscription so there&apos;s no gap in access.
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
          margin: '0 0 8px 0',
          fontWeight: '600',
        }}>
          What happens after your trial:
        </Text>
        <Text style={{
          color: '#64748b',
          fontSize: '14px',
          margin: '0',
        }}>
          → You&apos;ll move to the free plan (3 analyses per week)<br />
          → Your history & reports stay safe—they&apos;re not going anywhere<br />
          → You can upgrade anytime to get Pro back
        </Text>
      </Section>

      <EmailButton href={upgradeUrl}>
        Keep Pro Features →
      </EmailButton>

      <EmailDivider />

      <EmailMuted>
        Not the right time? No worries—your data will be here when you&apos;re ready. 
        Questions? Just reply to this email.
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
  dashboardUrl = 'https://pirouette.design/dashboard',
}: SubscriptionConfirmedEmailProps) {
  const greeting = firstName ? `Hey ${firstName}` : 'Hey there';
  
  return (
    <BaseEmail previewText="You're officially Pro! Here's your receipt 🧾">
      <EmailHeading>
        Welcome to the Pro club! 🏆
      </EmailHeading>
      
      <EmailText>
        {greeting}, thanks for going Pro! You now have unlimited access to everything 
        Pirouette has to offer. Time to make some landing pages shine.
      </EmailText>

      <Section style={{
        backgroundColor: '#f0fdf4',
        border: '1px solid #86efac',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
      }}>
        <Text style={{ color: '#166534', fontSize: '14px', margin: '0', fontWeight: '600' }}>
          ✓ Subscription confirmed
        </Text>
      </Section>

      <Section style={{
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
      }}>
        <Text style={{ color: '#64748b', fontSize: '12px', margin: '0 0 4px 0', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>
          Plan
        </Text>
        <Text style={{ color: '#0f172a', fontSize: '16px', fontWeight: '600', margin: '0 0 16px 0' }}>
          {planName}
        </Text>
        
        <Text style={{ color: '#64748b', fontSize: '12px', margin: '0 0 4px 0', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>
          Amount
        </Text>
        <Text style={{ color: '#0f172a', fontSize: '16px', fontWeight: '600', margin: '0 0 16px 0' }}>
          {amount}
        </Text>
        
        <Text style={{ color: '#64748b', fontSize: '12px', margin: '0 0 4px 0', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }}>
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
        Need to update your billing info or cancel? Head to Settings → Billing anytime.
        Questions? Just reply to this email.
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
  retryCount?: number;
  updatePaymentUrl?: string;
}

export function PaymentFailedEmail({ 
  firstName,
  amount,
  retryCount = 1,
  updatePaymentUrl = 'https://pirouette.design/dashboard/billing',
}: PaymentFailedEmailProps) {
  const greeting = firstName ? `Hey ${firstName}` : 'Hey there';
  
  // Different messaging based on retry count
  const isFirstAttempt = retryCount <= 1;
  const isFinalWarning = retryCount >= 3;
  
  const headline = isFinalWarning 
    ? 'Action needed: Pro access at risk' 
    : 'Quick heads up about your payment';
    
  const urgency = isFinalWarning
    ? 'Your Pro access will be paused if we can\'t process payment soon.'
    : 'We\'ll retry automatically, but updating your card now ensures no interruption.';
  
  return (
    <BaseEmail previewText={isFirstAttempt ? 'Quick heads up: payment didn\'t go through' : 'Action needed: update your payment method'}>
      <EmailHeading>
        {headline} ⚠️
      </EmailHeading>
      
      <EmailText>
        {greeting}, we tried to charge {amount} for your Pirouette Pro subscription, 
        but the payment didn&apos;t go through.
      </EmailText>
      
      <EmailText>
        {urgency}
      </EmailText>

      <Section style={{
        backgroundColor: isFinalWarning ? '#fef2f2' : '#fef3c7',
        border: `1px solid ${isFinalWarning ? '#fecaca' : '#fcd34d'}`,
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
      }}>
        <Text style={{
          color: isFinalWarning ? '#991b1b' : '#92400e',
          fontSize: '14px',
          margin: '0',
        }}>
          {isFinalWarning 
            ? '⏰ This is your final reminder before access is paused'
            : '💳 Common causes: expired card, insufficient funds, or new card needed'
          }
        </Text>
      </Section>

      <EmailButton href={updatePaymentUrl}>
        Update Payment Method →
      </EmailButton>

      <EmailDivider />

      <EmailMuted>
        Having billing issues? Just reply to this email—we&apos;re happy to help sort it out. 
        No judgement, these things happen.
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
  reactivateUrl = 'https://pirouette.design/pricing',
}: SubscriptionCancelledEmailProps) {
  const greeting = firstName ? `Hey ${firstName}` : 'Hey there';
  
  return (
    <BaseEmail previewText="Your Pro subscription has been cancelled—here's what happens next">
      <EmailHeading>
        We&apos;re sorry to see you go 💙
      </EmailHeading>
      
      <EmailText>
        {greeting}, your Pirouette Pro subscription has been cancelled as requested.
      </EmailText>

      <Section style={{
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
      }}>
        <Text style={{
          color: '#0f172a',
          fontSize: '14px',
          margin: '0 0 12px 0',
          fontWeight: '600',
        }}>
          What happens next:
        </Text>
        <Text style={{
          color: '#334155',
          fontSize: '14px',
          margin: '0',
        }}>
          → Pro features stay active until <strong>{endDate}</strong><br />
          → After that, you&apos;ll move to the free plan (3 analyses/week)<br />
          → All your reports and history are safe—nothing gets deleted
        </Text>
      </Section>

      <EmailText>
        Changed your mind? You can reactivate anytime—your data will be waiting.
      </EmailText>

      <EmailButton href={reactivateUrl}>
        Reactivate Subscription →
      </EmailButton>

      <EmailDivider />

      <EmailMuted>
        Got 30 seconds? We&apos;d love to know what we could have done better. 
        Just hit reply—your feedback genuinely helps us improve.
      </EmailMuted>
    </BaseEmail>
  );
}

