'use client';

/**
 * Analysis Progress Page
 * 
 * Shows real-time progress of the analysis job and redirects to report when complete.
 * Works for both authenticated and anonymous users.
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ============================================================================
// Types
// ============================================================================

interface JobStatus {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  url: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  reportId?: string;
  isAnonymous?: boolean;
}

interface PageProps {
  params: Promise<{ jobId: string }>;
}

// ============================================================================
// Analysis Steps
// ============================================================================

const ANALYSIS_STEPS = [
  { id: 'queued', label: 'Queued', description: 'Waiting in analysis queue...' },
  { id: 'loading', label: 'Loading Page', description: 'Capturing your landing page...' },
  { id: 'screenshot', label: 'Screenshot', description: 'Taking full-page screenshot...' },
  { id: 'analyzing', label: 'Analysing', description: 'Running design analysis...' },
  { id: 'scoring', label: 'Scoring', description: 'Calculating dimension scores...' },
  { id: 'recommendations', label: 'Recommendations', description: 'Generating insights...' },
  { id: 'completed', label: 'Complete', description: 'Analysis complete!' },
];

function getStepIndex(status: string, currentStep: string): number {
  if (status === 'completed') return ANALYSIS_STEPS.length - 1;
  if (status === 'queued') return 0;
  
  const stepLower = currentStep?.toLowerCase() || '';
  
  if (stepLower.includes('load')) return 1;
  if (stepLower.includes('screenshot') || stepLower.includes('capture')) return 2;
  if (stepLower.includes('analy')) return 3;
  if (stepLower.includes('scor')) return 4;
  if (stepLower.includes('recommend') || stepLower.includes('generat')) return 5;
  
  return 1; // Default to loading
}

// ============================================================================
// Component
// ============================================================================

export default function AnalysisProgressPage({ params }: PageProps) {
  const router = useRouter();
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  
  // Resolve params (Next.js 15 async params)
  useEffect(() => {
    params.then(p => setJobId(p.jobId));
  }, [params]);
  
  // Fetch job status
  const fetchStatus = useCallback(async () => {
    if (!jobId) return;
    
    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to fetch job status');
        return;
      }
      
      setJobStatus(data.data);
      setPollCount(prev => prev + 1);
      
      // Redirect to report when complete
      if (data.data.status === 'completed' && data.data.reportId) {
        setTimeout(() => {
          router.push(`/report/${data.data.reportId}`);
        }, 1500);
      }
      
    } catch (err) {
      console.error('Error fetching job status:', err);
      setError('Network error. Please refresh the page.');
    }
  }, [jobId, router]);
  
  // Poll for status updates
  useEffect(() => {
    if (!jobId) return;
    
    // Initial fetch
    fetchStatus();
    
    // Poll every 3 seconds while in progress
    const interval = setInterval(() => {
      if (jobStatus?.status === 'completed' || jobStatus?.status === 'failed') {
        clearInterval(interval);
        return;
      }
      fetchStatus();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [jobId, fetchStatus, jobStatus?.status]);
  
  // Calculate current step
  const currentStepIndex = jobStatus 
    ? getStepIndex(jobStatus.status, jobStatus.currentStep) 
    : 0;
  
  // Estimate time remaining (rough calculation)
  const getEstimatedTime = (): string => {
    if (!jobStatus) return 'Calculating...';
    if (jobStatus.status === 'completed') return 'Done!';
    if (jobStatus.status === 'failed') return 'Failed';
    
    const remainingSteps = ANALYSIS_STEPS.length - 1 - currentStepIndex;
    const secondsPerStep = 5; // Rough estimate
    const remainingSeconds = remainingSteps * secondsPerStep;
    
    if (remainingSeconds < 10) return 'Almost done...';
    if (remainingSeconds < 30) return '~30 seconds';
    return '~1 minute';
  };
  
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 text-slate-600 hover:text-slate-900 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Home</span>
          </Link>
          
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            {jobStatus?.status === 'completed' 
              ? '✨ Analysis Complete!' 
              : jobStatus?.status === 'failed'
                ? '❌ Analysis Failed'
                : 'Analysing Your Page...'
            }
          </h1>
          
          {jobStatus?.url && (
            <p className="text-slate-500 text-sm truncate max-w-md mx-auto">
              {jobStatus.url}
            </p>
          )}
        </div>
        
        {/* Progress Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
          {error ? (
            // Error State
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Something went wrong</h2>
              <p className="text-slate-600 mb-6">{error}</p>
              <Link 
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </Link>
            </div>
          ) : jobStatus?.status === 'failed' ? (
            // Failed State
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Analysis Failed</h2>
              <p className="text-slate-600 mb-6">
                {jobStatus.error || 'We couldn\'t analyse this page. Please check the URL and try again.'}
              </p>
              <Link 
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Try Another URL
              </Link>
            </div>
          ) : (
            // Progress State
            <>
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium text-slate-700">Progress</span>
                  <span className="text-slate-500">{getEstimatedTime()}</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${jobStatus?.progress || 0}%` }}
                  />
                </div>
                <div className="text-right text-sm text-slate-500 mt-1">
                  {jobStatus?.progress || 0}%
                </div>
              </div>
              
              {/* Steps */}
              <div className="space-y-3">
                {ANALYSIS_STEPS.map((step, index) => {
                  const isActive = index === currentStepIndex;
                  const isComplete = index < currentStepIndex;
                  const isPending = index > currentStepIndex;
                  
                  return (
                    <div 
                      key={step.id}
                      className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-indigo-50 border border-indigo-200' 
                          : isComplete 
                            ? 'bg-emerald-50/50' 
                            : 'bg-slate-50'
                      }`}
                    >
                      {/* Step Icon */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isActive 
                          ? 'bg-indigo-500' 
                          : isComplete 
                            ? 'bg-emerald-500' 
                            : 'bg-slate-200'
                      }`}>
                        {isComplete ? (
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : isActive ? (
                          <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                        ) : (
                          <div className="w-3 h-3 bg-slate-400 rounded-full" />
                        )}
                      </div>
                      
                      {/* Step Content */}
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium ${
                          isActive 
                            ? 'text-indigo-700' 
                            : isComplete 
                              ? 'text-emerald-700' 
                              : 'text-slate-400'
                        }`}>
                          {step.label}
                        </div>
                        {(isActive || isComplete) && (
                          <div className={`text-sm ${
                            isActive ? 'text-indigo-600' : 'text-slate-500'
                          }`}>
                            {isActive ? (jobStatus?.currentStep || step.description) : step.description}
                          </div>
                        )}
                      </div>
                      
                      {/* Spinner for active step */}
                      {isActive && (
                        <svg className="w-5 h-5 text-indigo-500 animate-spin" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Completion State */}
              {jobStatus?.status === 'completed' && (
                <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                  <p className="text-emerald-700 font-medium mb-3">
                    🎉 Your analysis is ready!
                  </p>
                  <p className="text-emerald-600 text-sm">
                    Redirecting to your report...
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Anonymous User Prompt */}
        {jobStatus?.isAnonymous && jobStatus.status !== 'failed' && (
          <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-center">
            <p className="text-indigo-800 font-medium mb-2">
              💡 Create a free account to save your results
            </p>
            <p className="text-indigo-600 text-sm mb-4">
              Get weekly analyses, track improvements, and unlock more features.
            </p>
            <Link 
              href="/sign-up"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm"
            >
              Create Free Account →
            </Link>
          </div>
        )}
        
        {/* Debug info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-slate-800 text-slate-300 rounded-lg text-xs font-mono">
            <div>Job ID: {jobId}</div>
            <div>Status: {jobStatus?.status}</div>
            <div>Progress: {jobStatus?.progress}%</div>
            <div>Step: {jobStatus?.currentStep}</div>
            <div>Poll Count: {pollCount}</div>
          </div>
        )}
      </div>
    </main>
  );
}

