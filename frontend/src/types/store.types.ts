export type AuthState = {
  userId: number | null;
  roleId: number | null;
  userName: string | null;
  isAuthenticated: boolean;
  onboardingCompleted: boolean;
};

export type SyncStatus = {
  pendingCount: number;
  lastSyncedAt: string | null;
  isSyncing: boolean;
  syncError: string | null;
};

export type AppEnv = 'development' | 'preview' | 'production';
