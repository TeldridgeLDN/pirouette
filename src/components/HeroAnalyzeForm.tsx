'use client';

/**
 * Hero URL Submission Form Component
 * 
 * A prominent URL input form designed for the landing page hero section.
 * Allows both anonymous and authenticated users to submit URLs for analysis.
 * 
 * Features:
 * - Works without authentication (anonymous users get 1/day limit)
 * - Inline form design matching the hero aesthetic
 * - Redirects to progress page on successful submission
 */

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trackAnalysisSubmitted, trackSignupStarted } from '@/lib/analytics';

// ============================================================================
// Types
// ============================================================================

interface HeroAnalyzeFormProps {
  className?: string;
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
  suggestSignup?: boolean;
  isAnonymous?: boolean;
}

// ============================================================================
// URL Validation
// ============================================================================

function validateUrl(url: string): { valid: boolean; error?: string; normalized?: string } {
  if (!url || url.trim() === '') {
    return { valid: false, error: 'Please enter a URL' };
  }
  
  // Add protocol if missing
  let urlToValidate = url.trim();
  if (!urlToValidate.startsWith('http://') && !urlToValidate.startsWith('https://')) {
    urlToValidate = `https://${urlToValidate}`;
  }
  
  try {
    const parsed = new URL(urlToValidate);
    
    // Check for valid hostname
    if (!parsed.hostname || parsed.hostname.length < 3) {
      return { valid: false, error: 'Please enter a valid website URL' };
    }
    
    // Must have a TLD
    if (!parsed.hostname.includes('.')) {
      return { valid: false, error: 'Please include a domain extension (e.g., .com)' };
    }
    
    // Block localhost
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

export default function HeroAnalyzeForm({ className = '' }: HeroAnalyzeFormProps) {
  const router = useRouter();
  
  // Form state
  const [url, setUrl] = useState('');
  const [weeklyTraffic, setWeeklyTraffic] = useState('');
  const [showTrafficField, setShowTrafficField] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [rateLimitInfo, setRateLimitInfo] = useState<{ message: string; resetAt?: string } | null>(null);
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setRateLimitInfo(null);
    
    // Validate URL
    const validation = validateUrl(url);
    if (!validation.valid) {
      setErrors({ url: validation.error });
      return;
    }
    
    // Submit to API
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
        // Handle rate limiting
        if (response.status === 429) {
          setRateLimitInfo({
            message: data.error || 'Rate limit exceeded',
            resetAt: data.resetAt,
          });
          return;
        }
        
        setErrors({ general: data.error || 'Failed to start analysis' });
        return;
      }
      
      // Success! Track and redirect to progress page
      if (data.jobId) {
        trackAnalysisSubmitted('hero');
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
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        {/* Input Group */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* URL Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (errors.url) setErrors({});
                if (rateLimitInfo) setRateLimitInfo(null);
              }}
              placeholder="Enter your landing page URL..."
              disabled={isLoading}
              className={`
                w-full px-5 py-4 rounded-xl text-slate-900 placeholder-slate-400
                bg-white border-2 text-lg
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                disabled:bg-slate-100 disabled:cursor-not-allowed
                transition-all duration-200
                ${errors.url || errors.general 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-slate-200 hover:border-slate-300'
                }
              `}
              aria-label="Landing page URL"
            />
            
            {/* URL Protocol Hint */}
            {url && !url.includes('.') && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                .com
              </div>
            )}
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className={`
              px-8 py-4 rounded-xl font-semibold text-lg text-white
              transition-all duration-200
              whitespace-nowrap
              ${isLoading || !url.trim()
                ? 'bg-slate-300 cursor-not-allowed'
                : 'hover:-translate-y-1 hover:shadow-lg active:translate-y-0'
              }
            `}
            style={
              !isLoading && url.trim()
                ? { 
                    background: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)', 
                    boxShadow: '0 4px 14px 0 rgba(249, 115, 22, 0.39)' 
                  }
                : {}
            }
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                <span>Analysing...</span>
              </span>
            ) : (
              'Analyse Free →'
            )}
          </button>
        </div>
        
        {/* Error Messages */}
        {errors.url && (
          <p className="mt-2 text-sm text-red-600 text-center sm:text-left">
            {errors.url}
          </p>
        )}
        
        {errors.general && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 text-center">{errors.general}</p>
          </div>
        )}
        
        {/* Rate Limit Message */}
        {rateLimitInfo && (
          <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800 text-center mb-2">
              {rateLimitInfo.message}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link 
                href="/sign-up"
                onClick={() => trackSignupStarted('rate_limit_hero', 'free')}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 underline"
              >
                Create a free account for 3 analyses per week →
              </Link>
              <span className="hidden sm:inline text-slate-300">|</span>
              <a 
                href="#pricing"
                className="text-sm font-medium text-slate-600 hover:text-slate-700"
              >
                Go Pro for unlimited
              </a>
            </div>
          </div>
        )}
      </form>
      
      {/* Optional Traffic Input Toggle */}
      <div className="mt-4">
        {!showTrafficField ? (
          <button
            type="button"
            onClick={() => setShowTrafficField(true)}
            className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1 mx-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add traffic data for personalised recommendations
          </button>
        ) : (
          <div className="max-w-md mx-auto">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Weekly visitors (optional)
            </label>
            <div className="relative">
              <input
                type="number"
                value={weeklyTraffic}
                onChange={(e) => setWeeklyTraffic(e.target.value)}
                placeholder="e.g., 1000"
                min="0"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                /week
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              📊 Helps us give you realistic validation timelines and testing strategies
            </p>
          </div>
        )}
      </div>
      
      {/* Helper Text */}
      <p className="mt-4 text-sm text-slate-500 text-center">
        No account needed • Get results in ~30 seconds • 1 free analysis per day
      </p>
    </div>
  );
}

