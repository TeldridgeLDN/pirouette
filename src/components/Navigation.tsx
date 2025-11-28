'use client';

/**
 * Navigation Component
 * 
 * Dynamic navigation that shows:
 * - Sign In / Get Started for unauthenticated users
 * - User menu / Dashboard for authenticated users
 * - Pro/Trial badge for paid users
 */

import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { useUserPlan } from '@/hooks/useUserPlan';

interface NavigationProps {
  className?: string;
}

export default function Navigation({ className = '' }: NavigationProps) {
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-heading font-bold text-xl text-slate-900">Pirouette</span>
          </Link>
          
          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-slate-600 hover:text-slate-900 transition-colors">How it Works</a>
            <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">Features</a>
            <Link href="/pricing" className="text-slate-600 hover:text-slate-900 transition-colors">Pricing</Link>
          </div>
          
          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {/* Show when user is NOT signed in */}
            <SignedOut>
              <Link 
                href="/sign-in" 
                className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/sign-up" 
                className="px-5 py-2.5 rounded-lg text-white font-semibold text-sm transition-all hover:-translate-y-0.5"
                style={{ 
                  background: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)', 
                  boxShadow: '0 4px 14px 0 rgba(249, 115, 22, 0.39)' 
                }}
              >
                Get Started Free
              </Link>
            </SignedOut>
            
            {/* Show when user IS signed in */}
            <SignedIn>
              <ProBadge />
              <Link 
                href="/dashboard" 
                className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                Dashboard
              </Link>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'w-9 h-9',
                    userButtonPopoverCard: 'shadow-xl border border-slate-200',
                  }
                }}
              />
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  );
}

/**
 * Pro Badge Component
 * Shows plan status in navigation
 */
function ProBadge() {
  const { isPro, isTrialing, trialDaysRemaining, isLoading } = useUserPlan();

  // Don't show anything while loading or for free users
  if (isLoading || !isPro) {
    return null;
  }

  // Trial badge
  if (isTrialing) {
    return (
      <Link 
        href="/dashboard/billing"
        className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium hover:bg-amber-100 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>TRIAL</span>
        <span className="text-amber-500">• {trialDaysRemaining}d</span>
      </Link>
    );
  }

  // Pro badge
  return (
    <Link
      href="/dashboard/billing"
      className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-xs font-medium hover:from-indigo-600 hover:to-purple-600 transition-colors shadow-sm"
    >
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
      </svg>
      PRO
    </Link>
  );
}
