'use client';

/**
 * Traffic Context Component
 * 
 * Displays traffic-tier-specific advice and context in analysis reports.
 * Helps users understand how their traffic level affects recommendation
 * validation and implementation strategies.
 * 
 * Pro users can add/update their traffic data directly on the report page.
 */

import { useState } from 'react';
import Link from 'next/link';
import {
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
  reportId?: string;
  isPro?: boolean;
  onTrafficUpdate?: (newTraffic: number) => void;
  className?: string;
}

// ============================================================================
// Traffic Input Component (Pro Feature)
// ============================================================================

interface TrafficInputProps {
  reportId: string;
  currentValue?: number;
  onUpdate: (newTraffic: number) => void;
}

function TrafficInput({ reportId, currentValue, onUpdate }: TrafficInputProps) {
  const [value, setValue] = useState(currentValue?.toString() || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0) {
      setError('Please enter a valid positive number');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/reports/${reportId}/traffic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weeklyTraffic: numValue }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update traffic data');
      }
      
      setSuccess(true);
      onUpdate(numValue);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label htmlFor="traffic-input" className="sr-only">
            Weekly visitors
          </label>
          <div className="relative">
            <input
              id="traffic-input"
              type="number"
              min="0"
              step="1"
              placeholder="e.g. 5000"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(null);
                setSuccess(false);
              }}
              className={`w-full px-4 py-2.5 pr-20 border rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                error ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
              }`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              /week
            </span>
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading || !value}
          className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[100px]"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </>
          ) : (
            currentValue ? 'Update' : 'Save'
          )}
        </button>
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
      
      {success && (
        <p className="mt-2 text-sm text-emerald-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Traffic data saved! Recommendations will update on next page load.
        </p>
      )}
      
      <p className="mt-2 text-xs text-slate-500">
        💡 Find this in Google Analytics → Reports → Acquisition → Traffic acquisition (last 7 days)
      </p>
    </form>
  );
}

// ============================================================================
// Component
// ============================================================================

export default function TrafficContext({ 
  weeklyVisitors, 
  reportId,
  isPro = false,
  onTrafficUpdate,
  className = '' 
}: TrafficContextProps) {
  // All hooks must be called unconditionally at the top (React hooks rules)
  const [isExpanded, setIsExpanded] = useState(false);
  const [localTraffic, setLocalTraffic] = useState(weeklyVisitors);
  const [isEditing, setIsEditing] = useState(false);
  
  const handleTrafficUpdate = (newTraffic: number) => {
    setLocalTraffic(newTraffic);
    onTrafficUpdate?.(newTraffic);
  };
  
  // If no traffic data, show prompt to add it
  if (!localTraffic || localTraffic <= 0) {
    return (
      <div className={`bg-slate-50 rounded-xl border border-slate-200 p-6 ${className}`}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">📊</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-900">Add Your Traffic Data</h3>
              {isPro && (
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded">
                  PRO
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 mb-3">
              Providing your weekly visitor count helps us give you more accurate recommendations, 
              realistic validation timelines, and better revenue estimates.
            </p>
            
            {/* Pro users get the input field */}
            {isPro && reportId ? (
              <TrafficInput 
                reportId={reportId} 
                onUpdate={handleTrafficUpdate}
              />
            ) : (
              <>
                <p className="text-xs text-slate-500 mb-3">
                  Don&apos;t know your traffic? Check Google Analytics or your hosting dashboard.
                </p>
                {!isPro && (
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Upgrade to add traffic data
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  const classification = getTrafficClassification(localTraffic);
  const badge = getTrafficTierBadge(classification.tier);
  const canABTest = isABTestingViable(localTraffic);
  
  return (
    <div className={`rounded-xl border overflow-hidden ${className}`}>
      {/* Header - Always visible */}
      <div className={`${badge.bgColor} border-b border-slate-200 p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{badge.emoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`font-semibold ${badge.color}`}>
                  {classification.advice.headline}
                </h3>
                {isPro && (
                  <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-medium rounded">
                    PRO
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600">
                {formatWeeklyVisitors(localTraffic)} weekly visitors • {classification.label}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Edit button for Pro users */}
            {isPro && reportId && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors px-2 py-1 rounded hover:bg-indigo-50"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit
              </button>
            )}
            
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
      </div>
      
      {/* Edit mode - inline traffic input */}
      {isEditing && isPro && reportId && (
        <div className="p-4 bg-white border-b border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-slate-700">Update Weekly Traffic</h4>
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>
          <TrafficInput 
            reportId={reportId} 
            currentValue={localTraffic}
            onUpdate={(newTraffic) => {
              handleTrafficUpdate(newTraffic);
              setIsEditing(false);
            }}
          />
        </div>
      )}
      
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

