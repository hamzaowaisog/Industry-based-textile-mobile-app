import { PendingChange } from './db.types';
import { SyncStatus } from './store.types';

export type SyncStore = SyncStatus & {
  pendingChanges: PendingChange[];
  addPendingChange: (change: PendingChange) => void;
  removePendingChange: (localId: string) => void;
  clearPendingChanges: () => void;
  setSyncing: (isSyncing: boolean) => void;
  setSyncPhase: (phase: import('./store.types').SyncPhase) => void;
  setSyncError: (error: string | null) => void;
  setLastSyncedAt: (date: string) => void;
  setIsOnline: (isOnline: boolean) => void;
};
