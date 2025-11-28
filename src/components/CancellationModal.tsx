'use client';

/**
 * Cancellation Modal
 * 
 * Shows retention offers and handles subscription cancellation.
 * Includes reason survey and discount offer.
 */

import { useState } from 'react';

// ============================================================================
// Types
// ============================================================================

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancelled: (periodEnd: string) => void;
}

type CancellationReason = 
  | 'too_expensive'
  | 'not_using'
  | 'missing_features'
  | 'found_alternative'
  | 'other';

const REASONS: { value: CancellationReason; label: string }[] = [
  { value: 'too_expensive', label: 'Too expensive' },
  { value: 'not_using', label: 'Not using it enough' },
  { value: 'missing_features', label: 'Missing features I need' },
  { value: 'found_alternative', label: 'Found an alternative' },
  { value: 'other', label: 'Other reason' },
];

// ============================================================================
// Component
// ============================================================================

export default function CancellationModal({ isOpen, onClose, onCancelled }: CancellationModalProps) {
  const [step, setStep] = useState<'reason' | 'offer' | 'confirm'>('reason');
  const [selectedReason, setSelectedReason] = useState<CancellationReason | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    setIsCancelling(true);
    setError(null);

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: selectedReason,
          feedback: feedback,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      onCancelled(data.periodEnd);
      onClose();
    } catch (err) {
      console.error('Error cancelling:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleClose = () => {
    setStep('reason');
    setSelectedReason(null);
    setFeedback('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="text-xl">😢</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {step === 'reason' && "We're sorry to see you go"}
                  {step === 'offer' && 'Wait! We have an offer'}
                  {step === 'confirm' && 'Confirm cancellation'}
                </h3>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            {step === 'reason' && (
              <ReasonStep
                selectedReason={selectedReason}
                setSelectedReason={setSelectedReason}
                feedback={feedback}
                setFeedback={setFeedback}
                onNext={() => setStep('offer')}
                onClose={handleClose}
              />
            )}

            {step === 'offer' && (
              <OfferStep
                reason={selectedReason}
                onAcceptOffer={handleClose}
                onDeclineOffer={() => setStep('confirm')}
              />
            )}

            {step === 'confirm' && (
              <ConfirmStep
                isCancelling={isCancelling}
                error={error}
                onCancel={handleCancel}
                onBack={() => setStep('offer')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Step Components
// ============================================================================

function ReasonStep({
  selectedReason,
  setSelectedReason,
  feedback,
  setFeedback,
  onNext,
  onClose,
}: {
  selectedReason: CancellationReason | null;
  setSelectedReason: (reason: CancellationReason) => void;
  feedback: string;
  setFeedback: (feedback: string) => void;
  onNext: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <p className="text-sm text-slate-600 mb-4">
        Before you cancel, can you tell us why? Your feedback helps us improve.
      </p>

      <div className="space-y-2 mb-4">
        {REASONS.map((reason) => (
          <label
            key={reason.value}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedReason === reason.value
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <input
              type="radio"
              name="reason"
              value={reason.value}
              checked={selectedReason === reason.value}
              onChange={() => setSelectedReason(reason.value)}
              className="text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-700">{reason.label}</span>
          </label>
        ))}
      </div>

      {selectedReason === 'other' && (
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Please tell us more..."
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
          rows={3}
        />
      )}

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-200 transition-colors"
        >
          Never mind
        </button>
        <button
          onClick={onNext}
          disabled={!selectedReason}
          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </>
  );
}

function OfferStep({
  reason,
  onAcceptOffer,
  onDeclineOffer,
}: {
  reason: CancellationReason | null;
  onAcceptOffer: () => void;
  onDeclineOffer: () => void;
}) {
  // Customize offer based on reason
  const getOffer = () => {
    switch (reason) {
      case 'too_expensive':
        return {
          title: '50% off your next month',
          description: "We'd hate to lose you over price. How about half off your next billing cycle?",
          cta: 'Accept 50% Off',
        };
      case 'not_using':
        return {
          title: 'Pause your subscription',
          description: 'Take a break without losing your data. Pause for up to 3 months and resume anytime.',
          cta: 'Pause Instead',
        };
      default:
        return {
          title: '50% off your next month',
          description: 'Before you go, we\'d like to offer you 50% off your next billing cycle.',
          cta: 'Accept Offer',
        };
    }
  };

  const offer = getOffer();

  return (
    <>
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">💡</span>
          <h4 className="font-semibold text-indigo-900">{offer.title}</h4>
        </div>
        <p className="text-sm text-indigo-700">{offer.description}</p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={onAcceptOffer}
          className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors"
        >
          {offer.cta}
        </button>
        <button
          onClick={onDeclineOffer}
          className="w-full px-4 py-2 text-slate-600 text-sm hover:text-slate-900 transition-colors"
        >
          No thanks, continue to cancel
        </button>
      </div>
    </>
  );
}

function ConfirmStep({
  isCancelling,
  error,
  onCancel,
  onBack,
}: {
  isCancelling: boolean;
  error: string | null;
  onCancel: () => void;
  onBack: () => void;
}) {
  return (
    <>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-amber-900 mb-2">What happens next:</h4>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• Your Pro access continues until the end of your billing period</li>
          <li>• All your reports and data will be preserved</li>
          <li>• You can reactivate anytime to keep your Pro benefits</li>
        </ul>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-200 transition-colors"
        >
          Go back
        </button>
        <button
          onClick={onCancel}
          disabled={isCancelling}
          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
        </button>
      </div>
    </>
  );
}

