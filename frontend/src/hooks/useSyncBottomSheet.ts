import { useEffect, useRef } from 'react';

import type { BottomSheetModal } from '@gorhom/bottom-sheet';

import { useSyncStore } from '@stores/syncStore';
import { syncNow } from '../core/sync';

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
    onAfterSync?.();
  };

  // Auto-open and sync once on first online mount.
  useEffect(() => {
    if (hasAutoSyncedRef.current || !isOnline) return;
    hasAutoSyncedRef.current = true;
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
