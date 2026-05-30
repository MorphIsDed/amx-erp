'use client';

import { useOfflineSync } from '../../hooks/use-offline-sync';

export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  const { isOnline, syncing } = useOfflineSync();

  return (
    <>
      {children}
      
      {/* Floating Status Widgets */}
      {!isOnline && (
        <div className="fixed bottom-6 right-6 z-[9999] animate-bounce">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 backdrop-blur-md shadow-2xl text-red-200 text-xs font-semibold tracking-wide">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            Offline Mode Active (Transactions Staged)
          </div>
        </div>
      )}

      {isOnline && syncing && (
        <div className="fixed bottom-6 right-6 z-[9999]">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 backdrop-blur-md shadow-2xl text-indigo-200 text-xs font-semibold tracking-wide">
            <svg className="animate-spin h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Synchronizing workspace...
          </div>
        </div>
      )}
    </>
  );
}
