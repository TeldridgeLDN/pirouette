'use client';

/**
 * Dashboard URL Submission Form Component
 * 
 * Used in the user dashboard for authenticated users.
 * Shows upgrade modal when rate limit is hit (for free users).
 * 
 * Features:
 * - Shows current usage/quota
 * - Upgrade modal on rate limit
 * - Pro users see unlimited access
 */

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import UpgradeModal from './UpgradeModal';
import { trackAnalysisSubmitted, trackUpgradeClicked } from '@/lib/analytics';

// ============================================================================
// Types
// ============================================================================

interface DashboardAnalyzeFormProps {
  userPlan: 'free' | 'pro_29' | 'pro_49' | 'agency';
  analysesUsed: number;
  resetDate?: Date;
}

interface FormErrors {
  url?: string;
  general?: string;
}

interface ApiResponse {
  success: boolean;
  jobId?: string;
  error?: string;
  resetAt?: string;
  isAuthenticated?: boolean;
}

// ============================================================================
// URL Validation
// ============================================================================

function validateUrl(url: string): { valid: boolean; error?: string; normalized?: string } {
  if (!url || url.trim() === '') {
    return { valid: false, error: 'Please enter a URL' };
  }
  
  let urlToValidate = url.trim();
  if (!urlToValidate.startsWith('http://') && !urlToValidate.startsWith('https://')) {
    urlToValidate = `https://${urlToValidate}`;
  }
  
  try {
    const parsed = new URL(urlToValidate);
    
    if (!parsed.hostname || parsed.hostname.length < 3) {
      return { valid: false, error: 'Please enter a valid website URL' };
    }
    
    if (!parsed.hostname.includes('.')) {
      return { valid: false, error: 'Please include a domain extension (e.g., .com)' };
    }
    
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname.startsWith('127.') || hostname.startsWith('192.168.')) {
      return { valid: false, error: 'Please enter a public website URL' };
    }
    
    return { valid: true, normalized: urlToValidate };
  } catch {
    return { valid: false, error: 'Please enter a valid URL' };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function DashboardAnalyzeForm({
  userPlan,
  analysesUsed,
  resetDate,
}: DashboardAnalyzeFormProps) {
  const router = useRouter();
  
  const [url, setUrl] = useState('');
  const [weeklyTraffic, setWeeklyTraffic] = useState('');
  const [showTrafficField, setShowTrafficField] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const isProUser = userPlan !== 'free';
  const weeklyLimit = isProUser ? -1 : 1;
  const remaining = isProUser ? -1 : Math.max(0, weeklyLimit - analysesUsed);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate URL
    const validation = validateUrl(url);
    if (!validation.valid) {
      setErrors({ url: validation.error });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Parse traffic if provided
      const traffic = weeklyTraffic ? parseInt(weeklyTraffic, 10) : undefined;
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: validation.normalized,
          weeklyTraffic: traffic && !isNaN(traffic) && traffic > 0 ? traffic : undefined,
        }),
      });
      
      const data: ApiResponse = await response.json();
      
      if (!response.ok) {
        // Handle rate limiting - show upgrade modal
        if (response.status === 429) {
          trackUpgradeClicked('dashboard', 'pro', 'limit_reached');
          setShowUpgradeModal(true);
          return;
        }
        
        setErrors({ general: data.error || 'Failed to start analysis' });
        return;
      }
      
      // Success! Track and redirect to progress page
      if (data.jobId) {
        trackAnalysisSubmitted('dashboard');
        router.push(`/analyze/${data.jobId}`);
      }
      
    } catch (err) {
      console.error('Analysis request error:', err);
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">New Analysis</h2>
          
          {/* Usage indicator */}
          {!isProUser ? (
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${remaining > 0 ? 'text-slate-600' : 'text-red-600'}`}>
                {remaining > 0 ? `${remaining} of ${weeklyLimit} remaining` : 'Limit reached'}
              </span>
              {remaining === 0 && (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Upgrade
                </button>
              )}
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Unlimited
            </span>
          )}
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (errors.url) setErrors({});
              }}
              placeholder="Enter a landing page URL to analyse..."
              disabled={isLoading}
              className={`
                flex-1 px-4 py-3 rounded-lg text-slate-900 placeholder-slate-400
                border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                disabled:bg-slate-100 disabled:cursor-not-allowed
                ${errors.url || errors.general ? 'border-red-300' : 'border-slate-200'}
              `}
            />
            
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className={`
                px-6 py-3 rounded-lg font-semibold text-white
                transition-all whitespace-nowrap
                ${isLoading || !url.trim()
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
                }
              `}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analysing...
                </span>
              ) : (
                'Analyse'
              )}
            </button>
          </div>
          
          {/* Optional traffic input */}
          <div className="mt-3">
            {!showTrafficField ? (
              <button
                type="button"
                onClick={() => setShowTrafficField(true)}
                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add traffic data for personalised recommendations
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Weekly visitors (optional)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={weeklyTraffic}
                      onChange={(e) => setWeeklyTraffic(e.target.value)}
                      placeholder="e.g., 1000"
                      min="0"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                      /week
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowTrafficField(false);
                    setWeeklyTraffic('');
                  }}
                  className="mt-5 text-slate-400 hover:text-slate-600"
                  title="Remove traffic field"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          {/* Errors */}
          {errors.url && (
            <p className="mt-2 text-sm text-red-600">{errors.url}</p>
          )}
          {errors.general && (
            <p className="mt-2 text-sm text-red-600">{errors.general}</p>
          )}
        </form>
        
        {/* Reset date info */}
        {!isProUser && resetDate && remaining === 0 && (
          <p className="mt-3 text-sm text-slate-500">
            Your quota resets on {resetDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}.
          </p>
        )}
      </div>
      
      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger="rate_limit"
        currentUsage={{
          used: analysesUsed,
          limit: weeklyLimit,
          resetDate,
        }}
      />
    </>
  );
}

