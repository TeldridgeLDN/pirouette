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

  // Free user teaser
  if (!isPro) {
    return (
      <section className="mb-8">
        <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl border border-indigo-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white text-lg">👁️</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Designer&apos;s Eye Review
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded">PRO</span>
              </h2>
              <p className="text-sm text-slate-600">Professional-level design critique</p>
            </div>
          </div>
          
          {/* Blurred preview */}
          <div className="relative overflow-hidden rounded-lg">
            <div className="blur-sm pointer-events-none p-4 bg-white">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-4" />
              <div className="flex gap-2 mb-3">
                <div className="h-20 bg-emerald-100 rounded flex-1" />
                <div className="h-20 bg-amber-100 rounded flex-1" />
                <div className="h-20 bg-rose-100 rounded flex-1" />
              </div>
              <div className="h-4 bg-slate-200 rounded w-2/3" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-white/60">
              <div className="text-center">
                <p className="text-slate-700 font-medium mb-3">
                  Get expert-level design feedback on this landing page
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg font-medium hover:from-violet-700 hover:to-indigo-700 transition-all"
                >
                  Unlock Designer&apos;s Eye Review
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center animate-pulse">
              <span className="text-white text-lg">👁️</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Designer&apos;s Eye Review</h2>
              <p className="text-sm text-slate-500">Loading...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // No review yet - show generate button
  if (!review) {
    return (
      <section className="mb-8">
        <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl border border-indigo-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white text-lg">👁️</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Designer&apos;s Eye Review
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded">PRO</span>
              </h2>
              <p className="text-sm text-slate-600">Get expert-level design critique for this landing page</p>
            </div>
          </div>
          
          <p className="text-slate-700 mb-4">
            Our Designer&apos;s Eye Review provides qualitative feedback that goes beyond scores—covering visual appeal, 
            emotional impact, missing elements, and prioritised recommendations.
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
              {error}
            </div>
          )}
          
          <button
            onClick={generateReview}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg font-medium hover:from-violet-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating Review (30-60s)...
              </>
            ) : (
              <>
                <span>👁️</span>
                Generate Designer&apos;s Eye Review
              </>
            )}
          </button>
        </div>
      </section>
    );
  }

  // Show the review
  return (
    <section className="mb-8">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white text-lg">👁️</span>
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Designer&apos;s Eye Review
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded">PRO</span>
              </h2>
              <p className="text-sm text-slate-600">
                Visual Appeal: <span className="font-semibold text-indigo-600">{review.visual_appeal_rating}/10</span>
                {' · '}
                <span className="text-slate-500">Generated {new Date(review.generated_at).toLocaleDateString()}</span>
              </p>
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Expanded content */}
        {isExpanded && (
          <div className="px-6 pb-6 border-t border-slate-100">
            {/* Overall Impression */}
            <div className="mt-4 p-4 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-2">Overall Impression</h3>
              <p className="text-slate-700">{review.overall_impression}</p>
            </div>

            {/* Visual Appeal */}
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">Visual Appeal Rating</h3>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full"
                      style={{ width: `${review.visual_appeal_rating * 10}%` }}
                    />
                  </div>
                  <span className="text-lg font-bold text-indigo-600">{review.visual_appeal_rating}/10</span>
                </div>
                <p className="text-sm text-slate-600">{review.visual_appeal_explanation}</p>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">First Impression (3 seconds)</h3>
                <p className="text-sm text-slate-600">{review.first_impression_feedback}</p>
              </div>
            </div>

            {/* Insights */}
            <div className="mt-6">
              <h3 className="font-semibold text-slate-900 mb-3">Design Insights</h3>
              <div className="space-y-3">
                {review.insights.map((insight, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 rounded-lg border ${getCategoryStyles(insight.category)}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{getCategoryIcon(insight.category)}</span>
                      <div className="flex-1">
                        <h4 className="font-medium">{insight.title}</h4>
                        <p className="text-sm mt-1 opacity-90">{insight.description}</p>
                        {insight.suggestion && (
                          <p className="text-sm mt-2 font-medium">
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
              <div className="mt-6">
                <h3 className="font-semibold text-slate-900 mb-3">Missing Elements</h3>
                <div className="flex flex-wrap gap-2">
                  {review.missing_elements.map((element, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-sm"
                    >
                      {element}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Emotional Impact */}
            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">
                Emotional Impact: <span className="text-purple-600">{review.emotional_impact.primaryEmotion}</span>
              </h3>
              <p className="text-sm text-purple-800">{review.emotional_impact.explanation}</p>
              {review.emotional_impact.suggestedImprovement && (
                <p className="text-sm text-purple-700 mt-2">
                  <span className="font-medium">To improve:</span> {review.emotional_impact.suggestedImprovement}
                </p>
              )}
            </div>

            {/* Top Priorities */}
            <div className="mt-6">
              <h3 className="font-semibold text-slate-900 mb-3">Top Priorities</h3>
              <ol className="space-y-2">
                {review.top_priorities.map((priority, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-slate-700">{priority}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Refresh button */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={generateReview}
                disabled={isGenerating}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
              >
                {isGenerating ? 'Regenerating...' : '🔄 Regenerate Review'}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

