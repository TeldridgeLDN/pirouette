'use client';

/**
 * Competitor Comparison Component
 * 
 * Shows side-by-side comparison with competitor analyses.
 * Pro feature - shows locked preview for free users.
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// ============================================================================
// Types
// ============================================================================

interface CompetitorReport {
  id: string;
  url: string;
  name?: string; // Optional friendly name
  overall_score: number;
  colors_score: number | null;
  whitespace_score: number | null;
  complexity_score: number | null;
  typography_score: number | null;
  layout_score: number | null;
  cta_score: number | null;
  hierarchy_score: number | null;
}

interface CompetitorAnalysis {
  id: string;
  competitor_url: string;
  competitor_name?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  overall_score: number;
  colors_score: number | null;
  whitespace_score: number | null;
  complexity_score: number | null;
  typography_score: number | null;
  layout_score: number | null;
  cta_score: number | null;
  hierarchy_score: number | null;
  error_message?: string;
}

interface CompetitorComparisonProps {
  userReport: CompetitorReport;
  competitors?: CompetitorReport[];
  isPro: boolean;
  reportId?: string;
}

// ============================================================================
// Constants
// ============================================================================

const DIMENSIONS = [
  { key: 'overall_score', name: 'Overall', icon: '📊' },
  { key: 'colors_score', name: 'Colours', icon: '🎨' },
  { key: 'whitespace_score', name: 'Whitespace', icon: '📐' },
  { key: 'complexity_score', name: 'Complexity', icon: '🧩' },
  { key: 'typography_score', name: 'Typography', icon: '🔤' },
  { key: 'layout_score', name: 'Layout', icon: '📱' },
  { key: 'cta_score', name: 'CTA', icon: '🎯' },
  { key: 'hierarchy_score', name: 'Hierarchy', icon: '👁️' },
];

const POLL_INTERVAL = 3000; // 3 seconds

// ============================================================================
// Component
// ============================================================================

export default function CompetitorComparison({ 
  userReport, 
  competitors: initialCompetitors = [], 
  isPro,
  reportId,
}: CompetitorComparisonProps) {
  const [competitors, setCompetitors] = useState<CompetitorReport[]>(initialCompetitors);
  const [analyses, setAnalyses] = useState<CompetitorAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urls, setUrls] = useState(['', '', '']);
  
  // Convert completed analyses to competitor reports format
  const completedCompetitors: CompetitorReport[] = analyses
    .filter(a => a.status === 'completed')
    .map(a => ({
      id: a.id,
      url: a.competitor_url,
      name: a.competitor_name,
      overall_score: a.overall_score,
      colors_score: a.colors_score,
      whitespace_score: a.whitespace_score,
      complexity_score: a.complexity_score,
      typography_score: a.typography_score,
      layout_score: a.layout_score,
      cta_score: a.cta_score,
      hierarchy_score: a.hierarchy_score,
    }));
  
  // Combine passed competitors with fetched ones
  const allCompetitors = [...competitors, ...completedCompetitors];
  
  // Check if any analyses are still processing
  const hasProcessing = analyses.some(a => a.status === 'pending' || a.status === 'processing');
  
  // Fetch existing analyses on mount
  const fetchAnalyses = useCallback(async () => {
    if (!reportId || !isPro) return;
    
    try {
      const response = await fetch(`/api/competitors/analyze?reportId=${reportId}`);
      const data = await response.json();
      
      if (data.success && data.analyses) {
        setAnalyses(data.analyses);
      }
    } catch (err) {
      console.error('Error fetching competitor analyses:', err);
    }
  }, [reportId, isPro]);
  
  // Fetch on mount
  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);
  
  // Poll for updates while processing
  useEffect(() => {
    if (!hasProcessing) return;
    
    const interval = setInterval(fetchAnalyses, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [hasProcessing, fetchAnalyses]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const validUrls = urls.filter(url => url.trim() !== '');
    
    if (validUrls.length === 0) {
      setError('Please enter at least one competitor URL');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/competitors/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId,
          competitors: validUrls,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to start competitor analysis');
      }
      
      // Clear form on success
      setUrls(['', '', '']);
      
      // Refresh analyses
      await fetchAnalyses();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start analysis');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Free users see locked preview
  if (!isPro) {
    return <LockedPreview />;
  }

  // Pro users with no competitors and no analyses see "Add competitors" prompt
  if (allCompetitors.length === 0 && analyses.length === 0) {
    return (
      <AddCompetitorsForm
        userReport={userReport}
        urls={urls}
        setUrls={setUrls}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
      />
    );
  }
  
  // Show processing state while analyses are running
  if (hasProcessing && allCompetitors.length === 0) {
    return (
      <ProcessingState
        analyses={analyses}
        onAddMore={() => {
          // Show form for adding more competitors
        }}
      />
    );
  }

  // Pro users with competitors see full comparison
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🆚</span>
            <h3 className="font-semibold text-slate-900">Competitor Comparison</h3>
            <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full">
              PRO
            </span>
          </div>
          {hasProcessing && (
            <span className="flex items-center gap-1.5 text-sm text-indigo-600">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analysing...
            </span>
          )}
        </div>
        <p className="text-sm text-slate-600 mt-1">
          See how you stack up against {allCompetitors.length} competitor{allCompetitors.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Comparison Table */}
      <div className="p-6 overflow-x-auto">
        <ComparisonTable userReport={userReport} competitors={allCompetitors} />
      </div>

      {/* Insights */}
      <div className="px-6 pb-6">
        <CompetitiveInsights userReport={userReport} competitors={allCompetitors} />
      </div>
      
      {/* Add more competitors (if under limit) */}
      {analyses.length < 3 && (
        <div className="px-6 pb-6 border-t border-slate-100 pt-4">
          <AddMoreCompetitors
            currentCount={analyses.length}
            urls={urls}
            setUrls={setUrls}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
          />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function LockedPreview() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="font-semibold text-slate-900 mb-2">Competitor Comparison</h3>
        <p className="text-sm text-slate-600 mb-4">
          See how your landing page compares to up to 3 competitors
        </p>
        
        {/* Mock comparison preview */}
        <div className="bg-slate-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-4 gap-2 text-xs text-slate-400 mb-2">
            <div>Dimension</div>
            <div className="text-center">You</div>
            <div className="text-center blur-sm">Comp A</div>
            <div className="text-center blur-sm">Comp B</div>
          </div>
          <div className="space-y-2">
            {['Overall', 'CTA', 'Typography'].map((dim) => (
              <div key={dim} className="grid grid-cols-4 gap-2 text-sm">
                <div className="text-slate-500">{dim}</div>
                <div className="text-center font-medium text-slate-700">72</div>
                <div className="text-center font-medium text-slate-300 blur-sm">85</div>
                <div className="text-center font-medium text-slate-300 blur-sm">68</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-6">
          <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">Side-by-side scores</span>
          <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">Competitive gaps</span>
          <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">Your advantages</span>
        </div>
        
        <Link
          href="/pricing"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Upgrade to Pro →
        </Link>
      </div>
    </div>
  );
}

interface FormProps {
  urls: string[];
  setUrls: (urls: string[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error: string | null;
}

function AddCompetitorsForm({ 
  userReport, 
  urls, 
  setUrls, 
  onSubmit, 
  isLoading, 
  error 
}: FormProps & { userReport: CompetitorReport }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
          <span className="text-xl">🆚</span>
        </div>
        <h3 className="font-semibold text-slate-900 mb-2">Compare with Competitors</h3>
        <p className="text-sm text-slate-600 mb-6">
          Add up to 3 competitor URLs to see how {formatUrl(userReport.url)} stacks up
        </p>
        
        {/* Competitor input form */}
        <form onSubmit={onSubmit} className="max-w-md mx-auto space-y-3">
          {urls.map((url, idx) => (
            <input
              key={idx}
              type="url"
              placeholder={idx === 0 ? 'Competitor 1 URL (e.g., competitor.com)' : `Competitor ${idx + 1} URL (optional)`}
              value={url}
              onChange={(e) => {
                const newUrls = [...urls];
                newUrls[idx] = e.target.value;
                setUrls(newUrls);
              }}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          ))}
          
          {error && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Starting Analysis...
              </>
            ) : (
              'Analyse Competitors'
            )}
          </button>
        </form>
        
        <p className="text-xs text-slate-400 mt-4">
          Each competitor analysis uses your Pro quota
        </p>
      </div>
    </div>
  );
}

function ProcessingState({ analyses }: { analyses: CompetitorAnalysis[]; onAddMore: () => void }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
          <svg className="animate-spin h-6 w-6 text-indigo-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <h3 className="font-semibold text-slate-900 mb-2">Analysing Competitors</h3>
        <p className="text-sm text-slate-600 mb-6">
          This usually takes 30-60 seconds per competitor
        </p>
        
        {/* Status list */}
        <div className="max-w-md mx-auto space-y-2">
          {analyses.map((analysis) => (
            <div 
              key={analysis.id}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
            >
              <span className="text-sm text-slate-700 truncate max-w-[200px]">
                {formatUrl(analysis.competitor_url)}
              </span>
              <StatusBadge status={analysis.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'pending':
    case 'processing':
      return (
        <span className="flex items-center gap-1.5 text-xs text-indigo-600">
          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Processing
        </span>
      );
    case 'completed':
      return (
        <span className="flex items-center gap-1 text-xs text-emerald-600">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Complete
        </span>
      );
    case 'failed':
      return (
        <span className="flex items-center gap-1 text-xs text-red-600">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Failed
        </span>
      );
    default:
      return null;
  }
}

function AddMoreCompetitors({ currentCount, urls, setUrls, onSubmit, isLoading, error }: FormProps & { currentCount: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const remainingSlots = 3 - currentCount;
  
  if (remainingSlots <= 0) return null;
  
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
      >
        + Add more competitors ({remainingSlots} slot{remainingSlots > 1 ? 's' : ''} remaining)
      </button>
    );
  }
  
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-700">Add More Competitors</h4>
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="text-xs text-slate-400 hover:text-slate-600"
        >
          Cancel
        </button>
      </div>
      
      {urls.slice(0, remainingSlots).map((url, idx) => (
        <input
          key={idx}
          type="url"
          placeholder={`Competitor URL ${currentCount + idx + 1}`}
          value={url}
          onChange={(e) => {
            const newUrls = [...urls];
            newUrls[idx] = e.target.value;
            setUrls(newUrls);
          }}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      ))}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      <button
        type="submit"
        disabled={isLoading}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        {isLoading ? 'Starting...' : 'Analyse'}
      </button>
    </form>
  );
}

function ComparisonTable({ userReport, competitors }: { userReport: CompetitorReport; competitors: CompetitorReport[] }) {
  const allReports = [userReport, ...competitors];
  
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-slate-200">
          <th className="py-3 px-2 text-left text-sm font-medium text-slate-500">Dimension</th>
          <th className="py-3 px-2 text-center text-sm font-medium text-indigo-600 bg-indigo-50 rounded-t">
            You
            <div className="text-xs font-normal text-slate-400 truncate max-w-24">
              {formatUrl(userReport.url)}
            </div>
          </th>
          {competitors.map((comp, idx) => (
            <th key={comp.id} className="py-3 px-2 text-center text-sm font-medium text-slate-500">
              {comp.name || `Competitor ${idx + 1}`}
              <div className="text-xs font-normal text-slate-400 truncate max-w-24">
                {formatUrl(comp.url)}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {DIMENSIONS.map((dim) => {
          const scores = allReports.map(r => r[dim.key as keyof CompetitorReport] as number | null);
          const validScores = scores.filter((s): s is number => s !== null);
          const maxScore = Math.max(...validScores);
          const avgScore = validScores.reduce((a, b) => a + b, 0) / validScores.length;
          const userScore = scores[0];
          
          return (
            <tr key={dim.key} className="border-b border-slate-100">
              <td className="py-3 px-2">
                <div className="flex items-center gap-2">
                  <span>{dim.icon}</span>
                  <span className="text-sm text-slate-700">{dim.name}</span>
                </div>
              </td>
              <td className="py-3 px-2 text-center bg-indigo-50/50">
                <ScoreCell 
                  score={userScore} 
                  isMax={userScore === maxScore && validScores.length > 1}
                  isMin={userScore !== null && userScore < avgScore}
                />
              </td>
              {competitors.map((comp) => {
                const compScore = comp[dim.key as keyof CompetitorReport] as number | null;
                return (
                  <td key={comp.id} className="py-3 px-2 text-center">
                    <ScoreCell 
                      score={compScore} 
                      isMax={compScore === maxScore && validScores.length > 1}
                    />
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function ScoreCell({ score, isMax, isMin }: { score: number | null; isMax?: boolean; isMin?: boolean }) {
  if (score === null) return <span className="text-slate-300">—</span>;
  
  return (
    <div className="inline-flex items-center gap-1">
      <span className={`font-semibold ${getScoreColor(score)}`}>
        {score}
      </span>
      {isMax && (
        <span className="text-emerald-500 text-xs" title="Best">👑</span>
      )}
      {isMin && !isMax && (
        <span className="text-amber-500 text-xs" title="Below average">⚠️</span>
      )}
    </div>
  );
}

function CompetitiveInsights({ userReport, competitors }: { userReport: CompetitorReport; competitors: CompetitorReport[] }) {
  const gaps: { dimension: string; gap: number; competitor: string }[] = [];
  const advantages: { dimension: string; lead: number }[] = [];
  
  DIMENSIONS.forEach((dim) => {
    if (dim.key === 'overall_score') return; // Skip overall for insights
    
    const userScore = userReport[dim.key as keyof CompetitorReport] as number | null;
    if (userScore === null) return;
    
    competitors.forEach((comp, idx) => {
      const compScore = comp[dim.key as keyof CompetitorReport] as number | null;
      if (compScore === null) return;
      
      const diff = userScore - compScore;
      if (diff < -10) {
        gaps.push({
          dimension: dim.name,
          gap: Math.abs(diff),
          competitor: comp.name || `Competitor ${idx + 1}`,
        });
      } else if (diff > 10) {
        // Only add advantage if not already added
        if (!advantages.find(a => a.dimension === dim.name)) {
          advantages.push({
            dimension: dim.name,
            lead: diff,
          });
        }
      }
    });
  });
  
  // Sort by biggest gap/lead
  gaps.sort((a, b) => b.gap - a.gap);
  advantages.sort((a, b) => b.lead - a.lead);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Competitive Gaps */}
      <div className="bg-red-50 rounded-xl p-4">
        <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
          <span>📉</span> Competitive Gaps
        </h4>
        {gaps.length > 0 ? (
          <ul className="space-y-2">
            {gaps.slice(0, 3).map((gap, idx) => (
              <li key={idx} className="text-sm text-red-700">
                <span className="font-medium">{gap.dimension}</span> is {gap.gap} points behind {gap.competitor}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-red-600">No significant gaps found! 🎉</p>
        )}
      </div>

      {/* Your Advantages */}
      <div className="bg-emerald-50 rounded-xl p-4">
        <h4 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
          <span>🏆</span> Your Advantages
        </h4>
        {advantages.length > 0 ? (
          <ul className="space-y-2">
            {advantages.slice(0, 3).map((adv, idx) => (
              <li key={idx} className="text-sm text-emerald-700">
                <span className="font-medium">{adv.dimension}</span> is {adv.lead} points ahead of competitors
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-emerald-600">Implement recommendations to build advantages</p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function formatUrl(url: string): string {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
}
