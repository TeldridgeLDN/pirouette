/**
 * Base Email Template
 * 
 * Provides consistent branding and structure for all Pirouette emails.
 */

import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Img,
} from '@react-email/components';
import * as React from 'react';

// ============================================================================
// Types
// ============================================================================

interface BaseEmailProps {
  previewText?: string;
  children: React.ReactNode;
}

// ============================================================================
// Styles
// ============================================================================

const styles = {
  body: {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    margin: '0',
    padding: '0',
  },
  container: {
    backgroundColor: '#ffffff',
    margin: '40px auto',
    padding: '0',
    maxWidth: '600px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  header: {
    backgroundColor: '#4f46e5',
    padding: '24px 40px',
    borderRadius: '8px 8px 0 0',
  },
  logo: {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: 'bold' as const,
    textDecoration: 'none',
    margin: '0',
  },
  content: {
    padding: '40px',
  },
  footer: {
    backgroundColor: '#f8fafc',
    padding: '24px 40px',
    borderRadius: '0 0 8px 8px',
    borderTop: '1px solid #e2e8f0',
  },
  footerText: {
    color: '#64748b',
    fontSize: '12px',
    lineHeight: '20px',
    margin: '0',
  },
  footerLink: {
    color: '#4f46e5',
    textDecoration: 'none',
  },
  hr: {
    borderColor: '#e2e8f0',
    margin: '24px 0',
  },
};

// ============================================================================
// Component
// ============================================================================

export default function BaseEmail({ previewText, children }: BaseEmailProps) {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {previewText && (
          <title>{previewText}</title>
        )}
      </Head>
      <Body style={styles.body}>
        {/* Hidden preview text */}
        {previewText && (
          <div style={{ display: 'none', maxHeight: 0, overflow: 'hidden' }}>
            {previewText}
          </div>
        )}
        
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Link href="https://pirouette.design" style={styles.logo}>
              ✨ Pirouette
            </Link>
          </Section>

          {/* Content */}
          <Section style={styles.content}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Pirouette - Design Confidence, Backed by Data
            </Text>
            <Text style={{ ...styles.footerText, marginTop: '12px' }}>
              <Link href="https://pirouette.design" style={styles.footerLink}>
                Visit Pirouette
              </Link>
              {' · '}
              <Link href="https://pirouette.design/dashboard" style={styles.footerLink}>
                Dashboard
              </Link>
              {' · '}
              <Link href="https://pirouette.design/dashboard/settings" style={styles.footerLink}>
                Settings
              </Link>
            </Text>
            <Text style={{ ...styles.footerText, marginTop: '12px' }}>
              © {new Date().getFullYear()} Pirouette. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ============================================================================
// Shared Components
// ============================================================================

export function EmailHeading({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{
      color: '#0f172a',
      fontSize: '24px',
      fontWeight: 'bold',
      lineHeight: '32px',
      margin: '0 0 16px 0',
    }}>
      {children}
    </Text>
  );
}

export function EmailText({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{
      color: '#334155',
      fontSize: '16px',
      lineHeight: '24px',
      margin: '0 0 16px 0',
    }}>
      {children}
    </Text>
  );
}

export function EmailButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        display: 'inline-block',
        backgroundColor: '#4f46e5',
        color: '#ffffff',
        fontSize: '16px',
        fontWeight: '600',
        textDecoration: 'none',
        padding: '12px 24px',
        borderRadius: '6px',
        marginTop: '8px',
        marginBottom: '8px',
      }}
    >
      {children}
    </Link>
  );
}

export function EmailDivider() {
  return <Hr style={styles.hr} />;
}

export function EmailMuted({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{
      color: '#64748b',
      fontSize: '14px',
      lineHeight: '20px',
      margin: '0',
    }}>
      {children}
    </Text>
  );
}

