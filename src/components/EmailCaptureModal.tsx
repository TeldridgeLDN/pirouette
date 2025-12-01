'use client';

/**
 * Email Capture Modal
 * 
 * Shows after an anonymous user views their report, encouraging them
 * to create an account to save their results.
 * 
 * Features:
 * - Value proposition messaging
 * - Sign up with email or social OAuth
 * - Preserves report association after signup
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { trackSignupStarted, trackReportSaved } from '@/lib/analytics';

// ============================================================================
// Types
// ============================================================================

interface EmailCaptureModalProps {
  reportId: string;
  jobId?: string;
  isOpen: boolean;
  onClose: () => void;
  autoShow?: boolean;
  autoShowDelay?: number; // milliseconds
}

// ============================================================================
// Component
// ============================================================================

export default function EmailCaptureModal({
  reportId,
  jobId,
  isOpen,
  onClose,
  autoShow = false,
  autoShowDelay = 30000, // 30 seconds
}: EmailCaptureModalProps) {
  const [showModal, setShowModal] = useState(isOpen);
  const [dismissed, setDismissed] = useState(false);
  
  // Auto-show after delay
  useEffect(() => {
    if (autoShow && !dismissed) {
      const timer = setTimeout(() => {
        setShowModal(true);
      }, autoShowDelay);
      
      return () => clearTimeout(timer);
    }
  }, [autoShow, autoShowDelay, dismissed]);
  
  // Sync with isOpen prop
  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
    }
  }, [isOpen]);
  
  // Store report info in sessionStorage for post-signup association
  useEffect(() => {
    if (showModal && reportId) {
      sessionStorage.setItem('pendingReportAssociation', JSON.stringify({
        reportId,
        jobId,
        timestamp: Date.now(),
      }));
    }
  }, [showModal, reportId, jobId]);
  
  const handleClose = () => {
    setShowModal(false);
    setDismissed(true);
    onClose();
  };
  
  // Build sign-up URL with return path
  const signUpUrl = `/sign-up?redirect_url=${encodeURIComponent(`/report/${reportId}?claimed=true`)}`;
  const signInUrl = `/sign-in?redirect_url=${encodeURIComponent(`/report/${reportId}?claimed=true`)}`;
  
  if (!showModal) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Header */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 pb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Save This Report
            </h2>
            <p className="text-indigo-100">
              Create a free account to keep your analysis and unlock more features.
            </p>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {/* Value Props */}
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-slate-900">Your report saved permanently</div>
                  <div className="text-sm text-slate-500">Access it anytime from your dashboard</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-slate-900">Get 3 analyses per week</div>
                  <div className="text-sm text-slate-500">3x more than anonymous daily limit</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-slate-900">Track improvement over time</div>
                  <div className="text-sm text-slate-500">Compare scores as you make changes</div>
                </div>
              </li>
            </ul>
            
            {/* CTA Buttons */}
            <div className="space-y-3">
              <Link
                href={signUpUrl}
                onClick={() => {
                  trackSignupStarted('email_capture_modal', 'free');
                  trackReportSaved('signup');
                }}
                className="flex items-center justify-center w-full px-6 py-3 rounded-xl text-white font-semibold transition-all hover:-translate-y-0.5"
                style={{ 
                  background: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)', 
                  boxShadow: '0 4px 14px 0 rgba(249, 115, 22, 0.39)' 
                }}
              >
                Create Free Account
              </Link>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">or</span>
                </div>
              </div>
              
              <Link
                href={signInUrl}
                onClick={() => trackReportSaved('email')}
                className="flex items-center justify-center w-full px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
              >
                Sign in to existing account
              </Link>
            </div>
            
            {/* Skip link */}
            <button
              onClick={handleClose}
              className="w-full mt-4 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Maybe later
            </button>
          </div>
          
          {/* Trust footer */}
          <div className="px-6 pb-6">
            <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
              <span>🔒 Secure</span>
              <span>•</span>
              <span>No credit card required</span>
              <span>•</span>
              <span>Free forever</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

