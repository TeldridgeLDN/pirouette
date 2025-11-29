'use client';

/**
 * Trackable Button Component
 *
 * A button/link wrapper that automatically tracks clicks with Plausible Analytics.
 * Adapted from portfolio-redesign skill.
 */

import Link from 'next/link';
import { trackCTA } from '@/lib/analytics';

interface TrackableButtonProps {
  /** Link destination (renders as Link) */
  href?: string;
  /** Custom click handler (renders as button) */
  onClick?: () => void;
  /** Button variant for styling and tracking */
  variant?: 'primary' | 'secondary';
  /** Descriptive label for analytics (required) */
  label: string;
  /** Page location for analytics context */
  location?: string;
  /** Additional CSS classes */
  className?: string;
  /** Button content */
  children: React.ReactNode;
  /** Link target attribute */
  target?: string;
  /** Link rel attribute */
  rel?: string;
  /** Disable the button */
  disabled?: boolean;
  /** Button type (when rendered as button) */
  type?: 'button' | 'submit';
}

export default function TrackableButton({
  href,
  onClick,
  variant = 'primary',
  label,
  location,
  className = '',
  children,
  target,
  rel,
  disabled = false,
  type = 'button',
}: TrackableButtonProps) {
  const handleClick = () => {
    // Track the CTA click
    trackCTA(variant, label, location);

    // Call custom onClick if provided
    if (onClick) {
      onClick();
    }
  };

  // Base classes for both buttons and links
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200';

  // Variant-specific classes
  const variantClasses =
    variant === 'primary'
      ? 'px-8 py-4 text-white hover:-translate-y-1'
      : 'px-8 py-4 bg-slate-100 text-slate-700 hover:bg-slate-200';

  // Primary gradient style
  const primaryStyle =
    variant === 'primary'
      ? {
          background: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
          boxShadow: '0 4px 14px 0 rgba(249, 115, 22, 0.39)',
        }
      : {};

  const combinedClasses =
    `${baseClasses} ${variantClasses} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`.trim();

  // Render as Link if href is provided
  if (href) {
    return (
      <Link
        href={href}
        onClick={handleClick}
        className={combinedClasses}
        style={primaryStyle}
        target={target}
        rel={rel}
      >
        {children}
      </Link>
    );
  }

  // Render as button
  return (
    <button
      onClick={handleClick}
      className={combinedClasses}
      style={primaryStyle}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

