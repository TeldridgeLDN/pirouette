/**
 * Referral Email Templates
 * 
 * Emails related to the referral programme.
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
// Friend Signed Up Email
// ============================================================================

interface FriendSignedUpEmailProps {
  firstName?: string;
  friendName: string;
  referralUrl?: string;
}

export function FriendSignedUpEmail({ 
  firstName,
  friendName,
  referralUrl = 'https://pirouette.app/dashboard',
}: FriendSignedUpEmailProps) {
  return (
    <BaseEmail previewText={`${friendName} just signed up using your referral!`}>
      <EmailHeading>
        Your Friend Signed Up! 🎉
      </EmailHeading>
      
      <EmailText>
        {firstName ? `Hey ${firstName}, ` : ''}Great news - <strong>{friendName}</strong> just 
        signed up for Pirouette using your referral link!
      </EmailText>

      <Section style={{
        backgroundColor: '#f0fdf4',
        border: '1px solid #86efac',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
        textAlign: 'center' as const,
      }}>
        <Text style={{
          color: '#166534',
          fontSize: '16px',
          margin: '0',
        }}>
          🎁 You&apos;ll earn a <strong>free month of Pro</strong> when they upgrade!
        </Text>
      </Section>

      <EmailText>
        Keep sharing your link to earn more rewards. Remember, you can earn 
        up to 12 free months per year!
      </EmailText>

      <EmailButton href={referralUrl}>
        View Referral Status →
      </EmailButton>

      <EmailDivider />

      <EmailMuted>
        Share your link: pirouette.app/r/YOURCODE
      </EmailMuted>
    </BaseEmail>
  );
}

// ============================================================================
// Reward Earned Email
// ============================================================================

interface RewardEarnedEmailProps {
  firstName?: string;
  friendName: string;
  totalRewards: number;
  dashboardUrl?: string;
}

export function RewardEarnedEmail({ 
  firstName,
  friendName,
  totalRewards,
  dashboardUrl = 'https://pirouette.app/dashboard',
}: RewardEarnedEmailProps) {
  return (
    <BaseEmail previewText={`You earned a free month! ${friendName} upgraded to Pro.`}>
      <EmailHeading>
        You Earned a Free Month! 🎁
      </EmailHeading>
      
      <EmailText>
        {firstName ? `Amazing news, ${firstName}! ` : 'Amazing news! '}<strong>{friendName}</strong> just 
        upgraded to Pirouette Pro, and you&apos;ve earned a free month!
      </EmailText>

      <Section style={{
        backgroundColor: '#eef2ff',
        border: '1px solid #c7d2fe',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '24px',
        textAlign: 'center' as const,
      }}>
        <Text style={{
          color: '#3730a3',
          fontSize: '48px',
          fontWeight: 'bold',
          margin: '0',
        }}>
          🎉
        </Text>
        <Text style={{
          color: '#3730a3',
          fontSize: '20px',
          fontWeight: 'bold',
          margin: '8px 0 0 0',
        }}>
          +1 Free Month
        </Text>
        <Text style={{
          color: '#6366f1',
          fontSize: '14px',
          margin: '4px 0 0 0',
        }}>
          Applied to your next billing cycle
        </Text>
      </Section>

      <Section style={{
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
      }}>
        <Text style={{
          color: '#64748b',
          fontSize: '14px',
          margin: '0',
        }}>
          Total free months earned: <strong>{totalRewards}</strong>
        </Text>
      </Section>

      <EmailText>
        Keep sharing to earn more! Each friend who upgrades = another free month.
      </EmailText>

      <EmailButton href={dashboardUrl}>
        Share More →
      </EmailButton>

      <EmailDivider />

      <EmailMuted>
        Maximum 12 free months per year. Thank you for spreading the word!
      </EmailMuted>
    </BaseEmail>
  );
}

