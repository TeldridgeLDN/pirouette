'use client';

/**
 * Global Error Boundary
 * 
 * Catches errors at the root layout level (including errors in layout.tsx itself).
 * This is the last line of defense for unhandled errors.
 * 
 * Note: This component must render its own <html> and <body> tags
 * as it replaces the entire document when triggered.
 */

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log critical error
    console.error('Critical application error:', error);
    
    // In production, send to error tracking immediately
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send critical error to monitoring service
      // This is a critical error that broke the entire app
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          {/* Error Content */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8">
            <h1 className="text-2xl font-bold text-white mb-3">
              Critical Error
            </h1>
            
            <p className="text-slate-300 mb-6">
              We&apos;re sorry, but something went seriously wrong. 
              Our team has been notified and is working to fix this.
            </p>
            
            {/* Error Reference */}
            {error.digest && (
              <div className="mb-6 p-3 bg-slate-700/50 rounded-lg">
                <p className="text-xs text-slate-400">
                  Error Reference: <code className="text-slate-300">{error.digest}</code>
                </p>
              </div>
            )}
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => reset()}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
              
              <a 
                href="/"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 text-slate-200 rounded-lg font-medium hover:bg-slate-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Return Home
              </a>
            </div>
          </div>
          
          {/* Help Text */}
          <div className="mt-6 space-y-2">
            <p className="text-sm text-slate-400">
              If this continues, please email{' '}
              <a 
                href="mailto:support@pirouette.design" 
                className="text-indigo-400 hover:text-indigo-300"
              >
                support@pirouette.design
              </a>
            </p>
            <p className="text-xs text-slate-500">
              Include the error reference above to help us investigate.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}

