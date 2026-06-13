export type AuthState = {
  userId: number | null;
  roleId: number | null;
  userName: string | null;
  isAuthenticated: boolean;
  onboardingCompleted: boolean;
  isBiometricEnabled: boolean;
};

export type AppEnv = 'development' | 'preview' | 'production';
