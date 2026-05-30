import { useEffect, useState } from 'react';
import { OfflineStore } from '../lib/offline-store';
import { ApiClient } from '../services/api-client';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);

  const triggerSync = async () => {
    const queued = await OfflineStore.getQueuedRequests();
    if (queued.length === 0) return;

    console.log(`System online. Replaying ${queued.length} offline events...`);
    setSyncing(true);

    for (const req of queued) {
      try {
        if (req.method === 'POST') {
          await ApiClient.post(req.endpoint, req.body);
        } else if (req.method === 'PUT') {
          await ApiClient.put(req.endpoint, req.body);
        } else if (req.method === 'DELETE') {
          await ApiClient.delete(req.endpoint);
        }
        // Successfully replayed, remove from offline queue
        await OfflineStore.deleteRequest(req.id);
      } catch (err) {
        console.error(`Offline sync retry failed for ${req.endpoint}:`, err);
        // Do not delete, let it remain for future retries if failed
      }
    }

    setSyncing(false);
    console.log('Offline sync completed.');
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = async () => {
      setIsOnline(true);
      await triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check and sync on mount
    if (navigator.onLine) {
      triggerSync();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, syncing, triggerSync };
}
