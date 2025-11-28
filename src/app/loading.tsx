/**
 * Global Loading State
 * 
 * Displayed while route segments are loading.
 * Shows a branded loading spinner.
 */

export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 animate-pulse" />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
        </div>
        
        {/* Loading Spinner */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <svg className="w-5 h-5 text-indigo-600 animate-spin" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-slate-600 font-medium">Loading...</span>
        </div>
        
        <p className="text-slate-400 text-sm">
          Please wait a moment
        </p>
      </div>
    </main>
  );
}

