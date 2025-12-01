'use client';

/**
 * Trial Expired Modal
 * 
 * Shown when a user's trial has ended and they haven't subscribed.
 * Shows what they'll lose access to and prompts to upgrade.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TrialExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
}

const FEATURES_LOSING = [
  { icon: '⚡', name: 'Unlimited Analyses', current: 'Unlimited', after: '3 per week' },
  { icon: '📈', name: 'Historical Tracking', current: '✓', after: '✗' },
  { icon: '🆚', name: 'Competitor Comparison', current: '✓', after: '✗' },
  { icon: '📄', name: 'Export as PDF', current: '✓', after: '✗' },
  { icon: '💰', name: 'Revenue Estimates', current: '✓', after: '✗' },
  { icon: '💬', name: 'Priority Support', current: '✓', after: '✗' },
];

export default function TrialExpiredModal({ isOpen, onClose, onUpgrade }: TrialExpiredModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${isVisible ? 'bg-opacity-50' : 'bg-opacity-0'}`}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`relative bg-white rounded-2xl shadow-xl max-w-lg w-full transform transition-all duration-300 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="px-6 pt-8 pb-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Your Trial Has Ended</h2>
            <p className="text-slate-600 mt-2">
              Don&apos;t worry — your data is safe. Upgrade to continue using Pro features.
            </p>
          </div>

          {/* Features comparison */}
          <div className="px-6 pb-6">
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="grid grid-cols-3 gap-2 mb-3 text-xs font-medium text-slate-500">
                <div>Feature</div>
                <div className="text-center">During Trial</div>
                <div className="text-center">Now (Free)</div>
              </div>
              <div className="space-y-2">
                {FEATURES_LOSING.map((feature) => (
                  <div key={feature.name} className="grid grid-cols-3 gap-2 items-center py-1.5 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{feature.icon}</span>
                      <span className="text-sm text-slate-700">{feature.name}</span>
                    </div>
                    <div className="text-center text-sm text-emerald-600 font-medium">{feature.current}</div>
                    <div className="text-center text-sm text-slate-400">{feature.after}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Retention offer */}
            <div className="mt-6 bg-indigo-50 rounded-xl p-4 text-center">
              <p className="text-indigo-900 font-medium">Continue with Pro for just £29/month</p>
              <p className="text-sm text-indigo-700 mt-1">Cancel anytime, no commitment required</p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/pricing"
              onClick={handleUpgrade}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium text-center hover:bg-indigo-700 transition-colors"
            >
              Upgrade to Pro →
            </Link>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium text-center hover:bg-slate-200 transition-colors"
            >
              Stay on Free
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

