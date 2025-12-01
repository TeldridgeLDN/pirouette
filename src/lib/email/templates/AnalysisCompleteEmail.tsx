/**
 * Analysis Complete Email Template
 * 
 * Sent when a user's analysis is ready.
 */

import * as React from 'react';
import BaseEmail, { 
  EmailHeading, 
  EmailText, 
  EmailButton, 
  EmailDivider,
  EmailMuted,
} from './BaseEmail';
import { Text, Section, Link } from '@react-email/components';

interface AnalysisCompleteEmailProps {
  firstName?: string;
  url: string;
  overallScore: number;
  reportUrl: string;
  topRecommendation?: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981'; // green
  if (score >= 60) return '#f59e0b'; // amber
  return '#ef4444'; // red
}

function getScoreMessage(score: number): { emoji: string; headline: string; message: string } {
  if (score >= 85) {
    return {
      emoji: '🏆',
      headline: 'Impressive!',
      message: 'This page is performing in the top tier. A few tweaks and it could be competing with the best in class.',
    };
  }
  if (score >= 70) {
    return {
      emoji: '🎯',
      headline: 'Looking good!',
      message: 'Above average, but there\'s room to shine. The recommendations in the report highlight where to focus.',
    };
  }
  if (score >= 55) {
    return {
      emoji: '💡',
      headline: 'Solid foundation',
      message: 'Good bones here, but some targeted improvements could significantly boost conversions.',
    };
  }
  return {
    emoji: '💪',
    headline: 'Room to grow',
    message: 'Good news: several high-impact opportunities identified. The fixes in the report could transform this page.',
  };
}

export default function AnalysisCompleteEmail({ 
  firstName,
  url,
  overallScore,
  reportUrl,
  topRecommendation,
}: AnalysisCompleteEmailProps) {
  const scoreColor = getScoreColor(overallScore);
  const { emoji, headline, message } = getScoreMessage(overallScore);
  const greeting = firstName ? `Hey ${firstName}` : 'Hey there';

  return (
    <BaseEmail previewText={`Analysis complete: ${overallScore}/100 ${emoji}`}>
      <EmailHeading>
        {headline} {emoji}
      </EmailHeading>
      
      <EmailText>
        {greeting}, the analysis is ready! We&apos;ve just finished putting this landing 
        page through its paces.
      </EmailText>

      {/* URL analysed */}
      <Section style={{
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
      }}>
        <Text style={{
          color: '#64748b',
          fontSize: '12px',
          margin: '0 0 4px 0',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.5px',
        }}>
          Page Analysed
        </Text>
        <Link
          href={url}
          style={{
            color: '#4f46e5',
            fontSize: '14px',
            textDecoration: 'none',
            wordBreak: 'break-all' as const,
          }}
        >
          {url}
        </Link>
      </Section>

      {/* Score display */}
      <Section style={{
        textAlign: 'center' as const,
        marginBottom: '24px',
      }}>
        <Text style={{
          color: '#64748b',
          fontSize: '14px',
          margin: '0 0 8px 0',
        }}>
          Design Score
        </Text>
        <div style={{
          display: 'inline-block',
          backgroundColor: scoreColor,
          color: '#ffffff',
          fontSize: '48px',
          fontWeight: 'bold',
          padding: '24px 40px',
          borderRadius: '16px',
        }}>
          {overallScore}
        </div>
        <Text style={{
          color: '#64748b',
          fontSize: '14px',
          margin: '8px 0 0 0',
        }}>
          out of 100
        </Text>
      </Section>

      <Text style={{ 
        color: '#475569', 
        fontSize: '16px', 
        lineHeight: '24px',
        marginBottom: '24px' 
      }}>
        {message}
      </Text>

      {/* Top recommendation */}
      {topRecommendation && (
        <Section style={{
          backgroundColor: '#fef3c7',
          borderLeft: '4px solid #f59e0b',
          borderRadius: '0 8px 8px 0',
          padding: '16px',
          marginBottom: '24px',
        }}>
          <Text style={{
            color: '#92400e',
            fontSize: '12px',
            margin: '0 0 4px 0',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.5px',
            fontWeight: '600',
          }}>
            🎯 Top Quick Win
          </Text>
          <Text style={{
            color: '#78350f',
            fontSize: '14px',
            margin: '0',
          }}>
            {topRecommendation}
          </Text>
        </Section>
      )}

      <EmailButton href={reportUrl}>
        View Full Report →
      </EmailButton>

      <EmailDivider />

      <EmailText>
        The full report includes detailed scores across 7 dimensions, prioritised 
        recommendations sorted by impact, and benchmarks against award-winning sites.
      </EmailText>

      <EmailMuted>
        Questions about the results? Just reply—we&apos;re always happy to help.
      </EmailMuted>
    </BaseEmail>
  );
}

