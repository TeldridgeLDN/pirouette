'use client';

/**
 * Competitor Comparison Component
 * 
 * Shows side-by-side comparison with competitor analyses.
 * Pro feature - shows locked preview for free users.
 */

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

interface CompetitorComparisonProps {
  userReport: CompetitorReport;
  competitors?: CompetitorReport[];
  isPro: boolean;
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

// ============================================================================
// Component
// ============================================================================

export default function CompetitorComparison({ 
  userReport, 
  competitors = [], 
  isPro 
}: CompetitorComparisonProps) {
  // Free users see locked preview
  if (!isPro) {
    return <LockedPreview />;
  }

  // Pro users with no competitors see "Add competitors" prompt
  if (competitors.length === 0) {
    return <AddCompetitorsPrompt userReport={userReport} />;
  }

  // Pro users with competitors see full comparison
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-2">
          <span className="text-lg">🆚</span>
          <h3 className="font-semibold text-slate-900">Competitor Comparison</h3>
          <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full">
            PRO
          </span>
        </div>
        <p className="text-sm text-slate-600 mt-1">
          See how you stack up against {competitors.length} competitor{competitors.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Comparison Table */}
      <div className="p-6 overflow-x-auto">
        <ComparisonTable userReport={userReport} competitors={competitors} />
      </div>

      {/* Insights */}
      <div className="px-6 pb-6">
        <CompetitiveInsights userReport={userReport} competitors={competitors} />
      </div>
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

function AddCompetitorsPrompt({ userReport }: { userReport: CompetitorReport }) {
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
        <div className="max-w-md mx-auto space-y-3">
          <input
            type="url"
            placeholder="Competitor 1 URL (e.g., competitor.com)"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <input
            type="url"
            placeholder="Competitor 2 URL (optional)"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <input
            type="url"
            placeholder="Competitor 3 URL (optional)"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            onClick={() => alert('Competitor analysis coming soon!')}
          >
            Analyse Competitors
          </button>
        </div>
        
        <p className="text-xs text-slate-400 mt-4">
          Each competitor analysis uses your Pro quota
        </p>
      </div>
    </div>
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

