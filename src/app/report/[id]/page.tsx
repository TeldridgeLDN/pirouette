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

// ============================================================================
// Types
// ============================================================================

interface Recommendation {
  id: string;
  dimension: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  example?: string;
  changeType?: string;
  revenueImpact?: {
    potentialRevenue: number;
    confidenceLevel: 'low' | 'medium' | 'high';
  };
  roiScore?: {
    normalizedScore: number;
    category: 'quick-win' | 'strategic' | 'long-term';
  };
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

function DimensionCard({ 
  name, 
  score, 
  icon 
}: { 
  name: string; 
  score: number | undefined; 
  icon: string;
}) {
  const displayScore = score ?? 0;
  
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className={`text-2xl font-bold ${getScoreColor(displayScore)}`}>
          {displayScore}
        </span>
      </div>
      <div className="text-sm font-medium text-slate-700 mb-2">{name}</div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${getScoreGradient(displayScore)}`}
          style={{ width: `${displayScore}%` }}
        />
      </div>
    </div>
  );
}

function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const priority = getPriorityBadge(recommendation.priority);
  const effort = getEffortBadge(recommendation.effort);
  
  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
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
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                {recommendation.dimension}
              </span>
              {recommendation.roiScore && recommendation.roiScore.category === 'quick-win' && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                  ⚡ Quick Win
                </span>
              )}
            </div>
            
            {/* Title */}
            <h3 className="font-semibold text-slate-900 mb-1">
              {recommendation.title}
            </h3>
            
            {/* Impact preview */}
            <p className="text-sm text-slate-600 line-clamp-2">
              {recommendation.impact}
            </p>
          </div>
          
          {/* Expand icon */}
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
      
      {/* Expanded content */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-0 border-t border-slate-100 mt-0">
          <div className="pt-4 space-y-4">
            {/* Description */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-1">Description</h4>
              <p className="text-sm text-slate-600">{recommendation.description}</p>
            </div>
            
            {/* Impact */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-1">Impact</h4>
              <p className="text-sm text-slate-600">{recommendation.impact}</p>
            </div>
            
            {/* Revenue impact (if available) */}
            {recommendation.revenueImpact && (
              <div className="p-3 bg-emerald-50 rounded-lg">
                <h4 className="text-sm font-medium text-emerald-800 mb-1">💰 Potential Revenue Impact</h4>
                <p className="text-sm text-emerald-700">
                  Up to £{recommendation.revenueImpact.potentialRevenue.toLocaleString()}/month
                  <span className="text-emerald-600 text-xs ml-2">
                    ({recommendation.revenueImpact.confidenceLevel} confidence)
                  </span>
                </p>
              </div>
            )}
            
            {/* Example */}
            {recommendation.example && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-1">Example</h4>
                <p className="text-sm text-slate-600 italic">{recommendation.example}</p>
              </div>
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

export default function ReportPage({ params }: PageProps) {
  const searchParams = useSearchParams();
  const [reportId, setReportId] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [claimStatus, setClaimStatus] = useState<'idle' | 'claiming' | 'claimed' | 'error'>('idle');
  
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
  
  // Sort recommendations by priority
  const sortedRecommendations = [...(report.recommendations || [])].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
  });
  
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
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-all">
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
          <h2 className="text-xl font-bold text-slate-900 mb-4">Analysis Dimensions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {DIMENSIONS.map(dim => (
              <DimensionCard
                key={dim.key}
                name={dim.name}
                score={report[dim.key as keyof Report] as number | undefined}
                icon={dim.icon}
              />
            ))}
          </div>
        </section>
        
        {/* Screenshot Preview */}
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
              </div>
              <div className="p-4">
                <img 
                  src={report.screenshot_url} 
                  alt={`Screenshot of ${report.url}`}
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
            </div>
          </section>
        )}
        
        {/* Recommendations */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">
              Recommendations ({sortedRecommendations.length})
            </h2>
          </div>
          
          {sortedRecommendations.length > 0 ? (
            <div className="space-y-4">
              {sortedRecommendations.map(rec => (
                <RecommendationCard key={rec.id} recommendation={rec} />
              ))}
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

