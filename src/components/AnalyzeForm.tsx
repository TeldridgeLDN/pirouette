'use client';

/**
 * URL Submission Form Component
 * 
 * Allows users to submit URLs for design analysis.
 * Includes optional traffic input for revenue calculations.
 */

import { useState, FormEvent } from 'react';
import { useUser } from '@clerk/nextjs';

// ============================================================================
// Types
// ============================================================================

interface AnalyzeFormProps {
  onSubmit?: (data: SubmissionData) => void;
  onSuccess?: (jobId: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

interface SubmissionData {
  url: string;
  weeklyTraffic?: number;
}

interface FormErrors {
  url?: string;
  weeklyTraffic?: string;
  general?: string;
}

// ============================================================================
// URL Validation
// ============================================================================

function validateUrl(url: string): { valid: boolean; error?: string } {
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
      return { valid: false, error: 'Please enter a complete URL with domain extension (e.g., .com, .co.uk)' };
    }
    
    return { valid: true };
  } catch {
    return { valid: false, error: 'Please enter a valid URL' };
  }
}

function normalizeUrl(url: string): string {
  let normalized = url.trim();
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = `https://${normalized}`;
  }
  return normalized;
}

// ============================================================================
// Component
// ============================================================================

export default function AnalyzeForm({
  onSubmit,
  onSuccess,
  onError,
  className = '',
}: AnalyzeFormProps) {
  const { isSignedIn, user } = useUser();
  
  // Form state
  const [url, setUrl] = useState('');
  const [weeklyTraffic, setWeeklyTraffic] = useState('');
  const [showTrafficInput, setShowTrafficInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');
    
    // Validate URL
    const urlValidation = validateUrl(url);
    if (!urlValidation.valid) {
      setErrors({ url: urlValidation.error });
      return;
    }
    
    // Validate traffic (if provided)
    let trafficValue: number | undefined;
    if (weeklyTraffic.trim() !== '') {
      const parsed = parseInt(weeklyTraffic, 10);
      if (isNaN(parsed) || parsed < 0) {
        setErrors({ weeklyTraffic: 'Please enter a valid positive number' });
        return;
      }
      trafficValue = parsed;
    }
    
    // Prepare submission data
    const submissionData: SubmissionData = {
      url: normalizeUrl(url),
      weeklyTraffic: trafficValue,
    };
    
    // Call optional onSubmit callback
    if (onSubmit) {
      onSubmit(submissionData);
    }
    
    // Submit to API
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const errorMessage = data.error || 'Failed to submit analysis request';
        setErrors({ general: errorMessage });
        if (onError) {
          onError(errorMessage);
        }
        return;
      }
      
      // Success!
      setSuccessMessage('Analysis started! Redirecting to results...');
      setUrl('');
      setWeeklyTraffic('');
      
      if (onSuccess && data.jobId) {
        onSuccess(data.jobId);
      }
      
    } catch (err) {
      const errorMessage = 'Network error. Please try again.';
      setErrors({ general: errorMessage });
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className={`w-full max-w-xl ${className}`}>
      {/* URL Input */}
      <div className="mb-4">
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
          Website URL
        </label>
        <div className="relative">
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="example.com or https://example.com"
            disabled={isLoading}
            className={`
              w-full px-4 py-3 rounded-lg border text-gray-900 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${errors.url ? 'border-red-500' : 'border-gray-300'}
            `}
          />
        </div>
        {errors.url && (
          <p className="mt-1 text-sm text-red-600">{errors.url}</p>
        )}
      </div>
      
      {/* Traffic Input Toggle */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setShowTrafficInput(!showTrafficInput)}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <span>{showTrafficInput ? '−' : '+'}</span>
          <span>Add traffic data for revenue estimates</span>
        </button>
      </div>
      
      {/* Traffic Input (Optional) */}
      {showTrafficInput && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <label htmlFor="weeklyTraffic" className="block text-sm font-medium text-gray-700 mb-1">
            Weekly Visitors (Optional)
          </label>
          <input
            type="text"
            id="weeklyTraffic"
            value={weeklyTraffic}
            onChange={(e) => setWeeklyTraffic(e.target.value)}
            placeholder="e.g., 1000"
            disabled={isLoading}
            className={`
              w-full px-4 py-2 rounded-lg border text-gray-900 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${errors.weeklyTraffic ? 'border-red-500' : 'border-gray-300'}
            `}
          />
          {errors.weeklyTraffic && (
            <p className="mt-1 text-sm text-red-600">{errors.weeklyTraffic}</p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            💡 Adding your weekly traffic helps us calculate potential revenue impact from design improvements.
          </p>
        </div>
      )}
      
      {/* General Error */}
      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}
      
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">{successMessage}</p>
        </div>
      )}
      
      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !isSignedIn}
        className={`
          w-full py-3 px-6 rounded-lg font-semibold text-white
          transition-all duration-200
          ${isLoading || !isSignedIn
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
          }
        `}
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
            Analysing...
          </span>
        ) : !isSignedIn ? (
          'Sign in to analyse'
        ) : (
          'Analyse My Site'
        )}
      </button>
      
      {/* Sign in prompt */}
      {!isSignedIn && (
        <p className="mt-2 text-sm text-gray-500 text-center">
          Please sign in to submit your site for analysis.
        </p>
      )}
      
      {/* Free tier note */}
      {isSignedIn && (
        <p className="mt-2 text-xs text-gray-500 text-center">
          Free accounts: 1 analysis per week • Pro accounts: Unlimited
        </p>
      )}
    </form>
  );
}


