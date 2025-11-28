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
  firstName = 'there',
  dashboardUrl = 'https://pirouette.app/dashboard',
}: WelcomeEmailProps) {
  return (
    <BaseEmail previewText="Welcome to Pirouette - Let's get you design confident!">
      <EmailHeading>
        Welcome to Pirouette{firstName ? `, ${firstName}` : ''}! 🎉
      </EmailHeading>
      
      <EmailText>
        You&apos;ve just taken the first step towards design confidence. 
        Pirouette analyses your landing pages against patterns from 50+ 
        award-winning sites to give you actionable, data-driven recommendations.
      </EmailText>

      <EmailDivider />

      <Text style={{
        color: '#0f172a',
        fontSize: '18px',
        fontWeight: '600',
        margin: '0 0 16px 0',
      }}>
        Here&apos;s what you can do:
      </Text>

      <Section style={{ marginBottom: '24px' }}>
        {[
          { icon: '🎯', title: 'Run your first analysis', desc: 'Enter any URL and get scores in 30 seconds' },
          { icon: '💡', title: 'Get recommendations', desc: 'See prioritised fixes with estimated impact' },
          { icon: '📊', title: 'Track progress', desc: 'Watch your scores improve over time' },
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
        Go to Dashboard →
      </EmailButton>

      <EmailDivider />

      <EmailMuted>
        Questions? Just reply to this email - we&apos;re here to help.
      </EmailMuted>
    </BaseEmail>
  );
}

