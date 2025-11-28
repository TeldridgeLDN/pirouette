'use client';

/**
 * FeatureGate Component
 * 
 * Conditionally renders content based on user's plan and feature access.
 * Shows upgrade prompt or fallback for locked features.
 * 
 * Usage:
 * <FeatureGate feature="historical_tracking">
 *   <HistoricalTrackingSection />
 * </FeatureGate>
 * 
 * Or with custom fallback:
 * <FeatureGate feature="export_pdf" fallback={<CustomLockedState />}>
 *   <ExportPdfButton />
 * </FeatureGate>
 */

import { ReactNode, useState } from 'react';
import { Feature, getFeatureInfo } from '@/lib/features';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import UpgradeModal from './UpgradeModal';

// ============================================================================
// Types
// ============================================================================

interface FeatureGateProps {
  feature: Feature;
  children: ReactNode;
  fallback?: ReactNode;
  /**
   * If true, shows a locked overlay instead of hiding content
   */
  showLockedPreview?: boolean;
  /**
   * If true, clicking the locked state opens upgrade modal
   */
  showUpgradeOnClick?: boolean;
}

// ============================================================================
// Default Locked State Component
// ============================================================================

function DefaultLockedState({ 
  feature, 
  onUpgradeClick 
}: { 
  feature: Feature; 
  onUpgradeClick?: () => void;
}) {
  const info = getFeatureInfo(feature);
  
  return (
    <div className="relative rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
        PRO
      </div>
      
      <div className="text-4xl mb-3">{info.icon}</div>
      <h3 className="font-semibold text-slate-900 mb-1">{info.name}</h3>
      <p className="text-sm text-slate-600 mb-4">{info.description}</p>
      
      {onUpgradeClick && (
        <button
          onClick={onUpgradeClick}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Upgrade to Pro
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Locked Overlay Component
// ============================================================================

function LockedOverlay({ 
  feature, 
  onUpgradeClick 
}: { 
  feature: Feature; 
  onUpgradeClick?: () => void;
}) {
  const info = getFeatureInfo(feature);
  
  return (
    <div 
      className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10 cursor-pointer"
      onClick={onUpgradeClick}
    >
      <div className="text-center p-6">
        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h4 className="font-semibold text-slate-900 mb-1">{info.name}</h4>
        <p className="text-sm text-slate-600 mb-3">Available with Pro</p>
        {onUpgradeClick && (
          <span className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            Click to upgrade →
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function FeatureGate({
  feature,
  children,
  fallback,
  showLockedPreview = false,
  showUpgradeOnClick = true,
}: FeatureGateProps) {
  const { canAccess, isLoading } = useFeatureAccess();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const handleUpgradeClick = showUpgradeOnClick ? () => setShowUpgradeModal(true) : undefined;
  
  // Loading state - show nothing or skeleton
  if (isLoading) {
    return (
      <div className="animate-pulse bg-slate-100 rounded-xl h-32" />
    );
  }
  
  // Feature is accessible - render children
  if (canAccess(feature)) {
    return <>{children}</>;
  }
  
  // Feature is locked
  return (
    <>
      {showLockedPreview ? (
        <div className="relative">
          {/* Render children with blur */}
          <div className="opacity-50 pointer-events-none select-none blur-sm">
            {children}
          </div>
          <LockedOverlay feature={feature} onUpgradeClick={handleUpgradeClick} />
        </div>
      ) : fallback ? (
        // Custom fallback
        <>{fallback}</>
      ) : (
        // Default locked state
        <DefaultLockedState feature={feature} onUpgradeClick={handleUpgradeClick} />
      )}
      
      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger="pro_feature"
        featureName={getFeatureInfo(feature).name}
      />
    </>
  );
}

// ============================================================================
// Additional Components
// ============================================================================

/**
 * Pro Badge - Shows "PRO" badge for locked features
 */
export function ProBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700 ${className}`}>
      PRO
    </span>
  );
}

/**
 * Feature Lock Icon - Shows lock icon for locked features
 */
export function FeatureLockIcon({ 
  feature, 
  className = '' 
}: { 
  feature: Feature; 
  className?: string;
}) {
  const { canAccess } = useFeatureAccess();
  
  if (canAccess(feature)) {
    return null;
  }
  
  return (
    <svg className={`w-4 h-4 text-slate-400 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

/**
 * Inline feature check - for conditional rendering within JSX
 */
export function IfHasFeature({ 
  feature, 
  children 
}: { 
  feature: Feature; 
  children: ReactNode;
}) {
  const { canAccess } = useFeatureAccess();
  
  if (!canAccess(feature)) {
    return null;
  }
  
  return <>{children}</>;
}

/**
 * Inline locked check - for conditional rendering within JSX
 */
export function IfFeatureLocked({ 
  feature, 
  children 
}: { 
  feature: Feature; 
  children: ReactNode;
}) {
  const { canAccess } = useFeatureAccess();
  
  if (canAccess(feature)) {
    return null;
  }
  
  return <>{children}</>;
}

