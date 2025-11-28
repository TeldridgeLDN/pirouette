'use client';

/**
 * Product Hunt Banner
 * 
 * Shows a banner for Product Hunt visitors across the site.
 * Detects PH referral from URL params or localStorage.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function ProductHuntBanner() {
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    if (sessionStorage.getItem('ph_banner_dismissed')) {
      return;
    }

    // Check URL params for PH referral
    const ref = searchParams.get('ref');
    const utmSource = searchParams.get('utm_source');
    
    // Check localStorage for stored referral
    const storedRef = localStorage.getItem('referral_source');
    
    const isFromPH = 
      ref === 'producthunt' || 
      utmSource === 'producthunt' ||
      storedRef === 'producthunt';

    if (isFromPH) {
      setIsVisible(true);
      // Store for future visits
      localStorage.setItem('referral_source', 'producthunt');
    }
  }, [searchParams]);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('ph_banner_dismissed', 'true');
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="bg-gradient-to-r from-[#da552f] to-[#e86c4f] text-white py-2 px-4">
      <div className="mx-auto max-w-7xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Product Hunt Logo */}
          <svg className="w-5 h-5" viewBox="0 0 40 40" fill="currentColor">
            <path d="M20 0C8.954 0 0 8.954 0 20s8.954 20 20 20 20-8.954 20-20S31.046 0 20 0zm0 37.5C10.335 37.5 2.5 29.665 2.5 20S10.335 2.5 20 2.5 37.5 10.335 37.5 20 29.665 37.5 20 37.5zm-2.5-25h-5v15h5v-5h2.5c4.142 0 7.5-3.358 7.5-7.5S24.142 12.5 20 12.5h-2.5zm2.5 7.5h-2.5v-5h2.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span className="text-sm font-medium">
            🎉 Welcome from Product Hunt! 
            <Link href="/welcome/producthunt" className="underline ml-1 hover:no-underline">
              Get 20% off Pro →
            </Link>
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="text-white/80 hover:text-white transition-colors p-1"
          aria-label="Dismiss banner"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

