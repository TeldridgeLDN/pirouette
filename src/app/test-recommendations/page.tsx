'use client';

/**
 * Test Page for Recommendation Components
 * 
 * This page displays mock recommendations to verify the enhanced
 * RecommendationCard UI with revenue impact and success metrics.
 * 
 * Navigate to /test-recommendations to see the component.
 */

import { useState } from 'react';

// ============================================================================
// Types (same as report page)
// ============================================================================

interface RevenueImpact {
  potentialRevenue: number;
  confidenceLevel: 'low' | 'medium' | 'high';
  timeToValidate: string;
  calculationMethod: string;
}

interface SuccessMetrics {
  improvementRange: string;
  visitorThreshold: number;
  measurementPeriod: string;
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
}

// ============================================================================
// Mock Data
// ============================================================================

const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    dimension: 'CTA Design',
    priority: 'high',
    title: 'Increase CTA button size by 40%',
    description: 'Your primary call-to-action button is smaller than 85% of high-converting landing pages. Increasing the size will improve visibility and click-through rates.',
    impact: 'Expected 15-25% improvement in click-through rate based on industry benchmarks.',
    effort: 'low',
    example: 'Change button padding from 12px 24px to 16px 32px, and increase font size from 14px to 16px.',
    changeType: 'ui',
    revenueImpact: {
      potentialRevenue: 348,
      confidenceLevel: 'high',
      timeToValidate: '1-2 weeks',
      calculationMethod: '15-25% CTR improvement × 1,000 weekly visitors × £29/mo pricing',
    },
    successMetrics: {
      improvementRange: '15-25%',
      visitorThreshold: 500,
      measurementPeriod: '2 weeks',
    },
    roiScore: {
      score: 0.67,
      normalizedScore: 7.8,
      category: 'quick-win',
      breakdown: {
        impactScore: 10,
        effortMinutes: 15,
        timeToResultsWeeks: 1,
      },
    },
  },
  {
    id: '2',
    dimension: 'Colour & Contrast',
    priority: 'high',
    title: 'Fix text contrast on hero section',
    description: 'The text in your hero section has a contrast ratio of 3.2:1, which fails WCAG AA standards (requires 4.5:1). This affects readability for all users.',
    impact: 'Improves accessibility compliance and readability for approximately 15% of users with visual impairments.',
    effort: 'low',
    example: 'Change text colour from #6B7280 to #374151 to achieve a contrast ratio of 7:1.',
    changeType: 'accessibility',
    revenueImpact: {
      potentialRevenue: 217,
      confidenceLevel: 'high',
      timeToValidate: '1 week',
      calculationMethod: '10-20% readability improvement × 1,000 weekly visitors × £29/mo pricing',
    },
    successMetrics: {
      improvementRange: '10-20%',
      visitorThreshold: 500,
      measurementPeriod: '1-2 weeks',
    },
    roiScore: {
      score: 0.83,
      normalizedScore: 8.2,
      category: 'quick-win',
      breakdown: {
        impactScore: 10,
        effortMinutes: 12,
        timeToResultsWeeks: 1,
      },
    },
  },
  {
    id: '3',
    dimension: 'Typography',
    priority: 'medium',
    title: 'Increase body text line height',
    description: 'Your body text has a line height of 1.3, which is below the recommended 1.5-1.7 for optimal readability on screens.',
    impact: 'Expected 5-12% improvement in time-on-page and content engagement.',
    effort: 'low',
    example: 'Change line-height from 1.3 to 1.6 in your CSS.',
    changeType: 'ui',
    successMetrics: {
      improvementRange: '5-12%',
      visitorThreshold: 500,
      measurementPeriod: '3-4 weeks',
    },
    roiScore: {
      score: 0.28,
      normalizedScore: 5.4,
      category: 'quick-win',
      breakdown: {
        impactScore: 5,
        effortMinutes: 10,
        timeToResultsWeeks: 2,
      },
    },
  },
  {
    id: '4',
    dimension: 'Layout',
    priority: 'medium',
    title: 'Add visual hierarchy to feature sections',
    description: 'Your feature sections lack clear visual hierarchy. The icons, headings, and descriptions all have similar visual weight.',
    impact: 'Expected 10-18% improvement in feature comprehension and engagement.',
    effort: 'medium',
    example: 'Increase icon size by 50%, use bolder font weight for headings, and add subtle background colours to differentiate sections.',
    changeType: 'structural',
    successMetrics: {
      improvementRange: '10-18%',
      visitorThreshold: 750,
      measurementPeriod: '3-4 weeks',
    },
    roiScore: {
      score: 0.08,
      normalizedScore: 3.2,
      category: 'strategic',
      breakdown: {
        impactScore: 5,
        effortMinutes: 60,
        timeToResultsWeeks: 3,
      },
    },
  },
  {
    id: '5',
    dimension: 'Whitespace',
    priority: 'low',
    title: 'Increase section padding for better breathing room',
    description: 'Your sections have 40px padding, which is below the 60-80px recommended for modern landing pages.',
    impact: 'Creates a more premium feel and improves content scanability.',
    effort: 'low',
    example: 'Increase section padding from py-10 to py-16 in Tailwind.',
    changeType: 'ui',
    roiScore: {
      score: 0.04,
      normalizedScore: 1.8,
      category: 'long-term',
      breakdown: {
        impactScore: 2,
        effortMinutes: 15,
        timeToResultsWeeks: 2,
      },
    },
  },
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

function getEffortBadge(effort: string): { bg: string; text: string; label: string } {
  switch (effort) {
    case 'low':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Quick Fix' };
    case 'medium':
      return { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Medium Effort' };
    case 'high':
      return { bg: 'bg-red-50', text: 'text-red-700', label: 'Major Change' };
    default:
      return { bg: 'bg-slate-50', text: 'text-slate-700', label: effort };
  }
}

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

// ============================================================================
// RecommendationCard Component
// ============================================================================

function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const priority = getPriorityBadge(recommendation.priority);
  const effort = getEffortBadge(recommendation.effort);
  
  const roiBadge = recommendation.roiScore 
    ? getROICategoryBadge(recommendation.roiScore.category) 
    : null;
  
  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
        aria-expanded={isExpanded}
        aria-controls={`rec-details-${recommendation.id}`}
      >
        <div className="flex items-start gap-4">
          <div className={`w-1 h-full self-stretch rounded-full ${getScoreBgColor(recommendation.priority === 'high' ? 30 : recommendation.priority === 'medium' ? 60 : 90)}`} />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${priority.bg} ${priority.text}`}>
                {recommendation.priority.toUpperCase()}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${effort.bg} ${effort.text}`}>
                {effort.label}
              </span>
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
            
            <h3 className="font-semibold text-slate-900 mb-1">
              {recommendation.title}
            </h3>
            
            <p className="text-sm text-slate-600 line-clamp-2">
              {recommendation.impact}
            </p>
            
            {recommendation.revenueImpact && (
              <div className="mt-2 flex items-center gap-2 text-emerald-700 text-sm">
                <span className="font-medium">
                  💰 +£{recommendation.revenueImpact.potentialRevenue.toLocaleString()}/mo potential
                </span>
              </div>
            )}
            
            {!recommendation.revenueImpact && recommendation.successMetrics && (
              <div className="mt-2 flex items-center gap-2 text-indigo-700 text-sm">
                <span className="font-medium">
                  📊 {recommendation.successMetrics.improvementRange} improvement expected
                </span>
              </div>
            )}
          </div>
          
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
      
      {isExpanded && (
        <div 
          id={`rec-details-${recommendation.id}`}
          className="px-5 pb-5 pt-0 border-t border-slate-100 mt-0"
        >
          <div className="pt-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-1">Description</h4>
              <p className="text-sm text-slate-600">{recommendation.description}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-1">Expected Impact</h4>
              <p className="text-sm text-slate-600">{recommendation.impact}</p>
            </div>
            
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
                
                <div className="mb-3">
                  <span className="text-2xl font-bold text-emerald-700">
                    +£{recommendation.revenueImpact.potentialRevenue.toLocaleString()}
                  </span>
                  <span className="text-emerald-600 ml-1">/month potential MRR</span>
                </div>
                
                <div className="bg-white/60 rounded-md p-3 mb-3">
                  <h5 className="text-xs font-medium text-emerald-800 uppercase tracking-wide mb-1">
                    How this is calculated
                  </h5>
                  <p className="text-sm text-emerald-700 font-mono">
                    {recommendation.revenueImpact.calculationMethod}
                  </p>
                </div>
                
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
            
            {recommendation.successMetrics && (
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                <h4 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                  📊 Success Metrics
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            
            {recommendation.example && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-1">Example</h4>
                <p className="text-sm text-slate-600 italic">{recommendation.example}</p>
              </div>
            )}
            
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
// Main Page
// ============================================================================

type ROIFilterType = 'all' | 'quick-win' | 'strategic' | 'long-term';

export default function TestRecommendationsPage() {
  const [roiFilter, setRoiFilter] = useState<ROIFilterType>('all');
  
  // Sort by ROI score
  const sortedRecommendations = [...mockRecommendations].sort((a, b) => {
    if (a.roiScore && b.roiScore) {
      return b.roiScore.normalizedScore - a.roiScore.normalizedScore;
    }
    return 0;
  });
  
  // Filter recommendations by ROI category
  const filteredRecommendations = roiFilter === 'all' 
    ? sortedRecommendations 
    : sortedRecommendations.filter(r => r.roiScore?.category === roiFilter);
  
  // Count by category
  const quickWinCount = sortedRecommendations.filter(r => r.roiScore?.category === 'quick-win').length;
  const strategicCount = sortedRecommendations.filter(r => r.roiScore?.category === 'strategic').length;
  const longTermCount = sortedRecommendations.filter(r => r.roiScore?.category === 'long-term').length;
  
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-700">
              Test Page
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Recommendation Component Test
          </h1>
          <p className="text-slate-600">
            This page tests the enhanced RecommendationCard component with revenue impact,
            success metrics, confidence levels, ROI analysis, and <strong>filtering</strong>.
          </p>
        </div>
        
        {/* ROI Filter Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-slate-900">
            Recommendations ({filteredRecommendations.length}{roiFilter !== 'all' ? ` of ${sortedRecommendations.length}` : ''})
          </h2>
          
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
          </div>
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
        
        <div className="space-y-4">
          {filteredRecommendations.map(rec => (
            <RecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
        
        {filteredRecommendations.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">
                {roiFilter === 'quick-win' ? '⚡' : roiFilter === 'strategic' ? '📈' : '🎯'}
              </span>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">
              No {roiFilter === 'quick-win' ? 'Quick Wins' : roiFilter === 'strategic' ? 'Strategic Improvements' : 'Long-term Projects'}
            </h3>
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
        )}
        
        <div className="mt-8 p-4 bg-slate-100 rounded-lg">
          <h2 className="font-semibold text-slate-700 mb-2">Component Features Demonstrated:</h2>
          <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
            <li><strong>Revenue Impact</strong> - Shows potential MRR with calculation formula (recommendations 1 & 2)</li>
            <li><strong>Confidence Levels</strong> - Visual indicators (High ●●●, Medium ●●○, Low ●○○)</li>
            <li><strong>Success Metrics</strong> - Expected improvement, visitor threshold, measurement period</li>
            <li><strong>ROI Categorisation</strong> - Quick Win ⚡, Strategic 📈, Long-term 🎯</li>
            <li><strong>ROI Score</strong> - Normalised 0-10 scale with breakdown</li>
            <li><strong>Percentage Fallback</strong> - When no traffic data, shows % improvement (recommendations 3-5)</li>
            <li><strong>Disclaimer</strong> - Revenue estimate caveats for transparency</li>
            <li><strong>ROI Filtering</strong> - Filter recommendations by category (Quick Wins, Strategic, Long-term)</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

