'use client';

/**
 * Industry Comparison Component
 * 
 * Displays how a report's scores compare to industry benchmarks.
 * Shows:
 * - Detected industry with override option
 * - Overall score vs industry average
 * - Percentile ranking
 * - Dimension-by-dimension comparison
 */

import { useState, useEffect } from 'react';
import type { Industry } from '@/lib/analysis/utils/industry-classifier';
import { getIndustryDisplayName, getAllIndustries } from '@/lib/analysis/utils/industry-classifier';

// ============================================================================
// Types
// ============================================================================

interface BenchmarkData {
  industry: Industry;
  totalAnalyses: number;
  avgOverallScore: number | null;
  avgScores: {
    colors: number | null;
    typography: number | null;
    whitespace: number | null;
    complexity: number | null;
    layout: number | null;
    cta: number | null;
    hierarchy: number | null;
  };
  hasEnoughData: boolean;
}

interface ComparisonResult {
  userScore: number;
  industryAvg: number | null;
  percentile: number | null;
  comparison: 'above' | 'below' | 'average' | 'unknown';
  difference: number | null;
}

interface IndustryComparisonProps {
  reportId: string;
  detectedIndustry: Industry;
  overallScore: number;
  scores: {
    colors?: number | null;
    typography?: number | null;
    whitespace?: number | null;
    complexity?: number | null;
    layout?: number | null;
    cta?: number | null;
    hierarchy?: number | null;
  };
  isPro?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export default function IndustryComparison({
  reportId,
  detectedIndustry,
  overallScore,
  scores,
  isPro = false,
}: IndustryComparisonProps) {
  const [selectedIndustry, setSelectedIndustry] = useState<Industry>(detectedIndustry);
  const [benchmark, setBenchmark] = useState<BenchmarkData | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOverride, setShowOverride] = useState(false);

  useEffect(() => {
    fetchBenchmarks(selectedIndustry);
  }, [selectedIndustry]);

  const fetchBenchmarks = async (industry: Industry) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/benchmarks/${industry}`);
      if (response.ok) {
        const data = await response.json();
        setBenchmark(data.benchmark);
        setComparison(data.comparison);
      }
    } catch (error) {
      console.error('Error fetching benchmarks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIndustryChange = (newIndustry: Industry) => {
    setSelectedIndustry(newIndustry);
    setShowOverride(false);
  };

  // Locked preview for free users
  if (!isPro) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Industry Comparison</h3>
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Pro
          </span>
        </div>
        
        {/* Blurred preview */}
        <div className="relative">
          <div className="blur-sm pointer-events-none">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
                <div className="h-8 bg-slate-100 rounded w-48"></div>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 bg-emerald-100 rounded-full mx-auto"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-slate-50 rounded-lg"></div>
              <div className="h-20 bg-slate-50 rounded-lg"></div>
            </div>
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <a
              href="/pricing"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors"
            >
              Upgrade to Compare
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Industry Comparison</h3>
          <p className="text-sm text-slate-500">See how you compare to similar sites</p>
        </div>
        
        {/* Industry selector */}
        <div className="relative">
          <button
            onClick={() => setShowOverride(!showOverride)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
          >
            {getIndustryDisplayName(selectedIndustry)}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showOverride && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
              <div className="p-2">
                <p className="text-xs text-slate-500 px-2 pb-2">Select industry:</p>
                {getAllIndustries().map((ind) => (
                  <button
                    key={ind.value}
                    onClick={() => handleIndustryChange(ind.value)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                      selectedIndustry === ind.value
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {ind.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !benchmark?.hasEnoughData ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium">Not enough data yet</p>
          <p className="text-sm text-slate-500 mt-1">
            We need at least 10 analyses in {getIndustryDisplayName(selectedIndustry)} to show benchmarks
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Current: {benchmark?.totalAnalyses || 0} analyses
          </p>
        </div>
      ) : (
        <>
          {/* Main comparison */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Your score */}
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-1">Your Score</p>
              <div className="text-4xl font-bold text-slate-900">{overallScore}</div>
            </div>
            
            {/* Industry average */}
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-1">Industry Average</p>
              <div className="text-4xl font-bold text-slate-400">
                {benchmark?.avgOverallScore?.toFixed(0) || '—'}
              </div>
            </div>
          </div>

          {/* Percentile badge */}
          {comparison && comparison.percentile !== null && (
            <div className="flex items-center justify-center mb-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                comparison.comparison === 'above'
                  ? 'bg-emerald-100 text-emerald-700'
                  : comparison.comparison === 'below'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-700'
              }`}>
                {comparison.comparison === 'above' && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {comparison.comparison === 'below' && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="font-semibold">
                  {comparison.comparison === 'above' && `Top ${100 - comparison.percentile}%`}
                  {comparison.comparison === 'below' && `Bottom ${comparison.percentile}%`}
                  {comparison.comparison === 'average' && 'Average'}
                </span>
                <span className="text-sm opacity-75">
                  ({comparison.difference && comparison.difference > 0 ? '+' : ''}{comparison.difference} points)
                </span>
              </div>
            </div>
          )}

          {/* Dimension comparison */}
          <div className="border-t border-slate-200 pt-6">
            <h4 className="text-sm font-medium text-slate-700 mb-4">Score by Dimension</h4>
            <div className="space-y-3">
              {[
                { key: 'colors', label: 'Colours' },
                { key: 'typography', label: 'Typography' },
                { key: 'whitespace', label: 'Whitespace' },
                { key: 'layout', label: 'Layout' },
                { key: 'cta', label: 'CTA Design' },
                { key: 'hierarchy', label: 'Hierarchy' },
              ].map(({ key, label }) => {
                const userValue = scores[key as keyof typeof scores];
                const avgValue = benchmark?.avgScores[key as keyof typeof benchmark.avgScores];
                const diff = userValue && avgValue ? userValue - avgValue : null;
                
                return (
                  <div key={key} className="flex items-center gap-4">
                    <span className="text-sm text-slate-600 w-24">{label}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${userValue || 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-900 w-10 text-right">
                      {userValue?.toFixed(0) || '—'}
                    </span>
                    {diff !== null && (
                      <span className={`text-xs w-12 text-right ${
                        diff > 2 ? 'text-emerald-600' : diff < -2 ? 'text-amber-600' : 'text-slate-400'
                      }`}>
                        {diff > 0 ? '+' : ''}{diff.toFixed(0)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Data note */}
          <p className="text-xs text-slate-400 mt-6 text-center">
            Based on {benchmark?.totalAnalyses.toLocaleString()} {getIndustryDisplayName(selectedIndustry)} sites
          </p>
        </>
      )}
    </div>
  );
}

