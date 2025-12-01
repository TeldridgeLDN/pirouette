/**
 * Product Hunt Welcome Page
 * 
 * Special landing page for Product Hunt visitors with:
 * - Welcome message acknowledging they came from PH
 * - Special offer (20% off first 3 months)
 * - Quick demo of the product
 * - Clear CTA to sign up
 */

import { Metadata } from 'next';
import Link from 'next/link';
import ProductHuntClient from './ProductHuntClient';

export const metadata: Metadata = {
  title: 'Welcome, Product Hunt! | Pirouette',
  description: 'Special offer for Product Hunt visitors - Get 20% off your first 3 months of Pirouette Pro.',
};

export default function ProductHuntWelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#da552f]/5 via-white to-slate-50">
      {/* Product Hunt Badge */}
      <div className="bg-[#da552f] text-white py-2 text-center text-sm font-medium">
        🎉 Welcome from Product Hunt! You&apos;ve unlocked a special offer.
      </div>

      {/* Hero Section */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Product Hunt Cat */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#da552f]/10 rounded-full text-[#da552f] font-medium text-sm mb-8">
            <svg className="w-5 h-5" viewBox="0 0 40 40" fill="currentColor">
              <path d="M20 0C8.954 0 0 8.954 0 20s8.954 20 20 20 20-8.954 20-20S31.046 0 20 0zm0 37.5C10.335 37.5 2.5 29.665 2.5 20S10.335 2.5 20 2.5 37.5 10.335 37.5 20 29.665 37.5 20 37.5zm-2.5-25h-5v15h5v-5h2.5c4.142 0 7.5-3.358 7.5-7.5S24.142 12.5 20 12.5h-2.5zm2.5 7.5h-2.5v-5h2.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5z"/>
            </svg>
            Featured on Product Hunt
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
            Design Confidence,<br />
            <span className="text-[#da552f]">Backed by Data</span>
          </h1>

          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Stop guessing if your landing page design works. Get instant, AI-powered feedback 
            based on patterns from 50+ award-winning sites.
          </p>

          {/* Special Offer Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-[#da552f]/20 p-8 mb-12 max-w-md mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
              ✨ Product Hunt Exclusive
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              20% Off First 3 Months
            </h2>
            <p className="text-slate-600 mb-6">
              As a Product Hunt visitor, enjoy 20% off your first 3 months of Pirouette Pro.
            </p>
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-3xl font-bold text-slate-900">£23.20</span>
              <span className="text-slate-500 line-through">£29</span>
              <span className="text-sm text-slate-500">/month</span>
            </div>
            <Link
              href="/sign-up?ref=producthunt&offer=ph20"
              className="block w-full py-3 px-6 bg-[#da552f] text-white rounded-lg font-semibold hover:bg-[#c54a2a] transition-colors"
            >
              Claim Your Discount →
            </Link>
            <p className="text-xs text-slate-500 mt-3">
              No credit card required. 7-day free trial included.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔗</span>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">1. Enter Your URL</h3>
            <p className="text-slate-600 text-sm">
              Paste your landing page URL and we&apos;ll analyse it in seconds.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎨</span>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">2. Get Design Scores</h3>
            <p className="text-slate-600 text-sm">
              See scores across 7 key dimensions: typography, colour, whitespace, and more.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💡</span>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">3. Act on Insights</h3>
            <p className="text-slate-600 text-sm">
              Get prioritised recommendations with estimated revenue impact.
            </p>
          </div>
        </div>

        {/* Benchmark Proof */}
        <div className="text-center mb-16">
          <p className="text-slate-500 text-sm mb-4">Benchmarked against 36 award-winning sites</p>
          <div className="flex items-center justify-center flex-wrap gap-4">
            <span className="text-slate-600 font-semibold">Stripe</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-semibold">Linear</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-semibold">Vercel</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-semibold">Notion</span>
            <span className="text-slate-400 text-sm">+ 32 more</span>
          </div>
        </div>

        {/* Try It Now */}
        <ProductHuntClient />

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
            Common Questions
          </h2>
          <div className="space-y-4">
            <details className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <summary className="font-medium text-slate-900 cursor-pointer">
                How does the Product Hunt discount work?
              </summary>
              <p className="mt-3 text-slate-600 text-sm">
                When you sign up using the link on this page, you&apos;ll automatically get 20% off 
                your first 3 months of Pirouette Pro. The discount is applied at checkout.
              </p>
            </details>
            <details className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <summary className="font-medium text-slate-900 cursor-pointer">
                What&apos;s included in Pirouette Pro?
              </summary>
              <p className="mt-3 text-slate-600 text-sm">
                Unlimited analyses, historical tracking, competitor comparison, PDF exports, 
                revenue impact estimates, and priority support.
              </p>
            </details>
            <details className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <summary className="font-medium text-slate-900 cursor-pointer">
                Is there a free tier?
              </summary>
              <p className="mt-3 text-slate-600 text-sm">
                Yes! You can analyse one page per week for free, forever. No credit card required.
              </p>
            </details>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-16">
          <Link
            href="/sign-up?ref=producthunt&offer=ph20"
            className="inline-flex items-center gap-2 py-4 px-8 bg-[#da552f] text-white rounded-xl font-semibold text-lg hover:bg-[#c54a2a] transition-colors shadow-lg shadow-[#da552f]/20"
          >
            Get Started with 20% Off
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <p className="text-slate-500 text-sm mt-4">
            Join 100+ founders improving their landing pages
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 mt-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-sm">
          <p>Made with ❤️ by founders, for founders</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <Link href="/privacy" className="hover:text-slate-700">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-700">Terms</Link>
            <Link href="/" className="hover:text-slate-700">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

