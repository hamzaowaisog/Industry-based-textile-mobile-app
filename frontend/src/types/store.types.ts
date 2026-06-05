export type AuthState = {
  userId: number | null;
  roleId: number | null;
  userName: string | null;
  isAuthenticated: boolean;
  onboardingCompleted: boolean;
  isBiometricEnabled: boolean;
};

export type SyncPhase = 'pushing' | 'clearing' | 'pulling' | null;

export type SyncStatus = {
  pendingCount: number;
  lastSyncedAt: string | null;
  isSyncing: boolean;
  syncPhase: SyncPhase;
  syncError: string | null;
  isOnline: boolean;
};

export type AppEnv = 'development' | 'preview' | 'production';
