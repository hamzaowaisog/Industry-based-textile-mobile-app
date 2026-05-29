import { create } from 'zustand';

import { PendingChange } from '@types/db.types';
import { SyncStatus } from '@types/store.types';

interface SyncStore extends SyncStatus {
  pendingChanges: PendingChange[];
  addPendingChange: (change: PendingChange) => void;
  removePendingChange: (localId: string) => void;
  setSyncing: (isSyncing: boolean) => void;
  setSyncError: (error: string | null) => void;
  setLastSyncedAt: (date: string) => void;
}

export const useSyncStore = create<SyncStore>((set) => ({
  pendingCount: 0,
  lastSyncedAt: null,
  isSyncing: false,
  syncError: null,
  pendingChanges: [],

  addPendingChange: (change) =>
    set((state) => ({
      pendingChanges: [...state.pendingChanges, change],
      pendingCount: state.pendingChanges.length + 1,
    })),

  removePendingChange: (localId) =>
    set((state) => {
      const updated = state.pendingChanges.filter((c) => c.localId !== localId);
      return { pendingChanges: updated, pendingCount: updated.length };
    }),

  setSyncing: (isSyncing) => set({ isSyncing }),

  setSyncError: (syncError) => set({ syncError }),

  setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),
}));
