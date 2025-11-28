'use client';

/**
 * Validation Timeline Component
 * 
 * Displays a visual timeline of milestones for validating design changes.
 * Shows users what to expect and when during the measurement period.
 */

import { useState } from 'react';
import type { ValidationMilestone } from '@/lib/analysis/core/types';

// ============================================================================
// Types
// ============================================================================

interface ValidationTimelineProps {
  milestones: ValidationMilestone[];
  measurementPeriod: string;
  measurementTips?: string;
  target?: string;
  confidence?: 'low' | 'medium' | 'high';
  className?: string;
  compact?: boolean; // Compact view for recommendation cards
}

// ============================================================================
// Helper Functions
// ============================================================================

function getConfidenceIndicator(confidence: 'low' | 'medium' | 'high'): { label: string; color: string; dots: string } {
  switch (confidence) {
    case 'high':
      return { label: 'High Confidence', color: 'text-emerald-600', dots: '●●●' };
    case 'medium':
      return { label: 'Medium Confidence', color: 'text-amber-600', dots: '●●○' };
    case 'low':
      return { label: 'Low Confidence', color: 'text-slate-500', dots: '●○○' };
  }
}

function getMilestoneIcon(name: string): string {
  if (name.toLowerCase().includes('implement')) return '🚀';
  if (name.toLowerCase().includes('baseline')) return '📊';
  if (name.toLowerCase().includes('collect') || name.toLowerCase().includes('data')) return '📈';
  if (name.toLowerCase().includes('check')) return '👀';
  if (name.toLowerCase().includes('compare')) return '⚖️';
  if (name.toLowerCase().includes('decision')) return '✅';
  return '📌';
}

function getMilestoneColor(status?: 'pending' | 'current' | 'completed'): string {
  switch (status) {
    case 'completed':
      return 'bg-emerald-500 border-emerald-500';
    case 'current':
      return 'bg-indigo-500 border-indigo-500';
    case 'pending':
    default:
      return 'bg-white border-slate-300';
  }
}

// ============================================================================
// Component
// ============================================================================

export default function ValidationTimeline({
  milestones,
  measurementPeriod,
  measurementTips,
  target,
  confidence = 'medium',
  className = '',
  compact = false,
}: ValidationTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const confidenceInfo = getConfidenceIndicator(confidence);

  if (compact) {
    // Compact version for recommendation cards
    return (
      <div className={`border border-slate-200 rounded-lg overflow-hidden ${className}`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 bg-slate-50 flex items-center justify-between hover:bg-slate-100 transition-colors"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">📅</span>
            <span className="text-sm font-medium text-slate-700">
              Validation Timeline: {measurementPeriod}
            </span>
          </div>
          <svg 
            className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isExpanded && (
          <div className="px-4 py-3 space-y-3">
            {/* Confidence indicator */}
            <div className="flex items-center gap-2">
              <span className={`text-sm ${confidenceInfo.color}`}>{confidenceInfo.dots}</span>
              <span className="text-sm text-slate-600">{confidenceInfo.label}</span>
            </div>
            
            {/* Target if available */}
            {target && (
              <div className="text-sm text-slate-700">
                <span className="font-medium">Target:</span> {target}
              </div>
            )}
            
            {/* Compact milestone list */}
            <div className="space-y-2">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-base flex-shrink-0">{getMilestoneIcon(milestone.name)}</span>
                  <div>
                    <span className="font-medium text-slate-800">{milestone.name}</span>
                    <span className="text-slate-500"> · {milestone.duration}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Measurement tips */}
            {measurementTips && (
              <div className="p-2 bg-indigo-50 rounded text-xs text-indigo-700">
                💡 {measurementTips}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full timeline view
  return (
    <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📅</span>
            <div>
              <h3 className="font-semibold text-slate-900">Validation Timeline</h3>
              <p className="text-sm text-slate-600">Track your progress over {measurementPeriod}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-lg ${confidenceInfo.color}`}>{confidenceInfo.dots}</span>
            <span className="text-sm text-slate-600">{confidenceInfo.label}</span>
          </div>
        </div>
      </div>
      
      {/* Target metric */}
      {target && (
        <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-100">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <span className="text-sm font-medium text-emerald-800">Target: {target}</span>
          </div>
        </div>
      )}
      
      {/* Timeline */}
      <div className="p-5">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
          
          {/* Milestones */}
          <div className="space-y-6">
            {milestones.map((milestone, index) => (
              <div key={index} className="relative flex items-start gap-4 pl-10">
                {/* Milestone marker */}
                <div className={`absolute left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center ${getMilestoneColor(milestone.status)}`}>
                  {milestone.status === 'completed' && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {milestone.status === 'current' && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                
                {/* Milestone content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getMilestoneIcon(milestone.name)}</span>
                    <h4 className="font-medium text-slate-900">{milestone.name}</h4>
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-medium text-slate-600">
                      {milestone.duration}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Measurement tips */}
      {measurementTips && (
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0">💡</span>
            <div>
              <h4 className="text-sm font-medium text-slate-900 mb-1">How to Measure</h4>
              <p className="text-sm text-slate-600">{measurementTips}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Mini Timeline (for inline display)
// ============================================================================

interface MiniTimelineProps {
  measurementPeriod: string;
  confidence?: 'low' | 'medium' | 'high';
}

export function MiniTimeline({ measurementPeriod, confidence = 'medium' }: MiniTimelineProps) {
  const confidenceInfo = getConfidenceIndicator(confidence);
  
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="flex items-center gap-1.5">
        <span>📅</span>
        <span className="text-slate-600">{measurementPeriod}</span>
      </span>
      <span className={`flex items-center gap-1 ${confidenceInfo.color}`}>
        <span className="text-xs">{confidenceInfo.dots}</span>
        <span className="text-xs">{confidenceInfo.label}</span>
      </span>
    </div>
  );
}

