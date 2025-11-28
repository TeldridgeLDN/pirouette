'use client';

/**
 * Onboarding Checklist
 * 
 * Shows progress through onboarding steps.
 * Collapsible card that persists until all steps complete.
 */

import { useState } from 'react';
import Link from 'next/link';
import type { OnboardingStep } from '@/hooks/useOnboarding';

interface OnboardingChecklistProps {
  steps: OnboardingStep[];
  progress: number;
  isComplete: boolean;
  onDismiss?: () => void;
}

export default function OnboardingChecklist({
  steps,
  progress,
  isComplete,
  onDismiss,
}: OnboardingChecklistProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if complete or dismissed
  if (isComplete || isDismissed) return null;

  const completedCount = steps.filter(s => s.completed).length;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-lg">🚀</span>
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-slate-900">Getting Started</h3>
            <p className="text-xs text-slate-500">
              {completedCount} of {steps.length} complete
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Progress circle */}
          <div className="relative w-10 h-10">
            <svg className="w-10 h-10 -rotate-90">
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="4"
              />
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${progress} 100`}
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-slate-700">
              {progress}%
            </span>
          </div>
          
          {/* Expand/collapse */}
          <svg
            className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Steps */}
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="border-t border-slate-100 pt-3 space-y-2">
            {steps.map((step, index) => (
              <StepItem key={step.id} step={step} index={index} />
            ))}
          </div>

          {/* Dismiss option */}
          <button
            onClick={handleDismiss}
            className="w-full text-center text-xs text-slate-400 hover:text-slate-600 mt-3 py-1"
          >
            Dismiss checklist
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Step Item Component
// ============================================================================

function StepItem({ step, index }: { step: OnboardingStep; index: number }) {
  const content = (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
        step.completed
          ? 'bg-emerald-50'
          : 'bg-slate-50 hover:bg-slate-100'
      }`}
    >
      {/* Checkbox */}
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
          step.completed
            ? 'bg-emerald-500 text-white'
            : 'bg-white border-2 border-slate-300 text-slate-400'
        }`}
      >
        {step.completed ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <span className="text-xs font-medium">{index + 1}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`font-medium ${
            step.completed ? 'text-emerald-700' : 'text-slate-900'
          }`}
        >
          {step.title}
        </p>
        <p
          className={`text-sm ${
            step.completed ? 'text-emerald-600' : 'text-slate-500'
          }`}
        >
          {step.description}
        </p>
      </div>

      {/* Arrow for incomplete steps with href */}
      {!step.completed && step.href && (
        <svg
          className="w-5 h-5 text-slate-400 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      )}
    </div>
  );

  // Wrap in Link if href provided and not complete
  if (!step.completed && step.href) {
    return <Link href={step.href}>{content}</Link>;
  }

  return content;
}

