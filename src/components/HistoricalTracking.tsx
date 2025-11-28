'use client';

/**
 * Historical Tracking Component
 * 
 * Shows score trends over time for Pro users.
 * Displays a mini chart and comparison table.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';

// ============================================================================
// Types
// ============================================================================

interface HistoricalReport {
  id: string;
  url: string;
  created_at: string;
  overall_score: number | null;
  colors_score: number | null;
  whitespace_score: number | null;
  complexity_score: number | null;
  typography_score: number | null;
  layout_score: number | null;
  cta_score: number | null;
  hierarchy_score: number | null;
}

interface Improvements {
  overall: number | null;
  colors: number | null;
  whitespace: number | null;
  complexity: number | null;
  typography: number | null;
  layout: number | null;
  cta: number | null;
  hierarchy: number | null;
}

interface HistoricalTrackingProps {
  url: string;
  currentReportId: string;
  isPro: boolean;
}

interface HistoryData {
  reports: HistoricalReport[];
  improvements: Improvements | null;
  totalReports: number;
}

// ============================================================================
// Score Labels
// ============================================================================

const SCORE_LABELS: Record<string, string> = {
  overall: 'Overall',
  colors: 'Colors & Contrast',
  whitespace: 'Whitespace',
  complexity: 'Complexity',
  typography: 'Typography',
  layout: 'Layout',
  cta: 'Call to Action',
  hierarchy: 'Visual Hierarchy',
};

// ============================================================================
// Component
// ============================================================================

export default function HistoricalTracking({ url, currentReportId, isPro }: HistoricalTrackingProps) {
  const [data, setData] = useState<HistoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      if (!isPro) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/reports/history?url=${encodeURIComponent(url)}`);
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || 'Failed to fetch history');
        }
      } catch (err) {
        console.error('Error fetching history:', err);
        setError('Failed to load historical data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, [url, isPro]);

  // Free users see locked preview
  if (!isPro) {
    return <LockedPreview />;
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (!data || data.totalReports <= 1) {
    return <FirstAnalysis />;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center gap-2">
          <span className="text-lg">📈</span>
          <h3 className="font-semibold text-slate-900">Historical Tracking</h3>
          <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full">
            PRO
          </span>
        </div>
        <p className="text-sm text-slate-600 mt-1">
          {data.totalReports} analyses of this URL
        </p>
      </div>

      {/* Trend Chart */}
      <div className="p-6 border-b border-slate-200">
        <TrendChart reports={data.reports} />
      </div>

      {/* Improvement Summary */}
      {data.improvements && (
        <div className="p-6 border-b border-slate-200">
          <ImprovementSummary improvements={data.improvements} />
        </div>
      )}

      {/* Comparison Table */}
      <div className="p-6">
        <ComparisonTable reports={data.reports.slice(0, 5)} currentReportId={currentReportId} />
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
        <h3 className="font-semibold text-slate-900 mb-2">Historical Tracking</h3>
        <p className="text-sm text-slate-600 mb-4">
          Track your improvement over time with Pro
        </p>
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">Score trends</span>
          <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">Compare analyses</span>
          <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">Track progress</span>
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

function FirstAnalysis() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
          <span className="text-xl">🎯</span>
        </div>
        <h3 className="font-semibold text-slate-900 mb-2">First Analysis!</h3>
        <p className="text-sm text-slate-600">
          Run another analysis of this URL later to track your improvement over time.
        </p>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-24 bg-slate-200 rounded mb-4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-slate-200 rounded w-2/3"></div>
          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
}

function TrendChart({ reports }: { reports: HistoricalReport[] }) {
  // Take last 10 reports and reverse for chronological order
  const chartReports = [...reports].slice(0, 10).reverse();
  const scores = chartReports.map(r => r.overall_score || 0);
  const maxScore = 100;
  const minScore = Math.min(...scores, 50);

  return (
    <div>
      <h4 className="text-sm font-medium text-slate-700 mb-3">Overall Score Trend</h4>
      <div className="relative h-32">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-slate-400">
          <span>100</span>
          <span>{Math.round((maxScore + minScore) / 2)}</span>
          <span>{minScore}</span>
        </div>

        {/* Chart area */}
        <div className="ml-10 h-full flex items-end gap-1">
          {chartReports.map((report, index) => {
            const score = report.overall_score || 0;
            const height = ((score - minScore) / (maxScore - minScore)) * 100;
            const isLatest = index === chartReports.length - 1;

            return (
              <div
                key={report.id}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className={`w-full max-w-8 rounded-t transition-all ${
                    isLatest 
                      ? 'bg-gradient-to-t from-indigo-600 to-purple-500' 
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                  style={{ height: `${Math.max(height, 5)}%` }}
                  title={`Score: ${score} - ${formatDate(report.created_at)}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* X-axis labels */}
      <div className="ml-10 flex gap-1 mt-1">
        {chartReports.map((report, index) => (
          <div key={report.id} className="flex-1 text-center">
            <span className="text-[10px] text-slate-400">
              {index === 0 ? 'Oldest' : index === chartReports.length - 1 ? 'Latest' : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImprovementSummary({ improvements }: { improvements: Improvements }) {
  const improvedMetrics = Object.entries(improvements)
    .filter(([, value]) => value !== null && value > 0)
    .sort(([, a], [, b]) => (b || 0) - (a || 0));

  const declinedMetrics = Object.entries(improvements)
    .filter(([, value]) => value !== null && value < 0)
    .sort(([, a], [, b]) => (a || 0) - (b || 0));

  const overallChange = improvements.overall;

  return (
    <div>
      <h4 className="text-sm font-medium text-slate-700 mb-3">Since Last Analysis</h4>

      {/* Overall change highlight */}
      {overallChange !== null && (
        <div className={`p-3 rounded-lg mb-4 ${
          overallChange > 0 
            ? 'bg-emerald-50 border border-emerald-200' 
            : overallChange < 0 
              ? 'bg-red-50 border border-red-200'
              : 'bg-slate-50 border border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {overallChange > 0 ? '🎉' : overallChange < 0 ? '📉' : '➡️'}
            </span>
            <p className={`font-medium ${
              overallChange > 0 
                ? 'text-emerald-700' 
                : overallChange < 0 
                  ? 'text-red-700'
                  : 'text-slate-700'
            }`}>
              {overallChange > 0 
                ? `Overall score improved by ${overallChange} points!` 
                : overallChange < 0 
                  ? `Overall score dropped by ${Math.abs(overallChange)} points`
                  : 'No change in overall score'}
            </p>
          </div>
        </div>
      )}

      {/* Improved metrics */}
      {improvedMetrics.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-slate-500 mb-2">Improvements</p>
          <div className="flex flex-wrap gap-2">
            {improvedMetrics.slice(0, 4).map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                {SCORE_LABELS[key]} +{value}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Declined metrics */}
      {declinedMetrics.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-2">Needs attention</p>
          <div className="flex flex-wrap gap-2">
            {declinedMetrics.slice(0, 4).map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded text-xs"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {SCORE_LABELS[key]} {value}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ComparisonTable({ reports, currentReportId }: { reports: HistoricalReport[]; currentReportId: string }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-slate-700 mb-3">Recent Analyses</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-2 px-2 text-left text-slate-500 font-medium">Date</th>
              <th className="py-2 px-2 text-center text-slate-500 font-medium">Score</th>
              <th className="py-2 px-2 text-center text-slate-500 font-medium">Change</th>
              <th className="py-2 px-2 text-right text-slate-500 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report, index) => {
              const prevReport = reports[index + 1];
              const change = prevReport && report.overall_score !== null && prevReport.overall_score !== null
                ? report.overall_score - prevReport.overall_score
                : null;
              const isCurrent = report.id === currentReportId;

              return (
                <tr key={report.id} className={`border-b border-slate-100 ${isCurrent ? 'bg-indigo-50' : ''}`}>
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      {isCurrent && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500" title="Current report"></span>
                      )}
                      <span className="text-slate-700">{formatDate(report.created_at)}</span>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span className={`font-medium ${getScoreColor(report.overall_score)}`}>
                      {report.overall_score ?? '-'}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center">
                    {change !== null ? (
                      <span className={`text-xs font-medium ${
                        change > 0 ? 'text-emerald-600' : change < 0 ? 'text-red-600' : 'text-slate-400'
                      }`}>
                        {change > 0 ? `+${change}` : change}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-right">
                    {!isCurrent && (
                      <Link
                        href={`/report/${report.id}`}
                        className="text-xs text-indigo-600 hover:text-indigo-700"
                      >
                        View
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

function getScoreColor(score: number | null): string {
  if (score === null) return 'text-slate-400';
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
}

