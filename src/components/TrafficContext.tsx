'use client';

/**
 * Traffic Context Component
 * 
 * Displays traffic-tier-specific advice and context in analysis reports.
 * Helps users understand how their traffic level affects recommendation
 * validation and implementation strategies.
 */

import { useState } from 'react';
import {
  TrafficClassification,
  getTrafficClassification,
  getTrafficTierBadge,
  formatWeeklyVisitors,
  isABTestingViable,
} from '@/lib/analysis/utils/traffic-classifier';

// ============================================================================
// Types
// ============================================================================

interface TrafficContextProps {
  weeklyVisitors?: number;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export default function TrafficContext({ weeklyVisitors, className = '' }: TrafficContextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // If no traffic data, show prompt to add it
  if (!weeklyVisitors || weeklyVisitors <= 0) {
    return (
      <div className={`bg-slate-50 rounded-xl border border-slate-200 p-6 ${className}`}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">📊</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-1">Add Your Traffic Data</h3>
            <p className="text-sm text-slate-600 mb-3">
              Providing your weekly visitor count helps us give you more accurate recommendations, 
              realistic validation timelines, and better revenue estimates.
            </p>
            <p className="text-xs text-slate-500">
              Don&apos;t know your traffic? Check Google Analytics or your hosting dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  const classification = getTrafficClassification(weeklyVisitors);
  const badge = getTrafficTierBadge(classification.tier);
  const canABTest = isABTestingViable(weeklyVisitors);
  
  return (
    <div className={`rounded-xl border overflow-hidden ${className}`}>
      {/* Header - Always visible */}
      <div className={`${badge.bgColor} border-b border-slate-200 p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{badge.emoji}</span>
            <div>
              <h3 className={`font-semibold ${badge.color}`}>
                {classification.advice.headline}
              </h3>
              <p className="text-sm text-slate-600">
                {formatWeeklyVisitors(weeklyVisitors)} weekly visitors • {classification.label}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            aria-expanded={isExpanded}
            aria-controls="traffic-context-details"
          >
            {isExpanded ? 'Hide' : 'Learn more'}
            <svg 
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Summary - Always visible */}
      <div className="bg-white p-4 border-b border-slate-100">
        <p className="text-sm text-slate-700">{classification.advice.summary}</p>
        
        {/* Quick stats row */}
        <div className="flex flex-wrap gap-4 mt-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Validation time:</span>
            <span className="font-medium text-slate-900">{classification.validationPeriod}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">A/B Testing:</span>
            <span className={`font-medium ${canABTest ? 'text-emerald-600' : 'text-amber-600'}`}>
              {canABTest ? 'Recommended' : 'Not viable'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Estimate confidence:</span>
            <span className="font-medium text-slate-900">
              {Math.round(classification.confidenceMultiplier * 100)}%
            </span>
          </div>
        </div>
        
        {/* Warning message for low traffic */}
        {classification.advice.warningMessage && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              ⚠️ {classification.advice.warningMessage}
            </p>
          </div>
        )}
      </div>
      
      {/* Expanded details */}
      {isExpanded && (
        <div id="traffic-context-details" className="bg-slate-50 p-4">
          {/* Bullet points */}
          <h4 className="text-sm font-semibold text-slate-900 mb-2">
            Recommendations for your traffic level:
          </h4>
          <ul className="space-y-2 mb-4">
            {classification.advice.bulletPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{point}</span>
              </li>
            ))}
          </ul>
          
          {/* Testing strategy */}
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <h4 className="text-sm font-semibold text-slate-900 mb-1">
              Testing Strategy
            </h4>
            <p className="text-sm text-slate-600">
              {classification.advice.testingStrategy}
            </p>
          </div>
          
          {/* Traffic tier explanation */}
          <div className="mt-4 text-xs text-slate-500">
            <p>
              <strong>Traffic tiers:</strong> Very Low (&lt;100/wk), Low (100-1K/wk), Medium (1K-10K/wk), High (&gt;10K/wk)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Compact Version (for inline use)
// ============================================================================

interface TrafficBadgeProps {
  weeklyVisitors?: number;
  showLabel?: boolean;
}

export function TrafficBadge({ weeklyVisitors, showLabel = true }: TrafficBadgeProps) {
  if (!weeklyVisitors || weeklyVisitors <= 0) return null;
  
  const classification = getTrafficClassification(weeklyVisitors);
  const badge = getTrafficTierBadge(classification.tier);
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${badge.bgColor} ${badge.color}`}>
      <span>{badge.emoji}</span>
      {showLabel && <span>{classification.label}</span>}
      {!showLabel && <span>{formatWeeklyVisitors(weeklyVisitors)}/wk</span>}
    </span>
  );
}

// ============================================================================
// Mini Context (for recommendation cards)
// ============================================================================

interface MiniTrafficContextProps {
  weeklyVisitors?: number;
  validationWeeks?: number;
}

export function MiniTrafficContext({ weeklyVisitors, validationWeeks }: MiniTrafficContextProps) {
  if (!weeklyVisitors || weeklyVisitors <= 0) return null;
  
  const classification = getTrafficClassification(weeklyVisitors);
  const actualWeeks = validationWeeks ?? classification.validationWeeks;
  
  return (
    <div className="text-xs text-slate-500 flex items-center gap-2">
      <span>📅 Validation: ~{actualWeeks} weeks at your traffic level</span>
    </div>
  );
}

