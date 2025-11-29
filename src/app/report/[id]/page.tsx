'use client';

/**
 * Report Page
 * 
 * Displays the complete analysis report with:
 * - Overall score
 * - 7 dimension scores
 * - Prioritized recommendations
 * - Screenshot preview
 * 
 * Supports both authenticated and anonymous users.
 * Shows email capture modal for anonymous users.
 */

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import EmailCaptureModal from '@/components/EmailCaptureModal';
import TrafficContext from '@/components/TrafficContext';
import ValidationTimeline from '@/components/ValidationTimeline';
import HistoricalTracking from '@/components/HistoricalTracking';
import CompetitorComparison from '@/components/CompetitorComparison';
import { useUserPlan } from '@/hooks/useUserPlan';
import { shouldSortByEase, getTrafficClassification } from '@/lib/analysis/utils/traffic-classifier';
import { trackReportViewed, trackAnalysisCompleted, trackRecommendationClicked, trackPDFDownloaded } from '@/lib/analytics';

// ============================================================================
// Types
// ============================================================================

interface RevenueImpact {
  potentialRevenue: number;
  confidenceLevel: 'low' | 'medium' | 'high';
  timeToValidate: string;
  calculationMethod: string;
}

interface ValidationMilestone {
  name: string;
  description: string;
  duration: string;
  status?: 'pending' | 'current' | 'completed';
}

interface SuccessMetrics {
  improvementRange: string;
  visitorThreshold: number;
  measurementPeriod: string;
  measurementTips?: string;
  target?: string;
  confidence?: 'low' | 'medium' | 'high';
  milestones?: ValidationMilestone[];
}

interface ROIScore {
  score: number;
  normalizedScore: number;
  category: 'quick-win' | 'strategic' | 'long-term';
  breakdown: {
    impactScore: number;
    effortMinutes: number;
    timeToResultsWeeks: number;
  };
}

interface Recommendation {
  id: string;
  dimension: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  example?: string;
  changeType?: 'ui' | 'content' | 'structural' | 'performance' | 'accessibility' | 'other';
  revenueImpact?: RevenueImpact;
  successMetrics?: SuccessMetrics;
  roiScore?: ROIScore;
  timeToResultsWeeks?: number;
  actionItems?: string[];
}

interface Report {
  id: string;
  url: string;
  screenshot_url?: string;
  overall_score: number;
  colors_score?: number;
  whitespace_score?: number;
  complexity_score?: number;
  typography_score?: number;
  layout_score?: number;
  cta_score?: number;
  hierarchy_score?: number;
  dimensions: Record<string, unknown>;
  recommendations: Recommendation[];
  created_at: string;
  isAnonymous?: boolean;
  weeklyTraffic?: number;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

// ============================================================================
// Dimension Configuration
// ============================================================================

const DIMENSIONS = [
  { key: 'typography_score', name: 'Typography', icon: 'Aa', color: 'indigo' },
  { key: 'colors_score', name: 'Colour & Contrast', icon: '🎨', color: 'emerald' },
  { key: 'whitespace_score', name: 'Whitespace', icon: '◻️', color: 'sky' },
  { key: 'complexity_score', name: 'Visual Hierarchy', icon: '📊', color: 'violet' },
  { key: 'layout_score', name: 'Layout', icon: '📐', color: 'amber' },
  { key: 'cta_score', name: 'CTA Design', icon: '🎯', color: 'orange' },
  { key: 'hierarchy_score', name: 'Content Hierarchy', icon: '📑', color: 'rose' },
];

// ============================================================================
// Helper Functions
// ============================================================================

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-red-500';
}

function getScoreGradient(score: number): string {
  if (score >= 80) return 'from-emerald-500 to-teal-500';
  if (score >= 60) return 'from-amber-500 to-orange-500';
  return 'from-red-500 to-rose-500';
}

function getPriorityBadge(priority: string): { bg: string; text: string } {
  switch (priority) {
    case 'high':
      return { bg: 'bg-red-100', text: 'text-red-700' };
    case 'medium':
      return { bg: 'bg-amber-100', text: 'text-amber-700' };
    case 'low':
      return { bg: 'bg-emerald-100', text: 'text-emerald-700' };
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-700' };
  }
}

function getEffortBadge(effort: string): { bg: string; text: string; label: string; timeEstimate: string } {
  switch (effort) {
    case 'low':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Quick Fix', timeEstimate: '~15 min' };
    case 'medium':
      return { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Medium Effort', timeEstimate: '~2 hours' };
    case 'high':
      return { bg: 'bg-red-50', text: 'text-red-700', label: 'Major Change', timeEstimate: '~1 day' };
    default:
      return { bg: 'bg-slate-50', text: 'text-slate-700', label: effort, timeEstimate: '' };
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ============================================================================
// Components
// ============================================================================

function ScoreRing({ score, size = 'lg' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const dimensions = {
    sm: { width: 64, radius: 26, stroke: 4 },
    md: { width: 80, radius: 32, stroke: 5 },
    lg: { width: 120, radius: 50, stroke: 8 },
  };
  
  const { width, radius, stroke } = dimensions[size];
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  
  return (
    <div className="relative" style={{ width, height: width }}>
      <svg className="transform -rotate-90" width={width} height={width}>
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="none"
          className="text-slate-100"
        />
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          stroke="url(#scoreGradient)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444'} />
            <stop offset="100%" stopColor={score >= 80 ? '#14B8A6' : score >= 60 ? '#F97316' : '#F43F5E'} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-bold ${size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-2xl' : 'text-lg'} ${getScoreColor(score)}`}>
          {score}
        </span>
      </div>
    </div>
  );
}

// Dimension data mapping from analyzer keys to display keys
const DIMENSION_KEY_MAP: Record<string, string> = {
  'typography_score': 'typography',
  'colors_score': 'colors',
  'whitespace_score': 'whitespace',
  'complexity_score': 'complexity',
  'layout_score': 'layout',
  'cta_score': 'ctaProminence',
  'hierarchy_score': 'hierarchy',
};

interface DimensionData {
  score?: number;
  findings?: string[];
  data?: {
    fontFamilies?: string[];
    fontSizes?: number[];
    minFontSize?: number;
    maxFontSize?: number;
    uniqueColors?: string[];
    dominantColors?: string[];
    totalCTAs?: number;
    buttonCTAs?: number;
    linkCTAs?: number;
    ctaTexts?: string[];
    elementCount?: number;
    complexity?: string;
  };
}

// Benchmark averages from 38 award-winning sites
const BENCHMARK_AVERAGES: Record<string, number> = {
  typography_score: 72,
  colors_score: 51,
  whitespace_score: 62,
  complexity_score: 53,
  layout_score: 62,
  cta_score: 70,
  hierarchy_score: 53,
};

function DimensionCard({ 
  name, 
  score, 
  icon,
  dimensionKey,
  dimensionData,
  isPro,
}: { 
  name: string; 
  score: number | undefined; 
  icon: string;
  dimensionKey: string;
  dimensionData?: DimensionData;
  isPro: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayScore = score ?? 0;
  const findings = dimensionData?.findings || [];
  const hasFindings = findings.length > 0;
  const benchmarkAverage = BENCHMARK_AVERAGES[dimensionKey] || 62;
  const isAboveBenchmark = displayScore >= benchmarkAverage;
  const benchmarkDiff = Math.abs(displayScore - benchmarkAverage);
  
  return (
    <div className={`bg-white rounded-xl border transition-all duration-200 ${
      isExpanded ? 'border-indigo-200 shadow-md col-span-2 sm:col-span-3 lg:col-span-4 xl:col-span-7' : 'border-slate-100 hover:shadow-md'
    }`}>
      <button
        onClick={() => isPro && hasFindings && setIsExpanded(!isExpanded)}
        className={`w-full p-4 text-left ${isPro && hasFindings ? 'cursor-pointer' : 'cursor-default'}`}
        disabled={!isPro || !hasFindings}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl">{icon}</span>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${getScoreColor(displayScore)}`}>
              {displayScore}
            </span>
            {isPro && hasFindings && (
              <svg 
                className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>
        <div className="text-sm font-medium text-slate-700 mb-2">{name}</div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${getScoreGradient(displayScore)}`}
            style={{ width: `${displayScore}%` }}
          />
        </div>
        
        {/* Pro teaser for non-Pro users */}
        {!isPro && hasFindings && (
          <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>See insights (Pro)</span>
          </div>
        )}
      </button>
      
      {/* Expanded Pro content */}
      {isExpanded && isPro && hasFindings && (
        <div className="px-4 pb-4 border-t border-slate-100">
          <div className="pt-4">
            {/* Pro badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded">
                PRO INSIGHTS
              </span>
            </div>
            
            {/* Benchmark comparison */}
            <div className={`p-3 rounded-lg mb-4 ${isAboveBenchmark ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
              <div className="flex items-center gap-2">
                <span className={`text-lg ${isAboveBenchmark ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {isAboveBenchmark ? '📈' : '📉'}
                </span>
                <div>
                  <p className={`text-sm font-medium ${isAboveBenchmark ? 'text-emerald-800' : 'text-amber-800'}`}>
                    {isAboveBenchmark 
                      ? `${benchmarkDiff} points above benchmark` 
                      : `${benchmarkDiff} points below benchmark`}
                  </p>
                  <p className={`text-xs ${isAboveBenchmark ? 'text-emerald-600' : 'text-amber-600'}`}>
                    Your score: {displayScore} vs average of top sites: {benchmarkAverage}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Findings list */}
            <div className="space-y-2">
              {findings.map((finding, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-indigo-500 mt-0.5">•</span>
                  <span>{finding}</span>
                </div>
              ))}
            </div>
            
            {/* Additional data if available */}
            {dimensionData?.data && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                {/* Font families */}
                {dimensionData.data.fontFamilies && dimensionData.data.fontFamilies.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs font-medium text-slate-500 uppercase">Fonts Detected:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {dimensionData.data.fontFamilies.slice(0, 5).map((font, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-white text-slate-700 text-xs rounded border border-slate-200">
                          {font}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Color swatches */}
                {dimensionData.data.dominantColors && dimensionData.data.dominantColors.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs font-medium text-slate-500 uppercase">Colours Detected:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {dimensionData.data.dominantColors.slice(0, 6).map((color, idx) => (
                        <div 
                          key={idx} 
                          className="w-6 h-6 rounded border border-slate-200" 
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* CTA info */}
                {dimensionData.data.totalCTAs !== undefined && (
                  <div className="mb-2">
                    <span className="text-xs font-medium text-slate-500 uppercase">CTAs Found:</span>
                    <div className="text-sm text-slate-700 mt-1">
                      {dimensionData.data.totalCTAs} total ({dimensionData.data.buttonCTAs || 0} buttons, {dimensionData.data.linkCTAs || 0} links)
                    </div>
                    {dimensionData.data.ctaTexts && dimensionData.data.ctaTexts.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {dimensionData.data.ctaTexts.slice(0, 4).map((text, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-white text-slate-600 text-xs rounded border border-slate-200 truncate max-w-[120px]">
                            &ldquo;{text}&rdquo;
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Complexity */}
                {dimensionData.data.complexity && (
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase">Page Complexity:</span>
                    <div className="text-sm text-slate-700 mt-1">
                      {dimensionData.data.complexity} ({dimensionData.data.elementCount} elements)
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Confidence level styling
function getConfidenceBadge(level: 'low' | 'medium' | 'high'): { bg: string; text: string; icon: string; label: string } {
  switch (level) {
    case 'high':
      return { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '●●●', label: 'High' };
    case 'medium':
      return { bg: 'bg-amber-100', text: 'text-amber-700', icon: '●●○', label: 'Medium' };
    case 'low':
      return { bg: 'bg-slate-100', text: 'text-slate-600', icon: '●○○', label: 'Low' };
  }
}

// ROI category styling
function getROICategoryBadge(category: 'quick-win' | 'strategic' | 'long-term'): { bg: string; text: string; icon: string; label: string } {
  switch (category) {
    case 'quick-win':
      return { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: '⚡', label: 'Quick Win!' };
    case 'strategic':
      return { bg: 'bg-blue-100', text: 'text-blue-700', icon: '📈', label: 'Strategic' };
    case 'long-term':
      return { bg: 'bg-slate-100', text: 'text-slate-600', icon: '🎯', label: 'Long-term' };
  }
}

function RecommendationCard({ recommendation, isPro, reportId }: { recommendation: Recommendation; isPro: boolean; reportId: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [completedItems, setCompletedItems] = useState<Set<number>>(new Set());
  const priority = getPriorityBadge(recommendation.priority);
  const effort = getEffortBadge(recommendation.effort);
  
  // Load completed items from localStorage on mount
  useEffect(() => {
    const storageKey = `pirouette-action-items-${reportId}-${recommendation.id}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCompletedItems(new Set(parsed));
      } catch {
        // Ignore parse errors
      }
    }
  }, [reportId, recommendation.id]);
  
  // Save completed items to localStorage
  const toggleActionItem = (index: number) => {
    setCompletedItems(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      // Save to localStorage
      const storageKey = `pirouette-action-items-${reportId}-${recommendation.id}`;
      localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
      return next;
    });
  };
  
  // Get ROI badge if available
  const roiBadge = recommendation.roiScore 
    ? getROICategoryBadge(recommendation.roiScore.category) 
    : null;
  
  // Check if action items exist
  const hasActionItems = recommendation.actionItems && recommendation.actionItems.length > 0;
  const actionItemsCount = recommendation.actionItems?.length || 0;
  const completedCount = completedItems.size;
  
  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
        aria-expanded={isExpanded}
        aria-controls={`rec-details-${recommendation.id}`}
      >
        <div className="flex items-start gap-4">
          {/* Priority indicator */}
          <div className={`w-1 h-full self-stretch rounded-full ${getScoreBgColor(recommendation.priority === 'high' ? 30 : recommendation.priority === 'medium' ? 60 : 90)}`} />
          
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${priority.bg} ${priority.text}`}>
                {recommendation.priority.toUpperCase()}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${effort.bg} ${effort.text}`}>
                {effort.label}
              </span>
              {effort.timeEstimate && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-50 text-slate-500 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {effort.timeEstimate}
                </span>
              )}
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                {recommendation.dimension}
              </span>
              {roiBadge && (
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${roiBadge.bg} ${roiBadge.text}`}>
                  {roiBadge.icon} {roiBadge.label}
                </span>
              )}
              {recommendation.roiScore && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                  ROI: {recommendation.roiScore.normalizedScore.toFixed(1)}/10
                </span>
              )}
            </div>
            
            {/* Title */}
            <h3 className="font-semibold text-slate-900 mb-1">
              {recommendation.title}
            </h3>
            
            {/* Impact preview with revenue hint */}
            <p className="text-sm text-slate-600 line-clamp-2">
              {recommendation.impact}
            </p>
            
            {/* Revenue impact preview (collapsed view) */}
            {recommendation.revenueImpact && (
              <div className="mt-2 flex items-center gap-2 text-emerald-700 text-sm">
                <span className="font-medium">
                  💰 +£{recommendation.revenueImpact.potentialRevenue.toLocaleString()}/mo potential
                </span>
              </div>
            )}
            
            {/* Percentage-based impact when no traffic data */}
            {!recommendation.revenueImpact && recommendation.successMetrics && (
              <div className="mt-2 flex items-center gap-2 text-indigo-700 text-sm">
                <span className="font-medium">
                  📊 {recommendation.successMetrics.improvementRange} improvement expected
                </span>
              </div>
            )}
          </div>
          
          {/* Expand icon */}
          <svg 
            className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {/* Expanded content */}
      {isExpanded && (
        <div 
          id={`rec-details-${recommendation.id}`}
          className="px-5 pb-5 pt-0 border-t border-slate-100 mt-0"
        >
          <div className="pt-4 space-y-4">
            {/* Description */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-1">Description</h4>
              <p className="text-sm text-slate-600">{recommendation.description}</p>
            </div>
            
            {/* Impact */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-1">Expected Impact</h4>
              <p className="text-sm text-slate-600">{recommendation.impact}</p>
            </div>
            
            {/* Revenue Impact Section (when traffic data is available) */}
            {recommendation.revenueImpact && (
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-emerald-900 flex items-center gap-2">
                    💰 Revenue Impact Estimate
                  </h4>
                  <div className="flex items-center gap-1">
                    {(() => {
                      const conf = getConfidenceBadge(recommendation.revenueImpact.confidenceLevel);
                      return (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${conf.bg} ${conf.text}`} title={`${conf.label} confidence estimate`}>
                          {conf.icon} {conf.label} Confidence
                        </span>
                      );
                    })()}
                  </div>
                </div>
                
                {/* Main revenue figure */}
                <div className="mb-3">
                  <span className="text-2xl font-bold text-emerald-700">
                    +£{recommendation.revenueImpact.potentialRevenue.toLocaleString()}
                  </span>
                  <span className="text-emerald-600 ml-1">/month potential MRR</span>
                </div>
                
                {/* Calculation breakdown */}
                <div className="bg-white/60 rounded-md p-3 mb-3">
                  <h5 className="text-xs font-medium text-emerald-800 uppercase tracking-wide mb-1">
                    How this is calculated
                  </h5>
                  <p className="text-sm text-emerald-700 font-mono">
                    {recommendation.revenueImpact.calculationMethod}
                  </p>
                </div>
                
                {/* Validation timeline */}
                <div className="flex items-center gap-4 text-sm text-emerald-700">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Time to validate: <strong>{recommendation.revenueImpact.timeToValidate}</strong></span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Success Metrics Section (shown when available, even without traffic) */}
            {recommendation.successMetrics && (
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                <h4 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                  📊 Success Metrics
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Expected improvement */}
                  <div className="bg-white/60 rounded-md p-3">
                    <div className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-1">
                      Expected Improvement
                    </div>
                    <div className="text-lg font-bold text-indigo-900">
                      {recommendation.successMetrics.improvementRange}
                    </div>
                    <div className="text-xs text-indigo-600">
                      conversion improvement
                    </div>
                  </div>
                  
                  {/* Visitor threshold */}
                  <div className="bg-white/60 rounded-md p-3">
                    <div className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-1">
                      Minimum Traffic
                    </div>
                    <div className="text-lg font-bold text-indigo-900">
                      {recommendation.successMetrics.visitorThreshold.toLocaleString()}+
                    </div>
                    <div className="text-xs text-indigo-600">
                      weekly visitors needed
                    </div>
                  </div>
                  
                  {/* Measurement period */}
                  <div className="bg-white/60 rounded-md p-3">
                    <div className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-1">
                      Measurement Period
                    </div>
                    <div className="text-lg font-bold text-indigo-900">
                      {recommendation.successMetrics.measurementPeriod}
                    </div>
                    <div className="text-xs text-indigo-600">
                      to see reliable results
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Example */}
            {recommendation.example && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-1">Example</h4>
                <p className="text-sm text-slate-600 italic">{recommendation.example}</p>
              </div>
            )}
            
            {/* ROI Breakdown (if available) */}
            {recommendation.roiScore && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  📐 ROI Analysis
                </h4>
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  <div>
                    <span className="text-slate-500">Impact:</span>{' '}
                    <span className="font-medium">{recommendation.roiScore.breakdown.impactScore}/10</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Effort:</span>{' '}
                    <span className="font-medium">{recommendation.roiScore.breakdown.effortMinutes} min</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Time to results:</span>{' '}
                    <span className="font-medium">{recommendation.roiScore.breakdown.timeToResultsWeeks} week{recommendation.roiScore.breakdown.timeToResultsWeeks !== 1 ? 's' : ''}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">ROI Score:</span>{' '}
                    <span className="font-semibold text-indigo-700">{recommendation.roiScore.normalizedScore.toFixed(1)}/10</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Action Items Checklist (Pro Feature) */}
            {hasActionItems && (
              <div className={`p-4 rounded-lg border ${isPro ? 'bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    ✅ Action Items
                    {isPro && completedCount > 0 && (
                      <span className="text-xs font-normal text-slate-500">
                        ({completedCount}/{actionItemsCount} complete)
                      </span>
                    )}
                  </h4>
                  {isPro && (
                    <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-xs font-medium rounded">
                      PRO
                    </span>
                  )}
                </div>
                
                {isPro ? (
                  <ul className="space-y-2">
                    {recommendation.actionItems?.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleActionItem(idx);
                          }}
                          className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            completedItems.has(idx)
                              ? 'bg-violet-600 border-violet-600 text-white'
                              : 'border-slate-300 hover:border-violet-400 bg-white'
                          }`}
                          aria-label={completedItems.has(idx) ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                          {completedItems.has(idx) && (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <span className={`text-sm ${completedItems.has(idx) ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="relative">
                    {/* Blurred preview for free users */}
                    <ul className="space-y-2 blur-sm pointer-events-none select-none">
                      {recommendation.actionItems?.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="mt-0.5 w-5 h-5 rounded border-2 border-slate-300 bg-white flex-shrink-0" />
                          <span className="text-sm text-slate-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                    {/* Upgrade overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded">
                      <Link
                        href="/pricing"
                        className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 text-white text-xs font-medium rounded-lg hover:bg-violet-700 transition-colors shadow-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Unlock Action Items
                      </Link>
                    </div>
                  </div>
                )}
                
                {/* Progress bar for Pro users */}
                {isPro && actionItemsCount > 0 && (
                  <div className="mt-3 pt-3 border-t border-violet-200">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>Progress</span>
                      <span>{Math.round((completedCount / actionItemsCount) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-violet-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-violet-600 rounded-full transition-all duration-300"
                        style={{ width: `${(completedCount / actionItemsCount) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Validation Timeline (if milestones available) */}
            {recommendation.successMetrics?.milestones && recommendation.successMetrics.milestones.length > 0 && (
              <ValidationTimeline
                milestones={recommendation.successMetrics.milestones}
                measurementPeriod={recommendation.successMetrics.measurementPeriod}
                measurementTips={recommendation.successMetrics.measurementTips}
                target={recommendation.successMetrics.target}
                confidence={recommendation.successMetrics.confidence}
                compact={true}
              />
            )}
            
            {/* Disclaimer for revenue estimates */}
            {recommendation.revenueImpact && (
              <p className="text-xs text-slate-500 italic border-t border-slate-100 pt-3">
                ⚠️ Revenue estimates are based on industry benchmarks and actual results may vary. 
                These projections assume consistent traffic patterns and typical conversion behaviour.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

// ROI filter types
type ROIFilterType = 'all' | 'quick-win' | 'strategic' | 'long-term';

export default function ReportPage({ params }: PageProps) {
  const searchParams = useSearchParams();
  const { isPro } = useUserPlan();
  const [reportId, setReportId] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [claimStatus, setClaimStatus] = useState<'idle' | 'claiming' | 'claimed' | 'error'>('idle');
  const [roiFilter, setRoiFilter] = useState<ROIFilterType>('all');
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [showFoldLine, setShowFoldLine] = useState(true);
  const [foldLinePosition, setFoldLinePosition] = useState<number | null>(null);
  const screenshotRef = useCallback((node: HTMLImageElement | null) => {
    if (node) {
      const updateFoldPosition = () => {
        // Railway captures at 1280px width, fold is at 800px height
        // Calculate scaled position based on displayed width
        const scaleFactor = node.clientWidth / 1280;
        setFoldLinePosition(800 * scaleFactor);
      };
      node.addEventListener('load', updateFoldPosition);
      if (node.complete) updateFoldPosition();
      // Also update on resize
      const resizeObserver = new ResizeObserver(updateFoldPosition);
      resizeObserver.observe(node);
      return () => resizeObserver.disconnect();
    }
  }, []);
  
  // Resolve params
  useEffect(() => {
    params.then(p => setReportId(p.id));
  }, [params]);
  
  // Claim report after signup
  const claimReport = useCallback(async () => {
    if (!reportId || claimStatus === 'claiming' || claimStatus === 'claimed') return;
    
    setClaimStatus('claiming');
    
    try {
      const response = await fetch('/api/claim-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setClaimStatus('claimed');
        // Refresh report data to get updated user_id
        const reportResponse = await fetch(`/api/reports/${reportId}`);
        const reportData = await reportResponse.json();
        if (reportResponse.ok) {
          setReport(reportData.data.report);
        }
      } else {
        console.error('Failed to claim report:', data.error);
        setClaimStatus('error');
      }
    } catch (err) {
      console.error('Error claiming report:', err);
      setClaimStatus('error');
    }
  }, [reportId, claimStatus]);
  
  // Check if we should claim the report (after signup redirect)
  useEffect(() => {
    const claimed = searchParams.get('claimed');
    if (claimed === 'true' && reportId) {
      claimReport();
    }
  }, [searchParams, reportId, claimReport]);
  
  // Download PDF report (Pro feature)
  const downloadPDF = useCallback(async () => {
    if (!reportId || isExportingPDF) return;
    
    setIsExportingPDF(true);
    
    try {
      const response = await fetch(`/api/reports/${reportId}/pdf`);
      
      if (response.status === 403) {
        // User is not Pro - show upgrade prompt
        alert('PDF export is a Pro feature. Upgrade to download reports.');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      // Get the blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      link.download = filenameMatch ? filenameMatch[1] : 'pirouette-report.pdf';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Track successful PDF download
      trackPDFDownloaded();
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setIsExportingPDF(false);
    }
  }, [reportId, isExportingPDF]);
  
  // Fetch report
  useEffect(() => {
    if (!reportId) return;
    
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/reports/${reportId}`);
        const data = await response.json();
        
        if (!response.ok) {
          setError(data.error || 'Failed to load report');
          return;
        }
        
        setReport(data.data.report);
        
        // Track report view and analysis completion
        const reportData = data.data.report;
        trackReportViewed(!reportData.isAnonymous);
        if (reportData.overall_score) {
          trackAnalysisCompleted(reportData.overall_score, reportData.url);
        }
      } catch (err) {
        console.error('Error fetching report:', err);
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReport();
  }, [reportId]);
  
  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <p className="text-slate-600">Loading your report...</p>
        </div>
      </main>
    );
  }
  
  // Error state
  if (error || !report) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Report Not Found</h1>
          <p className="text-slate-600 mb-6">{error || 'This report may have been deleted or you don\'t have permission to view it.'}</p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </main>
    );
  }
  
  // Determine sorting strategy based on traffic
  const sortByEase = report.weeklyTraffic ? shouldSortByEase(report.weeklyTraffic) : false;
  
  // Sort recommendations - by ease (effort) for very low traffic, otherwise by ROI
  const sortedRecommendations = [...(report.recommendations || [])].sort((a, b) => {
    // For very low traffic, sort by effort (easiest first)
    if (sortByEase) {
      const effortOrder = { low: 0, medium: 1, high: 2 };
      const effortDiff = (effortOrder[a.effort] || 2) - (effortOrder[b.effort] || 2);
      if (effortDiff !== 0) return effortDiff;
      // Then by ROI score within same effort
      if (a.roiScore && b.roiScore) {
        return b.roiScore.normalizedScore - a.roiScore.normalizedScore;
      }
    } else {
      // Sort by ROI score if both have it
      if (a.roiScore && b.roiScore) {
        return b.roiScore.normalizedScore - a.roiScore.normalizedScore;
      }
    }
    // Fallback to priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
  });
  
  // Filter recommendations by ROI category
  const filteredRecommendations = roiFilter === 'all' 
    ? sortedRecommendations 
    : sortedRecommendations.filter(r => r.roiScore?.category === roiFilter);
  
  // Count recommendations by ROI category
  const quickWinCount = sortedRecommendations.filter(r => r.roiScore?.category === 'quick-win').length;
  const strategicCount = sortedRecommendations.filter(r => r.roiScore?.category === 'strategic').length;
  const longTermCount = sortedRecommendations.filter(r => r.roiScore?.category === 'long-term').length;
  const noRoiCount = sortedRecommendations.filter(r => !r.roiScore).length;
  
  const highPriorityCount = sortedRecommendations.filter(r => r.priority === 'high').length;
  const quickWinsCount = sortedRecommendations.filter(r => r.effort === 'low' && r.priority !== 'low').length;
  
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="font-bold text-xl text-slate-900">Pirouette</span>
            </Link>
            
            <div className="flex items-center gap-3">
              {report.isAnonymous && claimStatus !== 'claimed' && (
                <button 
                  onClick={() => setShowEmailModal(true)}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Save Report →
                </button>
              )}
              {claimStatus === 'claimed' && (
                <Link 
                  href="/dashboard"
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  ✓ Saved to Dashboard
                </Link>
              )}
              {/* PDF Export (Pro feature) */}
              {!report.isAnonymous && isPro && (
                <button
                  onClick={downloadPDF}
                  disabled={isExportingPDF}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isExportingPDF ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export PDF
                    </>
                  )}
                </button>
              )}
              {/* Locked PDF for free users */}
              {!report.isAnonymous && !isPro && (
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
                  title="PDF export requires Pro plan"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Export PDF
                </Link>
              )}
              <Link 
                href="/"
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                New Analysis
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 mb-8 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="text-sm text-slate-400 mb-2">
                Analysis completed {formatDate(report.created_at)}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-all text-white">
                {report.url}
              </h1>
              <div className="flex flex-wrap gap-3 text-sm">
                {highPriorityCount > 0 && (
                  <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full">
                    {highPriorityCount} high priority issues
                  </span>
                )}
                {quickWinsCount > 0 && (
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full">
                    {quickWinsCount} quick wins available
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <ScoreRing score={report.overall_score} size="lg" />
              <div className="text-center">
                <div className="text-sm text-slate-400">Overall Score</div>
                <div className={`text-lg font-semibold ${
                  report.overall_score >= 80 ? 'text-emerald-400' :
                  report.overall_score >= 60 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {report.overall_score >= 80 ? 'Great' :
                   report.overall_score >= 60 ? 'Needs Work' : 'Critical'}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Executive Summary (Pro Feature) */}
        {isPro && sortedRecommendations.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">📊</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-slate-900">Executive Summary</h3>
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded">PRO</span>
                </div>
                <p className="text-slate-700">
                  This page scores <strong className={
                    report.overall_score >= 80 ? 'text-emerald-600' :
                    report.overall_score >= 60 ? 'text-amber-600' : 'text-red-600'
                  }>{report.overall_score}/100</strong>
                  {report.overall_score >= 85 ? ' (top 10% of sites analysed)' :
                   report.overall_score >= 75 ? ' (top 25% of sites analysed)' :
                   report.overall_score >= 60 ? ' (average performance)' :
                   ' (below average - significant improvements possible)'}.
                  {sortedRecommendations.length > 0 && (
                    <> Priority fix: <strong className="text-slate-900">{sortedRecommendations[0].title}</strong>.</>
                  )}
                  {' '}Total estimated implementation time:{' '}
                  <strong className="text-slate-900">
                    {(() => {
                      const totalMinutes = sortedRecommendations.reduce((acc, r) => {
                        if (r.effort === 'low') return acc + 15;
                        if (r.effort === 'medium') return acc + 120;
                        return acc + 480; // high = 1 day
                      }, 0);
                      if (totalMinutes < 60) return `${totalMinutes} minutes`;
                      if (totalMinutes < 480) return `${Math.round(totalMinutes / 60)} hours`;
                      return `${Math.round(totalMinutes / 480)} day${Math.round(totalMinutes / 480) > 1 ? 's' : ''}`;
                    })()}
                  </strong>.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Claim success message */}
        {claimStatus === 'claimed' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-emerald-900">
                  Report saved to your account! 🎉
                </h3>
                <p className="text-emerald-700 text-sm">
                  You can now access this report anytime from your <Link href="/dashboard" className="underline font-medium">dashboard</Link>.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Anonymous user prompt */}
        {report.isAnonymous && claimStatus !== 'claimed' && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-semibold text-indigo-900 mb-1">
                  💡 Want to save this report?
                </h3>
                <p className="text-indigo-700 text-sm">
                  Create a free account to save your analysis, track improvements over time, and get weekly analyses.
                </p>
              </div>
              <button 
                onClick={() => setShowEmailModal(true)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap"
              >
                Save Report
              </button>
            </div>
          </div>
        )}
        
        {/* Dimension Scores */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Analysis Dimensions</h2>
            {isPro && (
              <span className="text-xs text-slate-500">Click any dimension for detailed insights</span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {DIMENSIONS.map(dim => {
              // Map display key to analyzer key for dimensions data
              const analyzerKey = DIMENSION_KEY_MAP[dim.key];
              const dimensionData = analyzerKey 
                ? (report.dimensions as Record<string, DimensionData>)?.[analyzerKey]
                : undefined;
              
              return (
                <DimensionCard
                  key={dim.key}
                  name={dim.name}
                  score={report[dim.key as keyof Report] as number | undefined}
                  icon={dim.icon}
                  dimensionKey={dim.key}
                  dimensionData={dimensionData}
                  isPro={isPro}
                />
              );
            })}
          </div>
        </section>
        
        {/* Recommendations - Primary Value (moved up for value-first UX) */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="text-xl font-bold text-slate-900">
              Recommendations ({filteredRecommendations.length}{roiFilter !== 'all' ? ` of ${sortedRecommendations.length}` : ''})
            </h2>
            
            {/* ROI Category Filter Buttons */}
            {sortedRecommendations.some(r => r.roiScore) && (
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by ROI category">
                <button
                  onClick={() => setRoiFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    roiFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  aria-pressed={roiFilter === 'all'}
                >
                  All ({sortedRecommendations.length})
                </button>
                {quickWinCount > 0 && (
                  <button
                    onClick={() => setRoiFilter('quick-win')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                      roiFilter === 'quick-win'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                    aria-pressed={roiFilter === 'quick-win'}
                  >
                    <span>⚡</span> Quick Wins ({quickWinCount})
                  </button>
                )}
                {strategicCount > 0 && (
                  <button
                    onClick={() => setRoiFilter('strategic')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                      roiFilter === 'strategic'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                    aria-pressed={roiFilter === 'strategic'}
                  >
                    <span>📈</span> Strategic ({strategicCount})
                  </button>
                )}
                {longTermCount > 0 && (
                  <button
                    onClick={() => setRoiFilter('long-term')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                      roiFilter === 'long-term'
                        ? 'bg-slate-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    aria-pressed={roiFilter === 'long-term'}
                  >
                    <span>🎯</span> Long-term ({longTermCount})
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Filter description */}
          {roiFilter !== 'all' && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              roiFilter === 'quick-win' ? 'bg-emerald-50 text-emerald-800' :
              roiFilter === 'strategic' ? 'bg-blue-50 text-blue-800' :
              'bg-slate-100 text-slate-700'
            }`}>
              {roiFilter === 'quick-win' && (
                <span>⚡ <strong>Quick Wins:</strong> High impact with low effort - implement these first for maximum results</span>
              )}
              {roiFilter === 'strategic' && (
                <span>📈 <strong>Strategic:</strong> Moderate ROI - valuable improvements that require more time or effort</span>
              )}
              {roiFilter === 'long-term' && (
                <span>🎯 <strong>Long-term:</strong> Lower ROI - consider these after completing quick wins</span>
              )}
            </div>
          )}
          
          {filteredRecommendations.length > 0 ? (
            <div className="space-y-4">
              {/* Limit free users to 3 recommendations */}
              {(isPro ? filteredRecommendations : filteredRecommendations.slice(0, 3)).map(rec => (
                <RecommendationCard key={rec.id} recommendation={rec} isPro={isPro} reportId={reportId || ''} />
              ))}
              
              {/* Show upgrade prompt if free user has more recommendations */}
              {!isPro && filteredRecommendations.length > 3 && (
                <div className="relative">
                  {/* Blurred preview of next recommendation */}
                  <div className="blur-sm pointer-events-none opacity-50">
                    <div className="bg-white rounded-xl border border-slate-100 p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                          RECOMMENDATION
                        </span>
                      </div>
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-100 rounded w-full"></div>
                    </div>
                  </div>
                  
                  {/* Upgrade overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
                    <div className="text-center p-6">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-slate-900 mb-1">
                        {filteredRecommendations.length - 3} more recommendation{filteredRecommendations.length - 3 > 1 ? 's' : ''} available
                      </h4>
                      <p className="text-sm text-slate-600 mb-4">
                        Upgrade to Pro to see all recommendations with detailed action items
                      </p>
                      <Link
                        href="/pricing"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <span>Unlock All Recommendations</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : roiFilter !== 'all' ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">
                  {roiFilter === 'quick-win' ? '⚡' : roiFilter === 'strategic' ? '📈' : '🎯'}
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">No {roiFilter === 'quick-win' ? 'Quick Wins' : roiFilter === 'strategic' ? 'Strategic Improvements' : 'Long-term Projects'}</h3>
              <p className="text-slate-600 mb-4">
                No recommendations in this category.
              </p>
              <button 
                onClick={() => setRoiFilter('all')}
                className="text-indigo-600 font-medium hover:text-indigo-700"
              >
                View all recommendations →
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Looking Great!</h3>
              <p className="text-slate-600">
                No major recommendations at this time. Your landing page is performing well!
              </p>
            </div>
          )}
        </section>
        
        {/* Screenshot Preview - Supporting evidence after recommendations */}
        {report.screenshot_url && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Page Screenshot</h2>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 text-center text-sm text-slate-500 truncate">
                  {report.url}
                </div>
                {/* Above-the-fold toggle (Pro feature) */}
                {isPro && (
                  <button
                    onClick={() => setShowFoldLine(!showFoldLine)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${
                      showFoldLine 
                        ? 'bg-indigo-100 text-indigo-700' 
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                    title="Toggle above-the-fold indicator"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16" />
                    </svg>
                    Fold Line
                  </button>
                )}
              </div>
              <div className="p-4">
                <div className="relative">
                  <img 
                    ref={screenshotRef}
                    src={report.screenshot_url} 
                    alt={`Screenshot of ${report.url}`}
                    className="w-full rounded-lg shadow-lg"
                  />
                  {/* Above-the-fold line indicator (Pro feature) */}
                  {isPro && showFoldLine && foldLinePosition && (
                    <div 
                      className="absolute left-0 right-0 pointer-events-none z-10"
                      style={{ top: `${foldLinePosition}px` }}
                    >
                      <div className="relative flex items-center">
                        <div className="flex-1 border-t-2 border-dashed border-rose-500" />
                        <span className="absolute -top-3 left-4 bg-rose-500 text-white text-xs font-medium px-2 py-0.5 rounded shadow-sm">
                          ↑ Above the fold (800px)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Traffic Context Section - Earned ask after delivering value */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Your Traffic Context</h2>
          <TrafficContext weeklyVisitors={report.weeklyTraffic} />
          {sortByEase && report.weeklyTraffic && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>📊 Sorting adapted for your traffic:</strong> Recommendations are sorted by implementation 
                ease (quickest to implement first) rather than ROI because A/B testing isn&apos;t statistically 
                reliable at very low traffic levels. Focus on implementing multiple quick wins together.
              </p>
            </div>
          )}
        </section>
        
        {/* Historical Tracking (Pro Feature) */}
        {!report.isAnonymous && reportId && (
          <section className="mb-8">
            <HistoricalTracking
              url={report.url}
              currentReportId={reportId}
              isPro={isPro}
            />
          </section>
        )}
        
        {/* Competitor Comparison (Pro Feature) */}
        {!report.isAnonymous && (
          <section className="mb-8">
            <CompetitorComparison
              userReport={{
                id: report.id,
                url: report.url,
                overall_score: report.overall_score,
                colors_score: report.colors_score ?? null,
                whitespace_score: report.whitespace_score ?? null,
                complexity_score: report.complexity_score ?? null,
                typography_score: report.typography_score ?? null,
                layout_score: report.layout_score ?? null,
                cta_score: report.cta_score ?? null,
                hierarchy_score: report.hierarchy_score ?? null,
              }}
              competitors={[]}
              isPro={isPro}
            />
          </section>
        )}
        
        {/* Share Score Badge (Pro Feature) */}
        {isPro && (
          <section className="mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-bold text-slate-900">Share Your Score</h2>
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded">PRO</span>
              </div>
              <p className="text-slate-600 mb-6">
                Showcase your design quality with an embeddable badge. Add it to your website footer or portfolio.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Badge Preview */}
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3">Badge Preview</h3>
                  <div className="bg-slate-50 rounded-lg p-4 flex justify-center">
                    <svg width="180" height="48" viewBox="0 0 180 48" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                      <rect width="180" height="48" rx="8" fill="url(#bgGradient)" />
                      <text x="12" y="20" fill="white" fontSize="10" fontWeight="500" fontFamily="system-ui, sans-serif">Pirouette Score</text>
                      <text x="12" y="38" fill="white" fontSize="18" fontWeight="700" fontFamily="system-ui, sans-serif">{report.overall_score}/100</text>
                      <circle cx="150" cy="24" r="16" fill="rgba(255,255,255,0.2)" />
                      <text x="150" y="29" fill="white" fontSize="14" fontWeight="700" fontFamily="system-ui, sans-serif" textAnchor="middle">
                        {report.overall_score >= 80 ? '★' : report.overall_score >= 60 ? '◆' : '●'}
                      </text>
                    </svg>
                  </div>
                </div>
                
                {/* Embed Code */}
                <div>
                  <h3 className="text-sm font-medium text-slate-700 mb-3">Embed Code</h3>
                  <div className="relative">
                    <textarea
                      readOnly
                      value={`<a href="https://pirouette-app.vercel.app" target="_blank" rel="noopener"><img src="https://pirouette-app.vercel.app/api/badge/${reportId}?score=${report.overall_score}" alt="Pirouette Score: ${report.overall_score}/100" width="180" height="48" /></a>`}
                      className="w-full h-24 p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`<a href="https://pirouette-app.vercel.app" target="_blank" rel="noopener"><img src="https://pirouette-app.vercel.app/api/badge/${reportId}?score=${report.overall_score}" alt="Pirouette Score: ${report.overall_score}/100" width="180" height="48" /></a>`);
                        // Could add toast notification here
                      }}
                      className="absolute top-2 right-2 px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Paste this code in your website&apos;s HTML to display the badge.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Footer CTA */}
        <section className="mt-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">
            Ready to improve your landing page?
          </h2>
          <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
            Implement these recommendations and run another analysis to track your progress.
            {report.isAnonymous && claimStatus !== 'claimed' && ' Create a free account to save your progress over time.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/"
              className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
            >
              Run Another Analysis
            </Link>
            {report.isAnonymous && claimStatus !== 'claimed' && (
              <button 
                onClick={() => setShowEmailModal(true)}
                className="px-6 py-3 bg-indigo-700 text-white rounded-lg font-medium hover:bg-indigo-800 transition-colors border border-indigo-400"
              >
                Save Report
              </button>
            )}
            {claimStatus === 'claimed' && (
              <Link 
                href="/dashboard"
                className="px-6 py-3 bg-indigo-700 text-white rounded-lg font-medium hover:bg-indigo-800 transition-colors border border-indigo-400"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </section>
      </div>
      
      {/* Email Capture Modal */}
      {report.isAnonymous && reportId && (
        <EmailCaptureModal
          reportId={reportId}
          jobId={report.id}
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          autoShow={true}
          autoShowDelay={45000} // Show after 45 seconds
        />
      )}
    </main>
  );
}

