'use client';

/**
 * Referral Dashboard Component
 * 
 * Shows user's referral link, stats, and history.
 * Includes share functionality.
 */

import { useState, useEffect } from 'react';

// ============================================================================
// Types
// ============================================================================

interface ReferralStats {
  totalSignups: number;
  totalUpgrades: number;
  pendingRewards: number;
  earnedRewards: number;
  usedRewards: number;
  availableRewards: number;
}

interface Referral {
  id: string;
  status: string;
  referee_email: string | null;
  created_at: string;
  signed_up_at: string | null;
  upgraded_at: string | null;
}

interface ReferralData {
  referralCode: string;
  referralUrl: string;
  stats: ReferralStats;
  referrals: Referral[];
}

// ============================================================================
// Component
// ============================================================================

export default function ReferralDashboard() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const response = await fetch('/api/referrals');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!data?.referralUrl) return;
    
    try {
      await navigator.clipboard.writeText(data.referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShareTwitter = () => {
    if (!data?.referralUrl) return;
    
    const text = encodeURIComponent(
      `I've been using Pirouette to improve my landing page design. Get 20% off your first 3 months with my referral link! 🎨`
    );
    const url = encodeURIComponent(data.referralUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleShareEmail = () => {
    if (!data?.referralUrl) return;
    
    const subject = encodeURIComponent('Check out Pirouette - Design Confidence for Your Landing Page');
    const body = encodeURIComponent(
      `Hey!\n\nI've been using Pirouette to get data-driven feedback on my landing page design. It's really helpful for spotting issues I'd never notice.\n\nUse my referral link to get 20% off your first 3 months:\n${data.referralUrl}\n\nLet me know what you think!`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-48 mb-4"></div>
          <div className="h-10 bg-slate-100 rounded mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-slate-50 rounded"></div>
            <div className="h-20 bg-slate-50 rounded"></div>
            <div className="h-20 bg-slate-50 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🎁</span>
          <h3 className="text-lg font-bold text-slate-900">Invite Friends, Get Free Months</h3>
        </div>
        <p className="text-sm text-slate-600">
          Earn 1 free month of Pro for every friend who upgrades. They get 20% off!
        </p>
      </div>

      {/* Referral Link */}
      <div className="px-6 pb-4">
        <label className="block text-xs font-medium text-slate-500 mb-2">Your referral link</label>
        <div className="flex gap-2">
          <div className="flex-1 bg-white rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-mono text-slate-700 truncate">
            {data.referralUrl}
          </div>
          <button
            onClick={handleCopy}
            className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
              copied
                ? 'bg-emerald-500 text-white'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>

        {/* Share buttons */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleShareTwitter}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Share on X
          </button>
          <button
            onClick={handleShareEmail}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/80 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-slate-900">{data.stats.totalSignups}</div>
            <div className="text-xs text-slate-500">Friends signed up</div>
          </div>
          <div className="bg-white/80 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-indigo-600">{data.stats.totalUpgrades}</div>
            <div className="text-xs text-slate-500">Upgraded to Pro</div>
          </div>
          <div className="bg-white/80 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-emerald-600">{data.stats.availableRewards}</div>
            <div className="text-xs text-slate-500">Free months earned</div>
          </div>
        </div>
      </div>

      {/* Reward status */}
      {data.stats.availableRewards > 0 && (
        <div className="mx-6 mb-4 bg-emerald-100 border border-emerald-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎉</span>
            <div>
              <p className="text-sm font-medium text-emerald-800">
                You have {data.stats.availableRewards} free month{data.stats.availableRewards > 1 ? 's' : ''} available!
              </p>
              <p className="text-xs text-emerald-600">
                Will be applied to your next billing cycle
              </p>
            </div>
          </div>
        </div>
      )}

      {/* History toggle */}
      {data.referrals.length > 0 && (
        <div className="border-t border-indigo-100">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full px-6 py-3 flex items-center justify-between text-sm font-medium text-slate-600 hover:bg-white/50 transition-colors"
          >
            <span>Referral History ({data.referrals.length})</span>
            <svg
              className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showHistory && (
            <div className="px-6 pb-4 space-y-2">
              {data.referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="bg-white rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {referral.referee_email || 'Anonymous'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(referral.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={referral.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Status Badge Component
// ============================================================================

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Pending' },
    signed_up: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Signed Up' },
    upgraded: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Upgraded!' },
    rewarded: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Rewarded' },
  };
  
  const { bg, text, label } = config[status] || config.pending;
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  );
}

