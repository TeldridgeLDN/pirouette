/**
 * Dashboard Layout
 * 
 * Wraps all dashboard pages with:
 * - Trial handler for modals and prompts
 * - Navigation (if needed)
 */

import { Suspense } from 'react';
import DashboardTrialHandler from '@/components/DashboardTrialHandler';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardLoadingFallback />}>
      <DashboardTrialHandler>
        {children}
      </DashboardTrialHandler>
    </Suspense>
  );
}

function DashboardLoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-3 text-sm text-slate-500">Loading dashboard...</p>
      </div>
    </div>
  );
}

