import { create } from 'zustand';

import { SyncStore } from '../types/syncStore.types';

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
