'use client';

/**
 * Referral Landing Client Component
 * 
 * Shows the referral offer and CTA to sign up
 */

import { useEffect } from 'react';
import Link from 'next/link';

interface ReferralLandingClientProps {
  referralCode: string;
}

export default function ReferralLandingClient({ referralCode }: ReferralLandingClientProps) {
  // Store referral code in localStorage for signup flow
  useEffect(() => {
    localStorage.setItem('pirouette_referral_code', referralCode);
    // Also set expiry (7 days)
    localStorage.setItem('pirouette_referral_expiry', String(Date.now() + 7 * 24 * 60 * 60 * 1000));
  }, [referralCode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-6">
            <span>🎁</span>
            <span>You&apos;ve been invited!</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Get <span className="text-indigo-600">20% off</span> your first 3 months
          </h1>
          
          <p className="text-xl text-slate-600">
            A friend thinks you&apos;d love Pirouette. Start getting design confidence today.
          </p>
        </div>

        {/* Offer Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm opacity-90">Your special offer</p>
                <p className="text-2xl font-bold">20% off first 3 months</p>
              </div>
              <div className="text-4xl">✨</div>
            </div>
          </div>
          
          <div className="p-6">
            <h2 className="font-semibold text-slate-900 mb-4">What you&apos;ll get with Pirouette:</h2>
            
            <div className="space-y-3 mb-6">
              {[
                { icon: '🎯', text: 'Instant design analysis in under 30 seconds' },
                { icon: '💡', text: 'Actionable recommendations with revenue impact' },
                { icon: '📊', text: 'Track improvements over time' },
                { icon: '🏆', text: 'Compare to 50+ award-winning patterns' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-slate-700">{item.text}</span>
                </div>
              ))}
            </div>

            <Link
              href={`/sign-up?ref=${referralCode}`}
              className="block w-full py-4 bg-indigo-600 text-white rounded-xl font-semibold text-center hover:bg-indigo-700 transition-colors"
            >
              Claim Your 20% Off →
            </Link>
            
            <p className="text-center text-sm text-slate-500 mt-3">
              No credit card required to start
            </p>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="text-center">
          <p className="text-sm text-slate-500 mb-4">Trusted by founders and agencies worldwide</p>
          <div className="flex items-center justify-center gap-8 text-slate-400">
            <div className="flex items-center gap-1">
              <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-medium text-slate-600">4.9/5</span>
            </div>
            <div className="text-sm text-slate-600">
              1,000+ pages analysed
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
            Learn more about Pirouette →
          </Link>
        </div>
      </div>
    </div>
  );
}

