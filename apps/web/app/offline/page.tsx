'use client';

import { useState } from 'react';

export default function OfflinePage() {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = () => {
    setRetrying(true);
    setTimeout(() => {
      setRetrying(false);
      if (typeof window !== 'undefined' && navigator.onLine) {
        window.location.href = '/';
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex flex-col items-center justify-center p-6 text-white selection:bg-indigo-500/30">
      <div className="max-w-md w-full text-center space-y-8 p-10 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Sleek top glowing line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
        
        {/* Pulsing visual connection status indicator */}
        <div className="flex justify-center relative">
          <div className="h-20 w-20 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center relative animate-pulse">
            <svg
              className="h-10 w-10 text-indigo-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.284 16.284A3 3 0 0 0 12 17a3 3 0 0 0 3.716-.716M4.047 12.047A7.5 7.5 0 0 1 12 10.5a7.5 7.5 0 0 1 7.953 1.547M1.05 7.8A12 12 0 0 1 12 5.25A12 12 0 0 1 22.95 7.8M12 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"
              />
            </svg>
            {/* Red offline micro-dot */}
            <span className="absolute top-1 right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-neutral-900"></span>
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-neutral-50 via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
            ERP Workspace Offline
          </h1>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Your connection has been interrupted. AMX-ERP is securely staging your local modifications and will sync them when you reconnect.
          </p>
        </div>

        {/* Retry button */}
        <div className="pt-4">
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="w-full inline-flex items-center justify-center px-6 py-3.5 border border-neutral-700/80 rounded-xl bg-neutral-800/50 hover:bg-neutral-800 text-sm font-semibold tracking-wide text-neutral-200 transition-all duration-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
          >
            {retrying ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Checking Status...
              </span>
            ) : (
              'Check Connectivity'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
