'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DesignInsight {
  category: 'strength' | 'improvement' | 'critical';
  title: string;
  description: string;
  suggestion?: string;
}

interface EmotionalImpact {
  primaryEmotion: string;
  explanation: string;
  suggestedImprovement?: string;
}

interface DesignReview {
  overall_impression: string;
  visual_appeal_rating: number;
  visual_appeal_explanation: string;
  first_impression_feedback: string;
  insights: DesignInsight[];
  missing_elements: string[];
  emotional_impact: EmotionalImpact;
  top_priorities: string[];
  generated_at: string;
}

interface DesignersEyeReviewProps {
  reportId: string;
  isPro: boolean;
}

// Helper to get visual appeal color
function getVisualAppealColor(rating: number): { bg: string; text: string } {
  if (rating >= 8) return { bg: 'bg-emerald-100', text: 'text-emerald-700' };
  if (rating >= 6) return { bg: 'bg-amber-100', text: 'text-amber-700' };
  return { bg: 'bg-red-100', text: 'text-red-700' };
}

export function DesignersEyeReview({ reportId, isPro }: DesignersEyeReviewProps) {
  const [review, setReview] = useState<DesignReview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch existing review on mount
  useEffect(() => {
    if (isPro) {
      fetchReview();
    }
  }, [reportId, isPro]);

  const fetchReview = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reports/${reportId}/designers-eye`);
      const data = await res.json();
      if (data.review) {
        setReview(data.review);
      }
    } catch (err) {
      console.error('Error fetching review:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReview = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/reports/${reportId}/designers-eye`, {
        method: 'POST',
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate review');
      }
      
      setReview(data.review);
      setIsExpanded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate review');
    } finally {
      setIsGenerating(false);
    }
  };

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'strength':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'improvement':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'critical':
        return 'bg-rose-50 border-rose-200 text-rose-800';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'strength':
        return '✓';
      case 'improvement':
        return '⚡';
      case 'critical':
        return '⚠';
      default:
        return '•';
    }
  };

  // Free user teaser - styled like a recommendation card
  if (!isPro) {
    return (
      <section className="mb-8">
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-start gap-4">
              {/* Purple accent bar - matching recommendation cards */}
              <div className="w-1 h-full self-stretch rounded-full bg-violet-500" />
              
              <div className="flex-1 min-w-0">
                {/* Header tags - matching recommendation card style */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-violet-100 text-violet-700 flex items-center gap-1">
                    <span>👁️</span> Designer&apos;s Eye
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
                    PRO
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                    AI-Powered Critique
                  </span>
                </div>
                
                {/* Title */}
                <h3 className="font-semibold text-slate-900 mb-1">
                  Professional Design Critique
                </h3>
                
                {/* Description */}
                <p className="text-sm text-slate-600 mb-4">
                  Get AI-powered qualitative feedback covering visual appeal, emotional impact, missing elements, and prioritised recommendations.
                </p>
                
                {/* Blurred preview */}
                <div className="relative overflow-hidden rounded-lg border border-slate-100">
                  <div className="blur-sm pointer-events-none p-4 bg-slate-50">
                    <div className="flex gap-3 mb-3">
                      <div className="flex-1 h-16 bg-emerald-100 rounded flex items-center justify-center text-emerald-600 text-xs font-medium">✓ Strength</div>
                      <div className="flex-1 h-16 bg-amber-100 rounded flex items-center justify-center text-amber-600 text-xs font-medium">⚡ Improvement</div>
                      <div className="flex-1 h-16 bg-rose-100 rounded flex items-center justify-center text-rose-600 text-xs font-medium">⚠ Critical</div>
                    </div>
                    <div className="h-3 bg-slate-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                    <Link
                      href="/pricing"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg font-medium hover:from-violet-700 hover:to-indigo-700 transition-all shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      Unlock Designer&apos;s Eye Review
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Loading state - styled consistently
  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-start gap-4">
            <div className="w-1 h-12 rounded-full bg-violet-500 animate-pulse" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-violet-100 text-violet-700 flex items-center gap-1">
                  <span>👁️</span> Designer&apos;s Eye
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
                  PRO
                </span>
              </div>
              <div className="h-4 bg-slate-200 rounded w-1/3 animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // No review yet - show generate button (styled like recommendation card)
  if (!review) {
    return (
      <section className="mb-8">
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-start gap-4">
              {/* Purple accent bar */}
              <div className="w-1 self-stretch rounded-full bg-gradient-to-b from-violet-500 to-indigo-500" />
              
              <div className="flex-1 min-w-0">
                {/* Header tags */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-violet-100 text-violet-700 flex items-center gap-1">
                    <span>👁️</span> Designer&apos;s Eye
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
                    PRO
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                    AI-Powered Critique
                  </span>
                </div>
                
                {/* Title */}
                <h3 className="font-semibold text-slate-900 mb-1">
                  Generate Designer&apos;s Eye Review
                </h3>
                
                {/* Description */}
                <p className="text-sm text-slate-600 mb-4">
                  Get qualitative feedback that goes beyond scores—covering visual appeal, emotional impact, missing elements, and prioritised recommendations.
                </p>
                
                {error && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
                    {error}
                  </div>
                )}
                
                <button
                  onClick={generateReview}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg font-medium hover:from-violet-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Analysing Design (30-60s)...
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      Generate Review
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Count insights by category
  const strengthCount = review.insights.filter(i => i.category === 'strength').length;
  const improvementCount = review.insights.filter(i => i.category === 'improvement').length;
  const criticalCount = review.insights.filter(i => i.category === 'critical').length;
  const visualAppealColors = getVisualAppealColor(review.visual_appeal_rating);

  // Show the review - styled like a recommendation card
  return (
    <section className="mb-8">
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
        {/* Header - matching recommendation card layout */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left p-5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          aria-expanded={isExpanded}
        >
          <div className="flex items-start gap-4">
            {/* Purple accent bar */}
            <div className="w-1 self-stretch rounded-full bg-gradient-to-b from-violet-500 to-indigo-500" />
            
            <div className="flex-1 min-w-0">
              {/* Header tags - matching recommendation cards */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-violet-100 text-violet-700 flex items-center gap-1">
                  <span>👁️</span> Designer&apos;s Eye
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${visualAppealColors.bg} ${visualAppealColors.text}`}>
                  Visual Appeal: {review.visual_appeal_rating}/10
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-50 text-slate-500 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {new Date(review.generated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
                  PRO
                </span>
              </div>
              
              {/* Title */}
              <h3 className="font-semibold text-slate-900 mb-1">
                Expert Design Critique
              </h3>
              
              {/* Mini preview - first line of overall impression */}
              <p className="text-sm text-slate-600 line-clamp-2">
                {review.overall_impression}
              </p>
              
              {/* Insight summary badges */}
              <div className="mt-3 flex items-center gap-3 text-xs">
                {strengthCount > 0 && (
                  <span className="flex items-center gap-1 text-emerald-600">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">✓</span>
                    {strengthCount} strength{strengthCount !== 1 ? 's' : ''}
                  </span>
                )}
                {improvementCount > 0 && (
                  <span className="flex items-center gap-1 text-amber-600">
                    <span className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center text-[10px]">⚡</span>
                    {improvementCount} improvement{improvementCount !== 1 ? 's' : ''}
                  </span>
                )}
                {criticalCount > 0 && (
                  <span className="flex items-center gap-1 text-rose-600">
                    <span className="w-4 h-4 rounded-full bg-rose-100 flex items-center justify-center text-[10px]">⚠</span>
                    {criticalCount} critical
                  </span>
                )}
              </div>
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
          <div className="px-5 pb-5 pt-0 border-t border-slate-100">
            <div className="pt-4 space-y-4">
              {/* Overall Impression - with subtle gradient */}
              <div className="p-4 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-lg border border-violet-100">
                <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <span className="text-violet-600">💭</span> Overall Impression
                </h4>
                <p className="text-sm text-slate-700">{review.overall_impression}</p>
              </div>

              {/* Visual Appeal & First Impression */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Visual Appeal Rating</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${review.visual_appeal_rating * 10}%` }}
                      />
                    </div>
                    <span className={`text-lg font-bold ${visualAppealColors.text.replace('text-', 'text-')}`}>
                      {review.visual_appeal_rating}/10
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{review.visual_appeal_explanation}</p>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <h4 className="text-sm font-medium text-slate-700 mb-2">First Impression (3 seconds)</h4>
                  <p className="text-xs text-slate-600">{review.first_impression_feedback}</p>
                </div>
              </div>

              {/* Insights */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-3">Design Insights</h4>
                <div className="space-y-2">
                  {review.insights.map((insight, idx) => (
                    <div 
                      key={idx}
                      className={`p-3 rounded-lg border ${getCategoryStyles(insight.category)}`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-sm mt-0.5">{getCategoryIcon(insight.category)}</span>
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{insight.title}</h5>
                          <p className="text-xs mt-1 opacity-90">{insight.description}</p>
                          {insight.suggestion && (
                            <p className="text-xs mt-2 font-medium">
                              💡 {insight.suggestion}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing Elements */}
              {review.missing_elements.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Missing Elements</h4>
                  <div className="flex flex-wrap gap-2">
                    {review.missing_elements.map((element, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs"
                      >
                        {element}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Emotional Impact */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="text-sm font-medium text-purple-900 mb-2">
                  Emotional Impact: <span className="text-purple-600">{review.emotional_impact.primaryEmotion}</span>
                </h4>
                <p className="text-xs text-purple-800">{review.emotional_impact.explanation}</p>
                {review.emotional_impact.suggestedImprovement && (
                  <p className="text-xs text-purple-700 mt-2">
                    <span className="font-medium">To improve:</span> {review.emotional_impact.suggestedImprovement}
                  </p>
                )}
              </div>

              {/* Top Priorities */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">Top Priorities</h4>
                <ol className="space-y-2">
                  {review.top_priorities.map((priority, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-slate-600">{priority}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Refresh button */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    generateReview();
                  }}
                  disabled={isGenerating}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
                >
                  {isGenerating ? 'Regenerating...' : '🔄 Regenerate Review'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

