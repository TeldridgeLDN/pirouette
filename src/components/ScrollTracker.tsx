'use client';

/**
 * Scroll Tracker Component
 *
 * Initialises scroll depth tracking on mount.
 * Uses Plausible to track when users scroll 50%, 75%, and 100% of the page.
 *
 * Usage:
 * Add <ScrollTracker /> to any page where you want scroll tracking.
 */

import { useEffect } from 'react';
import { setupScrollTracking } from '@/lib/analytics';

export default function ScrollTracker() {
  useEffect(() => {
    // Set up scroll tracking and get cleanup function
    const cleanup = setupScrollTracking();

    // Cleanup on unmount
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  // This component doesn't render anything
  return null;
}

