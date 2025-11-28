/**
 * Dashboard Page (Protected)
 * 
 * User's main dashboard showing:
 * - Quota display
 * - URL submission form  
 * - Analysis history
 * - Account info
 */

import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/server';
import Link from 'next/link';
import DashboardAnalyzeForm from '@/components/DashboardAnalyzeForm';
import QuotaDisplay from '@/components/QuotaDisplay';
import type { Plan } from '@/lib/features';

// ============================================================================
// Types
// ============================================================================

interface ReportSummary {
  id: string;
  url: string;
  overall_score: number | null;
  created_at: string;
  screenshot_url: string | null;
}

interface UserData {
  id: string;
  plan: Plan;
  analyses_this_month: number;
}

// ============================================================================
// Data Fetching
// ============================================================================

async function getUserData(clerkId: string): Promise<UserData | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, plan, analyses_this_month')
    .eq('clerk_id', clerkId)
    .single();

  if (error || !data) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data as UserData;
}

async function getWeeklyAnalysisCount(userId: string): Promise<number> {
  // Get start of current week (Sunday midnight UTC)
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const startOfWeek = new Date(now);
  startOfWeek.setUTCDate(now.getUTCDate() - dayOfWeek);
  startOfWeek.setUTCHours(0, 0, 0, 0);

  const { count, error } = await supabaseAdmin
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfWeek.toISOString());

  if (error) {
    console.error('Error fetching weekly count:', error);
    return 0;
  }

  return count || 0;
}

async function getRecentReports(userId: string): Promise<ReportSummary[]> {
  const { data, error } = await supabaseAdmin
    .from('reports')
    .select('id, url, overall_score, created_at, screenshot_url')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching reports:', error);
    return [];
  }

  return (data || []) as ReportSummary[];
}

function getNextResetDate(): Date {
  // Next Sunday midnight UTC
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
  const nextSunday = new Date(now);
  nextSunday.setUTCDate(now.getUTCDate() + daysUntilSunday);
  nextSunday.setUTCHours(0, 0, 0, 0);
  return nextSunday;
}

function formatUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname + (parsed.pathname !== '/' ? parsed.pathname : '');
  } catch {
    return url;
  }
}

function getScoreColor(score: number | null): string {
  if (score === null) return 'text-slate-400';
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
}

function getScoreBgColor(score: number | null): string {
  if (score === null) return 'bg-slate-100';
  if (score >= 80) return 'bg-emerald-50';
  if (score >= 60) return 'bg-amber-50';
  return 'bg-red-50';
}

// ============================================================================
// Component
// ============================================================================

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Fetch user data from Supabase
  const userData = await getUserData(user.id);
  
  // Default values if user not found in Supabase (new user)
  const plan = userData?.plan || 'free';
  const userId = userData?.id;
  
  // Fetch analysis count and reports if user exists
  const weeklyAnalysisCount = userId ? await getWeeklyAnalysisCount(userId) : 0;
  const recentReports = userId ? await getRecentReports(userId) : [];
  const resetDate = getNextResetDate();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user.firstName || user.emailAddresses[0].emailAddress.split('@')[0]}!
          </h1>
          <p className="mt-1 text-slate-600">
            Your design analysis dashboard
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Quota Display */}
        <QuotaDisplay
          plan={plan}
          analysesUsed={weeklyAnalysisCount}
          weeklyLimit={plan === 'free' ? 1 : -1}
          resetDate={resetDate}
        />

        {/* Analysis Form */}
        <DashboardAnalyzeForm
          userPlan={plan}
          analysesUsed={weeklyAnalysisCount}
          resetDate={resetDate}
        />

        {/* Recent Analyses */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Recent Analyses</h2>
          </div>

          {recentReports.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-slate-900 mb-1">No analyses yet</h3>
              <p className="text-sm text-slate-500">
                Enter a URL above to analyse your first landing page
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentReports.map((report) => (
                <li key={report.id}>
                  <Link
                    href={`/report/${report.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
                  >
                    {/* Screenshot thumbnail */}
                    <div className="flex-shrink-0 w-16 h-12 rounded bg-slate-100 overflow-hidden">
                      {report.screenshot_url ? (
                        <img
                          src={report.screenshot_url}
                          alt=""
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* URL and date */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {formatUrl(report.url)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(report.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    {/* Score */}
                    <div className={`flex-shrink-0 px-3 py-1.5 rounded-lg ${getScoreBgColor(report.overall_score)}`}>
                      <span className={`text-lg font-bold ${getScoreColor(report.overall_score)}`}>
                        {report.overall_score !== null ? report.overall_score : '—'}
                      </span>
                      <span className="text-xs text-slate-500 ml-0.5">/100</span>
                    </div>

                    {/* Arrow */}
                    <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {recentReports.length > 0 && (
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 rounded-b-xl">
              <p className="text-xs text-slate-500 text-center">
                Showing {recentReports.length} most recent {recentReports.length === 1 ? 'analysis' : 'analyses'}
              </p>
            </div>
          )}
        </div>

        {/* Account Info (Collapsed) */}
        <details className="bg-white rounded-xl shadow-sm border border-slate-200">
          <summary className="px-6 py-4 cursor-pointer hover:bg-slate-50 rounded-xl transition-colors">
            <span className="text-lg font-semibold text-slate-900">Account Information</span>
          </summary>
          <div className="px-6 pb-6">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-4 border-t border-slate-100">
              <div>
                <dt className="text-sm font-medium text-slate-500">Email</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {user.emailAddresses[0].emailAddress}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Plan</dt>
                <dd className="mt-1 text-sm text-slate-900 flex items-center gap-2">
                  {plan === 'free' ? (
                    <>
                      Free
                      <Link
                        href="/pricing"
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        Upgrade →
                      </Link>
                    </>
                  ) : (
                    <>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                        {plan === 'pro_29' && 'Pro'}
                        {plan === 'pro_49' && 'Pro Plus'}
                        {plan === 'agency' && 'Agency'}
                      </span>
                      <Link
                        href="/dashboard/billing"
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        Manage →
                      </Link>
                    </>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Member Since</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {new Date(user.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Total Analyses</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {userData?.analyses_this_month || 0}
                </dd>
              </div>
            </dl>
          </div>
        </details>
      </div>
    </div>
  );
}
