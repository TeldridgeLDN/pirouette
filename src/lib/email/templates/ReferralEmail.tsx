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
  referralCode?: string;
}

export function FriendSignedUpEmail({ 
  firstName,
  friendName,
  referralUrl = 'https://pirouette.app/dashboard',
  referralCode,
}: FriendSignedUpEmailProps) {
  const greeting = firstName ? `Hey ${firstName}` : 'Hey there';
  
  return (
    <BaseEmail previewText={`Cha-ching! ${friendName} just signed up using your link 🎉`}>
      <EmailHeading>
        Someone used your link! 🎉
      </EmailHeading>
      
      <EmailText>
        {greeting}, just wanted to let you know—<strong>{friendName}</strong> signed up 
        for Pirouette using your referral link.
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
          🎁 If they upgrade to Pro, you&apos;ll get a <strong>free month</strong>!
        </Text>
      </Section>

      <EmailText>
        The more friends you refer, the more free months you rack up. You can earn 
        up to 12 free months per year—that&apos;s a whole year of Pro on us.
      </EmailText>

      <EmailButton href={referralUrl}>
        Check Your Referral Stats →
      </EmailButton>

      <EmailDivider />

      <EmailMuted>
        {referralCode 
          ? `Your link: pirouette.app/r/${referralCode}` 
          : 'Keep sharing your referral link to earn more!'}
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
  referralCode?: string;
}

export function RewardEarnedEmail({ 
  firstName,
  friendName,
  totalRewards,
  dashboardUrl = 'https://pirouette.app/dashboard',
  referralCode,
}: RewardEarnedEmailProps) {
  const greeting = firstName ? `${firstName}, this is big` : 'This is big';
  
  return (
    <BaseEmail previewText={`You just earned a free month! ${friendName} went Pro 🎁`}>
      <EmailHeading>
        Free month unlocked! 🎁
      </EmailHeading>
      
      <EmailText>
        {greeting}—<strong>{friendName}</strong> just upgraded to Pirouette Pro, 
        which means you&apos;ve earned yourself a free month.
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
          +1 Free Month Added
        </Text>
        <Text style={{
          color: '#6366f1',
          fontSize: '14px',
          margin: '4px 0 0 0',
        }}>
          We&apos;ll apply this to your next billing cycle automatically
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
          📊 Your referral scorecard: <strong>{totalRewards} free month{totalRewards !== 1 ? 's' : ''}</strong> earned
        </Text>
      </Section>

      <EmailText>
        Want more? Every friend who upgrades = another free month. You can stack 
        up to 12 months per year—that&apos;s a full year of Pro, free.
      </EmailText>

      <EmailButton href={dashboardUrl}>
        Keep the Streak Going →
      </EmailButton>

      <EmailDivider />

      <EmailMuted>
        {referralCode 
          ? `Your referral link: pirouette.app/r/${referralCode}` 
          : 'Thanks for spreading the word about Pirouette!'}
      </EmailMuted>
    </BaseEmail>
  );
}

