'use client';

/**
 * Historical Tracking Component
 * 
 * Enhanced component showing score trends over time for Pro users.
 * Features:
 * - SVG line chart with interactive points
 * - Date filtering (30d, 3mo, all time)
 * - Compare two specific analyses
 * - CSV export
 * - Re-analyze button
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

type DateFilter = '30d' | '3mo' | 'all';

// ============================================================================
// Score Labels
// ============================================================================

const SCORE_LABELS: Record<string, string> = {
  overall: 'Overall',
  colors: 'Colours & Contrast',
  whitespace: 'Whitespace',
  complexity: 'Visual Hierarchy',
  typography: 'Typography',
  layout: 'Layout',
  cta: 'Call to Action',
  hierarchy: 'Content Hierarchy',
};

const DIMENSION_KEYS = [
  { key: 'overall_score', label: 'Overall' },
  { key: 'colors_score', label: 'Colours' },
  { key: 'whitespace_score', label: 'Whitespace' },
  { key: 'complexity_score', label: 'Complexity' },
  { key: 'typography_score', label: 'Typography' },
  { key: 'layout_score', label: 'Layout' },
  { key: 'cta_score', label: 'CTA' },
  { key: 'hierarchy_score', label: 'Hierarchy' },
];

// ============================================================================
// Component
// ============================================================================

export default function HistoricalTracking({ url, currentReportId, isPro }: HistoricalTrackingProps) {
  const router = useRouter();
  const [data, setData] = useState<HistoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  // Fetch history data
  useEffect(() => {
    async function fetchHistory() {
      if (!isPro) {
        setIsLoading(false);
        return;
      }

      // MOCK DATA FOR PROMOTIONAL SCREENSHOT
      const mockData: HistoryData = {
        reports: [
          {
            id: 'mock-6',
            url: url,
            created_at: '2025-11-30T10:00:00Z',
            overall_score: 82,
            colors_score: 78,
            whitespace_score: 85,
            complexity_score: 75,
            typography_score: 88,
            layout_score: 80,
            cta_score: 86,
            hierarchy_score: 79,
          },
          {
            id: 'mock-5',
            url: url,
            created_at: '2025-11-23T10:00:00Z',
            overall_score: 78,
            colors_score: 72,
            whitespace_score: 82,
            complexity_score: 71,
            typography_score: 85,
            layout_score: 78,
            cta_score: 82,
            hierarchy_score: 74,
          },
          {
            id: 'mock-4',
            url: url,
            created_at: '2025-11-15T10:00:00Z',
            overall_score: 74,
            colors_score: 68,
            whitespace_score: 78,
            complexity_score: 68,
            typography_score: 82,
            layout_score: 75,
            cta_score: 78,
            hierarchy_score: 70,
          },
          {
            id: 'mock-3',
            url: url,
            created_at: '2025-11-08T10:00:00Z',
            overall_score: 71,
            colors_score: 65,
            whitespace_score: 75,
            complexity_score: 65,
            typography_score: 78,
            layout_score: 72,
            cta_score: 75,
            hierarchy_score: 68,
          },
          {
            id: 'mock-2',
            url: url,
            created_at: '2025-10-30T10:00:00Z',
            overall_score: 68,
            colors_score: 62,
            whitespace_score: 72,
            complexity_score: 62,
            typography_score: 75,
            layout_score: 70,
            cta_score: 72,
            hierarchy_score: 65,
          },
          {
            id: 'mock-1',
            url: url,
            created_at: '2025-10-22T10:00:00Z',
            overall_score: 65,
            colors_score: 58,
            whitespace_score: 68,
            complexity_score: 58,
            typography_score: 72,
            layout_score: 68,
            cta_score: 68,
            hierarchy_score: 62,
          },
        ],
        improvements: {
          overall: 4,
          colors: 6,
          whitespace: 3,
          complexity: 4,
          typography: 3,
          layout: 2,
          cta: 4,
          hierarchy: 5,
        },
        totalReports: 6,
      };
      
      setData(mockData);
      setIsLoading(false);
      return;
      // END MOCK DATA

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

  // Filter reports by date
  const filteredReports = useMemo(() => {
    if (!data?.reports) return [];
    
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (dateFilter) {
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '3mo':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case 'all':
      default:
        return data.reports;
    }
    
    return data.reports.filter(r => new Date(r.created_at) >= cutoffDate);
  }, [data?.reports, dateFilter]);

  // Handle re-analyze
  const handleReanalyze = useCallback(async () => {
    if (isReanalyzing) return;
    
    setIsReanalyzing(true);
    
    try {
      const response = await fetch('/api/reports/reanalyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url, 
          previousReportId: currentReportId 
        }),
      });
      
      const result = await response.json();
      
      if (result.success && result.jobId) {
        // Redirect to the analysis page to track progress
        router.push(`/analyze/${result.jobId}`);
      } else {
        console.error('Re-analyze failed:', result.error);
        alert(result.error || 'Failed to start re-analysis');
      }
    } catch (err) {
      console.error('Error re-analyzing:', err);
      alert('Failed to start re-analysis. Please try again.');
    } finally {
      setIsReanalyzing(false);
    }
  }, [url, currentReportId, router, isReanalyzing]);

  // Handle report selection for comparison
  const toggleReportSelection = useCallback((reportId: string) => {
    setSelectedReports(prev => {
      if (prev.includes(reportId)) {
        return prev.filter(id => id !== reportId);
      }
      if (prev.length >= 2) {
        return [prev[1], reportId]; // Keep last selected + new
      }
      return [...prev, reportId];
    });
  }, []);

  // Export to CSV
  const exportToCSV = useCallback(() => {
    if (!data?.reports || data.reports.length === 0) return;
    
    const headers = ['Date', 'Overall', 'Colours', 'Whitespace', 'Complexity', 'Typography', 'Layout', 'CTA', 'Hierarchy', 'Report ID'];
    
    const rows = filteredReports.map(report => [
      formatDate(report.created_at),
      report.overall_score ?? '',
      report.colors_score ?? '',
      report.whitespace_score ?? '',
      report.complexity_score ?? '',
      report.typography_score ?? '',
      report.layout_score ?? '',
      report.cta_score ?? '',
      report.hierarchy_score ?? '',
      report.id,
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const urlObj = window.URL.createObjectURL(blob);
    link.setAttribute('href', urlObj);
    link.setAttribute('download', `pirouette-history-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [data?.reports, filteredReports]);

  // Get comparison data
  const comparisonData = useMemo(() => {
    if (selectedReports.length !== 2 || !data?.reports) return null;
    
    const [olderId, newerId] = selectedReports;
    const older = data.reports.find(r => r.id === olderId);
    const newer = data.reports.find(r => r.id === newerId);
    
    if (!older || !newer) return null;
    
    // Ensure correct order (older first)
    const [first, second] = new Date(older.created_at) < new Date(newer.created_at) 
      ? [older, newer] 
      : [newer, older];
    
    return { first, second };
  }, [selectedReports, data?.reports]);

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
    return <FirstAnalysis url={url} onReanalyze={handleReanalyze} isReanalyzing={isReanalyzing} />;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">📈</span>
              <h3 className="font-semibold text-slate-900">Historical Tracking</h3>
              <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full">
                PRO
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              {data.totalReports} {data.totalReports === 1 ? 'analysis' : 'analyses'} of this URL
            </p>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleReanalyze}
              disabled={isReanalyzing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isReanalyzing ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Starting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Re-analyse
                </>
              )}
            </button>
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
              title="Export history to CSV"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV
            </button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          {/* Date filter */}
          <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-slate-200">
            {(['30d', '3mo', 'all'] as DateFilter[]).map(filter => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  dateFilter === filter
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {filter === '30d' ? 'Last 30 days' : filter === '3mo' ? 'Last 3 months' : 'All time'}
              </button>
            ))}
          </div>
          
          {/* Compare mode toggle */}
          <button
            onClick={() => {
              setCompareMode(!compareMode);
              setSelectedReports([]);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              compareMode
                ? 'bg-violet-100 text-violet-700 border border-violet-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {compareMode ? 'Exit Compare' : 'Compare Analyses'}
          </button>
        </div>
      </div>

      {/* Compare Mode Hint */}
      {compareMode && (
        <div className="px-6 py-3 bg-violet-50 border-b border-violet-100">
          <p className="text-sm text-violet-700">
            {selectedReports.length === 0 && 'Select two analyses from the table below to compare them'}
            {selectedReports.length === 1 && 'Select one more analysis to compare'}
            {selectedReports.length === 2 && 'Comparing two analyses. Select a different one to swap.'}
          </p>
        </div>
      )}

      {/* Comparison View */}
      {compareMode && comparisonData && (
        <div className="p-6 border-b border-slate-200 bg-violet-50/50">
          <ComparisonView first={comparisonData.first} second={comparisonData.second} />
        </div>
      )}

      {/* Line Chart */}
      {!compareMode && filteredReports.length > 1 && (
        <div className="p-6 border-b border-slate-200">
          <LineChart reports={filteredReports} currentReportId={currentReportId} />
        </div>
      )}

      {/* Improvement Summary */}
      {!compareMode && data.improvements && (
        <div className="p-6 border-b border-slate-200">
          <ImprovementSummary improvements={data.improvements} />
        </div>
      )}

      {/* Comparison Table */}
      <div className="p-6">
        <ComparisonTable 
          reports={filteredReports.slice(0, 10)} 
          currentReportId={currentReportId}
          compareMode={compareMode}
          selectedReports={selectedReports}
          onToggleSelection={toggleReportSelection}
        />
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
          <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">Export data</span>
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

function FirstAnalysis({ url, onReanalyze, isReanalyzing }: { url: string; onReanalyze: () => void; isReanalyzing: boolean }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
          <span className="text-xl">🎯</span>
        </div>
        <h3 className="font-semibold text-slate-900 mb-2">First Analysis!</h3>
        <p className="text-sm text-slate-600 mb-4">
          This is the first analysis of <span className="font-medium">{url}</span>.
          <br />
          Re-analyse later to track your improvement over time.
        </p>
        <button
          onClick={onReanalyze}
          disabled={isReanalyzing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {isReanalyzing ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Starting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Re-analyse Now
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-32 bg-slate-200 rounded mb-4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-slate-200 rounded w-2/3"></div>
          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
}

function LineChart({ reports, currentReportId }: { reports: HistoricalReport[]; currentReportId: string }) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  
  // Chronological order for chart
  const chartReports = useMemo(() => [...reports].reverse(), [reports]);
  const scores = chartReports.map(r => r.overall_score || 0);
  
  // Chart dimensions
  const width = 600;
  const height = 200;
  const padding = { top: 20, right: 40, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  // Scale calculations
  const minScore = Math.max(0, Math.min(...scores) - 10);
  const maxScore = Math.min(100, Math.max(...scores) + 10);
  const xStep = chartReports.length > 1 ? chartWidth / (chartReports.length - 1) : chartWidth / 2;
  
  // Generate path
  const pathPoints = chartReports.map((report, index) => {
    const x = padding.left + (index * xStep);
    const y = padding.top + chartHeight - ((report.overall_score || 0) - minScore) / (maxScore - minScore) * chartHeight;
    return { x, y, report };
  });
  
  const linePath = pathPoints.map((point, i) => 
    `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');
  
  // Gradient area path
  const areaPath = `${linePath} L ${pathPoints[pathPoints.length - 1]?.x || 0} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`;

  return (
    <div>
      <h4 className="text-sm font-medium text-slate-700 mb-3">Score Trend Over Time</h4>
      <div className="relative">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-auto"
          style={{ maxHeight: '250px' }}
        >
          {/* Grid lines */}
          {[minScore, (minScore + maxScore) / 2, maxScore].map((score, i) => {
            const y = padding.top + chartHeight - ((score - minScore) / (maxScore - minScore) * chartHeight);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  fontSize="12"
                  fill="#94a3b8"
                  textAnchor="end"
                >
                  {Math.round(score)}
                </text>
              </g>
            );
          })}
          
          {/* Gradient area */}
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#areaGradient)" />
          
          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          
          {/* Data points */}
          {pathPoints.map((point, index) => {
            const isCurrent = point.report.id === currentReportId;
            const isHovered = hoveredPoint === index;
            const radius = isCurrent ? 8 : isHovered ? 7 : 5;
            
            return (
              <g key={point.report.id}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={radius}
                  fill={isCurrent ? '#6366f1' : isHovered ? '#818cf8' : '#fff'}
                  stroke={isCurrent ? '#4f46e5' : '#6366f1'}
                  strokeWidth="2"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredPoint(index)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                {isCurrent && (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={12}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2"
                    strokeOpacity="0.3"
                  />
                )}
              </g>
            );
          })}
          
          {/* X-axis labels */}
          {pathPoints.map((point, index) => {
            // Show label for first, last, and current
            const showLabel = index === 0 || index === pathPoints.length - 1 || point.report.id === currentReportId;
            if (!showLabel && pathPoints.length > 5) return null;
            
            return (
              <text
                key={`label-${point.report.id}`}
                x={point.x}
                y={height - 10}
                fontSize="10"
                fill="#94a3b8"
                textAnchor="middle"
              >
                {formatShortDate(point.report.created_at)}
              </text>
            );
          })}
        </svg>
        
        {/* Tooltip */}
        {hoveredPoint !== null && pathPoints[hoveredPoint] && (
          <div
            className="absolute bg-slate-900 text-white text-xs rounded-lg px-3 py-2 pointer-events-none shadow-lg z-10"
            style={{
              left: `${(pathPoints[hoveredPoint].x / width) * 100}%`,
              top: `${(pathPoints[hoveredPoint].y / height) * 100 - 15}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="font-semibold">{pathPoints[hoveredPoint].report.overall_score}/100</div>
            <div className="text-slate-400">{formatDate(pathPoints[hoveredPoint].report.created_at)}</div>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-indigo-600 border-2 border-indigo-400"></div>
          <span>Current analysis</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-white border-2 border-indigo-500"></div>
          <span>Previous analyses</span>
        </div>
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

function ComparisonView({ first, second }: { first: HistoricalReport; second: HistoricalReport }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-slate-700 mb-4">Comparing Analyses</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* First analysis */}
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Earlier Analysis</div>
          <div className="text-sm font-medium text-slate-700 mb-2">{formatDate(first.created_at)}</div>
          <div className="text-3xl font-bold text-slate-900">{first.overall_score}</div>
        </div>
        
        {/* Difference */}
        <div className="bg-white rounded-lg p-4 border border-slate-200 flex flex-col items-center justify-center">
          {(() => {
            const diff = (second.overall_score || 0) - (first.overall_score || 0);
            const isImproved = diff > 0;
            return (
              <>
                <div className={`text-3xl font-bold ${isImproved ? 'text-emerald-600' : diff < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                  {isImproved ? '+' : ''}{diff}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {isImproved ? 'Improvement' : diff < 0 ? 'Decline' : 'No change'}
                </div>
              </>
            );
          })()}
        </div>
        
        {/* Second analysis */}
        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Later Analysis</div>
          <div className="text-sm font-medium text-slate-700 mb-2">{formatDate(second.created_at)}</div>
          <div className="text-3xl font-bold text-slate-900">{second.overall_score}</div>
        </div>
      </div>
      
      {/* Dimension comparison */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-violet-200">
              <th className="py-2 px-2 text-left text-slate-600 font-medium">Dimension</th>
              <th className="py-2 px-2 text-center text-slate-600 font-medium">{formatShortDate(first.created_at)}</th>
              <th className="py-2 px-2 text-center text-slate-600 font-medium">Change</th>
              <th className="py-2 px-2 text-center text-slate-600 font-medium">{formatShortDate(second.created_at)}</th>
            </tr>
          </thead>
          <tbody>
            {DIMENSION_KEYS.map(({ key, label }) => {
              const firstScore = first[key as keyof HistoricalReport] as number | null;
              const secondScore = second[key as keyof HistoricalReport] as number | null;
              const diff = firstScore !== null && secondScore !== null ? secondScore - firstScore : null;
              
              return (
                <tr key={key} className="border-b border-violet-100">
                  <td className="py-2 px-2 text-slate-700">{label}</td>
                  <td className="py-2 px-2 text-center font-medium">{firstScore ?? '-'}</td>
                  <td className="py-2 px-2 text-center">
                    {diff !== null ? (
                      <span className={`text-xs font-medium ${
                        diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-red-600' : 'text-slate-400'
                      }`}>
                        {diff > 0 ? `+${diff}` : diff}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-center font-medium">{secondScore ?? '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ComparisonTable({ 
  reports, 
  currentReportId,
  compareMode,
  selectedReports,
  onToggleSelection,
}: { 
  reports: HistoricalReport[]; 
  currentReportId: string;
  compareMode: boolean;
  selectedReports: string[];
  onToggleSelection: (id: string) => void;
}) {
  return (
    <div>
      <h4 className="text-sm font-medium text-slate-700 mb-3">
        {compareMode ? 'Select Two Analyses to Compare' : 'Recent Analyses'}
      </h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              {compareMode && <th className="py-2 px-2 w-8"></th>}
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
              const isSelected = selectedReports.includes(report.id);

              return (
                <tr 
                  key={report.id} 
                  className={`border-b border-slate-100 transition-colors ${
                    isCurrent ? 'bg-indigo-50' : 
                    isSelected ? 'bg-violet-50' : 
                    compareMode ? 'hover:bg-slate-50 cursor-pointer' : ''
                  }`}
                  onClick={compareMode ? () => onToggleSelection(report.id) : undefined}
                >
                  {compareMode && (
                    <td className="py-2 px-2">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isSelected 
                          ? 'bg-violet-600 border-violet-600' 
                          : 'border-slate-300 hover:border-violet-400'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </td>
                  )}
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
                    {!isCurrent && !compareMode && (
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

function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

function getScoreColor(score: number | null): string {
  if (score === null) return 'text-slate-400';
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
}
