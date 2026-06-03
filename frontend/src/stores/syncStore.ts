import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { AppConstants } from '@constants/appConstants';

import { SyncStore } from '../types/syncStore.types';

export const useSyncStore = create<SyncStore>()(
  persist(
    (set) => ({
      pendingCount: 0,
      lastSyncedAt: null,
      isSyncing: false,
      syncError: null,
      isOnline: true,
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
      setIsOnline: (isOnline) => set({ isOnline }),
    }),
    {
      name: AppConstants.SYNC.STORE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        pendingChanges: state.pendingChanges,
        pendingCount: state.pendingCount,
        lastSyncedAt: state.lastSyncedAt,
      }),
    },
  ),
);
