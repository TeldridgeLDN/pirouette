'use client';

/**
 * Quality Banner Component
 * 
 * Displays quality validation status for analysis reports.
 * Shows warnings in development mode, errors in production.
 */

import { useState } from 'react';
import type { QualityValidationResult } from '@/lib/analysis/utils/quality-validator';
import {
  getQualityLevel,
  getQualityBadge,
  getPriorityImprovements,
  QUALITY_THRESHOLD,
} from '@/lib/analysis/utils/quality-validator';

interface QualityBannerProps {
  validation: QualityValidationResult;
  showDetails?: boolean;
  className?: string;
}

export function QualityBanner({ 
  validation, 
  showDetails = false,
  className = '' 
}: QualityBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const level = getQualityLevel(validation.overallScore);
  const badge = getQualityBadge(validation.overallScore);
  const improvements = getPriorityImprovements(validation);
  
  // Don't show banner if quality is excellent
  if (level === 'excellent') {
    return null;
  }
  
  // Determine banner style based on quality level
  const bannerStyles = {
    good: 'bg-blue-50 border-blue-200 text-blue-800',
    fair: 'bg-amber-50 border-amber-200 text-amber-800',
    poor: 'bg-red-50 border-red-200 text-red-800',
  };
  
  const iconStyles = {
    good: 'text-blue-500',
    fair: 'text-amber-500',
    poor: 'text-red-500',
  };
  
  const progressStyles = {
    good: 'bg-blue-500',
    fair: 'bg-amber-500',
    poor: 'bg-red-500',
  };
  
  return (
    <div className={`rounded-lg border p-4 ${bannerStyles[level]} ${className}`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${iconStyles[level]}`}>
          {level === 'poor' ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">
                {badge.emoji} {badge.label}
              </p>
              <p className="text-sm opacity-80 mt-0.5">
                Quality score: {validation.overallScore}% 
                {validation.overallScore < QUALITY_THRESHOLD && (
                  <span className="ml-1">(threshold: {QUALITY_THRESHOLD}%)</span>
                )}
              </p>
            </div>
            
            {/* Quality Score Badge */}
            <div className="flex-shrink-0">
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="opacity-20"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray={`${(validation.overallScore / 100) * 126} 126`}
                    className={progressStyles[level]}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                  {validation.overallScore}
                </span>
              </div>
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="flex gap-4 mt-3 text-sm opacity-80">
            <span>✓ {validation.summary.passed} passed</span>
            {validation.summary.failed > 0 && (
              <span>✗ {validation.summary.failed} failed</span>
            )}
            {validation.summary.warnings > 0 && (
              <span>⚠ {validation.summary.warnings} warnings</span>
            )}
          </div>
          
          {/* Expand/Collapse for Details */}
          {(showDetails || improvements.length > 0) && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-sm font-medium underline-offset-2 hover:underline flex items-center gap-1"
            >
              {isExpanded ? 'Hide details' : 'Show details'}
              <svg 
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
          
          {/* Expanded Details */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-current/20 space-y-3">
              {/* Priority Improvements */}
              {improvements.length > 0 && (
                <div>
                  <p className="font-medium text-sm mb-2">Priority Improvements:</p>
                  <ul className="space-y-1.5">
                    {improvements.map((improvement, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="flex-shrink-0">•</span>
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Check Results */}
              {showDetails && (
                <div>
                  <p className="font-medium text-sm mb-2">All Checks:</p>
                  <div className="grid gap-2">
                    {validation.checkResults.map((result) => (
                      <div 
                        key={result.check.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="flex items-center gap-2">
                          {result.passed ? (
                            <span className="text-emerald-600">✓</span>
                          ) : (
                            <span className="text-red-600">✗</span>
                          )}
                          {result.check.name}
                        </span>
                        <span className="text-xs opacity-70">
                          {result.score}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Development Mode Notice */}
      {process.env.NODE_ENV === 'development' && validation.overallScore < QUALITY_THRESHOLD && (
        <div className="mt-3 pt-3 border-t border-current/20 text-xs opacity-70">
          <strong>Dev Mode:</strong> This report would be hidden in production (below {QUALITY_THRESHOLD}% threshold).
        </div>
      )}
    </div>
  );
}

/**
 * Compact Quality Badge for lists/cards
 */
export function QualityBadge({ score }: { score: number }) {
  const badge = getQualityBadge(score);
  const level = getQualityLevel(score);
  
  const badgeColors = {
    excellent: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    good: 'bg-blue-100 text-blue-700 border-blue-200',
    fair: 'bg-amber-100 text-amber-700 border-amber-200',
    poor: 'bg-red-100 text-red-700 border-red-200',
  };
  
  return (
    <span 
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${badgeColors[level]}`}
      title={`Quality Score: ${score}%`}
    >
      <span>{badge.emoji}</span>
      <span>{score}%</span>
    </span>
  );
}

export default QualityBanner;


