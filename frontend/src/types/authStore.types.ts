import { AuthState } from './store.types';

export type AuthStore = AuthState & {
  hydrated: boolean;
  setAuth: (user: Omit<AuthState, 'isAuthenticated' | 'onboardingCompleted' | 'isBiometricEnabled'>) => void;
  clearAuth: () => void;
  hydrate: () => Promise<void>;
  setOnboardingCompleted: (completed: boolean) => void;
  setBiometricEnabled: (enabled: boolean) => void;
};
