/**
 * Welcome Email Template
 * 
 * Sent to new users after signup.
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

interface WelcomeEmailProps {
  firstName?: string;
  dashboardUrl?: string;
}

export default function WelcomeEmail({ 
  firstName,
  dashboardUrl = 'https://pirouette.app/dashboard',
}: WelcomeEmailProps) {
  const greeting = firstName ? `Hey ${firstName}` : 'Hey there';
  
  return (
    <BaseEmail previewText="Welcome to Pirouette! Your landing page's new best friend 🎨">
      <EmailHeading>
        Welcome aboard! 🎉
      </EmailHeading>
      
      <EmailText>
        {greeting}, thanks for joining Pirouette!
      </EmailText>
      
      <EmailText>
        You know that nagging feeling when you look at your landing page and think 
        &quot;something&apos;s off, but I can&apos;t put my finger on it&quot;? That&apos;s 
        exactly why we built this.
      </EmailText>
      
      <EmailText>
        Pirouette analyses your pages against patterns from 50+ award-winning sites 
        and tells you <em>exactly</em> what to fix—with time estimates and everything.
      </EmailText>

      <EmailDivider />

      <Text style={{
        color: '#0f172a',
        fontSize: '18px',
        fontWeight: '600',
        margin: '0 0 16px 0',
      }}>
        Here&apos;s how to get started:
      </Text>

      <Section style={{ marginBottom: '24px' }}>
        {[
          { icon: '🎯', title: 'Run your first analysis', desc: 'Paste any URL and get your score in under 30 seconds' },
          { icon: '💡', title: 'Get prioritised recommendations', desc: 'We rank fixes by impact so you know what to tackle first' },
          { icon: '📊', title: 'Track your progress', desc: 'Re-analyse after changes and watch your scores climb' },
        ].map((item, i) => (
          <div key={i} style={{ 
            display: 'flex', 
            marginBottom: '16px',
            alignItems: 'flex-start',
          }}>
            <span style={{ 
              fontSize: '20px', 
              marginRight: '12px',
              lineHeight: '24px',
            }}>
              {item.icon}
            </span>
            <div>
              <Text style={{
                color: '#0f172a',
                fontSize: '16px',
                fontWeight: '600',
                margin: '0 0 4px 0',
              }}>
                {item.title}
              </Text>
              <Text style={{
                color: '#64748b',
                fontSize: '14px',
                margin: '0',
              }}>
                {item.desc}
              </Text>
            </div>
          </div>
        ))}
      </Section>

      <EmailButton href={dashboardUrl}>
        Analyse Your First Page →
      </EmailButton>

      <EmailDivider />

      <EmailMuted>
        Got questions? Just hit reply—we read every email and actually respond 
        (shocking, we know).
      </EmailMuted>
    </BaseEmail>
  );
}

