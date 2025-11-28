'use client';

/**
 * Product Hunt Client Component
 * 
 * Interactive elements for the PH landing page:
 * - URL input for quick demo
 * - Tracks PH referral in localStorage
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductHuntClient() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Store referral source in localStorage for later attribution
  useEffect(() => {
    localStorage.setItem('referral_source', 'producthunt');
    localStorage.setItem('referral_offer', 'ph20');
    localStorage.setItem('referral_timestamp', new Date().toISOString());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    
    // Redirect to sign-up with the URL prefilled
    const encodedUrl = encodeURIComponent(url);
    router.push(`/sign-up?ref=producthunt&offer=ph20&analyze=${encodedUrl}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Try It Now
        </h2>
        <p className="text-slate-600">
          Enter your landing page URL to see what we can do
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
        <div className="flex gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-landing-page.com"
            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#da552f] focus:border-transparent"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading...
              </>
            ) : (
              'Analyse'
            )}
          </button>
        </div>
      </form>

      <div className="flex items-center justify-center gap-6 mt-6 text-sm text-slate-500">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          No sign-up required
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Results in 30 seconds
        </span>
      </div>
    </div>
  );
}

