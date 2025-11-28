'use client';

/**
 * Trial Welcome Modal
 * 
 * Shown after successful checkout when a trial starts.
 * Welcomes user, shows unlocked Pro features, and tips for success.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TrialWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trialDays?: number;
}

const PRO_FEATURES = [
  { icon: '⚡', name: 'Unlimited Analyses', description: 'Analyse as many pages as you need' },
  { icon: '📈', name: 'Historical Tracking', description: 'Track improvement over time' },
  { icon: '🆚', name: 'Competitor Comparison', description: 'Compare against competitors' },
  { icon: '📄', name: 'Export as PDF', description: 'Download professional reports' },
  { icon: '💰', name: 'Revenue Estimates', description: 'See potential revenue impact' },
  { icon: '💬', name: 'Priority Support', description: 'Get faster responses' },
];

export default function TrialWelcomeModal({ isOpen, onClose, trialDays = 7 }: TrialWelcomeModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay for animation
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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

          {/* Confetti/celebration header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-2xl px-6 py-8 text-center">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-2xl font-bold text-white">Your Pro Trial Has Started!</h2>
            <p className="text-indigo-100 mt-2">
              Enjoy {trialDays} days of unlimited access to all Pro features
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <h3 className="font-semibold text-slate-900 mb-4">You now have access to:</h3>
            
            <div className="grid grid-cols-2 gap-3">
              {PRO_FEATURES.map((feature) => (
                <div key={feature.name} className="flex items-start gap-2 p-2">
                  <span className="text-lg flex-shrink-0">{feature.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{feature.name}</p>
                    <p className="text-xs text-slate-500">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className="mt-6 bg-indigo-50 rounded-xl p-4">
              <h4 className="font-medium text-indigo-900 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Make the most of your trial
              </h4>
              <ul className="text-sm text-indigo-700 space-y-1">
                <li>• Analyse your main landing page first</li>
                <li>• Try the competitor comparison feature</li>
                <li>• Export a PDF report for your team</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex gap-3">
            <Link
              href="/dashboard"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium text-center hover:bg-indigo-700 transition-colors"
            >
              Start Analysing →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

