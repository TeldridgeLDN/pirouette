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

function getScoreEmoji(score: number): string {
  if (score >= 80) return '🎉';
  if (score >= 60) return '👍';
  return '💪';
}

export default function AnalysisCompleteEmail({ 
  firstName,
  url,
  overallScore,
  reportUrl,
  topRecommendation,
}: AnalysisCompleteEmailProps) {
  const scoreColor = getScoreColor(overallScore);
  const scoreEmoji = getScoreEmoji(overallScore);

  return (
    <BaseEmail previewText={`Your design analysis is ready - Score: ${overallScore}/100`}>
      <EmailHeading>
        Your Analysis is Ready! {scoreEmoji}
      </EmailHeading>
      
      <EmailText>
        {firstName ? `Hey ${firstName}, ` : ''}We&apos;ve finished analysing your landing page. 
        Here&apos;s a quick summary:
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
          Your Overall Design Score
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
            💡 Top Recommendation
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
        Your report includes detailed scores across 7 dimensions, prioritised 
        recommendations, and comparisons to industry benchmarks.
      </EmailText>

      <EmailMuted>
        This analysis was powered by patterns from 50+ award-winning sites.
      </EmailMuted>
    </BaseEmail>
  );
}

