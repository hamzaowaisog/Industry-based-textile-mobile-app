import { useEffect, useRef } from 'react';

import type { BottomSheetModal } from '@gorhom/bottom-sheet';

import { useClientStore } from '@stores/clientStore';
import { useSyncStore } from '@stores/syncStore';
import { syncNow } from '../core/sync';

const RECENT_SYNC_THRESHOLD_MS = 10_000;

export const useSyncBottomSheet = (onAfterSync?: () => void) => {
  const ref = useRef<BottomSheetModal>(null);
  const hasAutoSyncedRef = useRef(false);

  const isOnline = useSyncStore((s) => s.isOnline);
  const isSyncing = useSyncStore((s) => s.isSyncing);
  const syncPhase = useSyncStore((s) => s.syncPhase);
  const pendingCount = useSyncStore((s) => s.pendingCount);
  const pendingChanges = useSyncStore((s) => s.pendingChanges);
  const lastSyncedAt = useSyncStore((s) => s.lastSyncedAt);

  const triggerSync = async () => {
    if (!isOnline || isSyncing) return;
    await syncNow();
    useClientStore.getState().refreshFromDb();
    onAfterSync?.();
  };

  useEffect(() => {
    if (hasAutoSyncedRef.current || !isOnline) return;

    const lastSynced = useSyncStore.getState().lastSyncedAt;
    const recentlySynced =
      lastSynced && Date.now() - new Date(lastSynced).getTime() < RECENT_SYNC_THRESHOLD_MS;

    hasAutoSyncedRef.current = true;

    if (recentlySynced && pendingCount === 0) return;

    ref.current?.present();
    void triggerSync();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  const openSheet = () => {
    ref.current?.present();
    void triggerSync();
  };

  return {
    syncSheetRef: ref,
    isOnline,
    isSyncing,
    syncPhase,
    pendingCount,
    pendingChanges,
    lastSyncedAt,
    openSheet,
  };
};
