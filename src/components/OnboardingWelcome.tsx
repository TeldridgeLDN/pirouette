'use client';

/**
 * Onboarding Welcome Modal
 * 
 * Shown to first-time users after signup.
 * Introduces the product and key features.
 */

import { useState } from 'react';

interface OnboardingWelcomeProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

const FEATURES = [
  {
    icon: '🎯',
    title: 'Instant Analysis',
    description: 'Get design scores in under 30 seconds',
  },
  {
    icon: '💡',
    title: 'Actionable Recommendations',
    description: 'Prioritised fixes with revenue impact',
  },
  {
    icon: '📊',
    title: 'Track Progress',
    description: 'See how your design improves over time',
  },
];

export default function OnboardingWelcome({ isOpen, onClose, userName }: OnboardingWelcomeProps) {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
          {/* Progress dots */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
            {[0, 1].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === step ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          {step === 0 && (
            <div className="p-8 pt-12">
              {/* Welcome Step */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30">
                  <span className="text-4xl">✨</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Welcome{userName ? `, ${userName}` : ''}!
                </h2>
                <p className="text-slate-600">
                  You&apos;re about to get design confidence backed by data.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {FEATURES.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl"
                  >
                    <span className="text-2xl">{feature.icon}</span>
                    <div>
                      <h3 className="font-semibold text-slate-900">{feature.title}</h3>
                      <p className="text-sm text-slate-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleNext}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
              >
                Let&apos;s get started →
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="p-8 pt-12">
              {/* How it works */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  How It Works
                </h2>
                <p className="text-slate-600">
                  Three simple steps to better design
                </p>
              </div>

              <div className="space-y-6 mb-8">
                {[
                  {
                    step: '1',
                    title: 'Enter your URL',
                    description: 'Paste your landing page URL in the dashboard',
                  },
                  {
                    step: '2',
                    title: 'Wait 30 seconds',
                    description: 'We analyse your page against 50+ design patterns',
                  },
                  {
                    step: '3',
                    title: 'Get recommendations',
                    description: 'See prioritised fixes with estimated impact',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{item.title}</h3>
                      <p className="text-sm text-slate-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tip */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-emerald-600">💡</span>
                  <div>
                    <p className="text-sm font-medium text-emerald-900">Pro Tip</p>
                    <p className="text-sm text-emerald-700">
                      Start with your homepage – it&apos;s usually the most impactful page to optimise.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
              >
                Analyse my first page →
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 text-slate-500 text-sm mt-2 hover:text-slate-700"
              >
                I&apos;ll explore on my own
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

