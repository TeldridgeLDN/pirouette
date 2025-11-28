'use client';

/**
 * Navigation Component
 * 
 * Dynamic navigation that shows:
 * - Sign In / Get Started for unauthenticated users
 * - User menu / Dashboard for authenticated users
 */

import Link from 'next/link';
import { useAuth, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

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
            <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
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

