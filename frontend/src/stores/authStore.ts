import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import { AppConstants } from '@constants/appConstants';
import { AuthState } from '../types/store.types';

interface AuthStore extends AuthState {
  setAuth: (user: Omit<AuthState, 'isAuthenticated' | 'onboardingCompleted'>) => void;
  clearAuth: () => void;
  hydrate: () => Promise<void>;
  setOnboardingCompleted: (completed: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  userId: null,
  roleId: null,
  userName: null,
  isAuthenticated: false,
  onboardingCompleted: false,

  setAuth: (user) =>
    set({
      ...user,
      isAuthenticated: true,
    }),

  clearAuth: () =>
    set({
      userId: null,
      roleId: null,
      userName: null,
      isAuthenticated: false,
    }),

  setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed }),

  hydrate: async () => {
    const [accessToken, userId, roleId, userName, onboardingFlag] = await Promise.all([
      SecureStore.getItemAsync(AppConstants.SECURE_STORE.ACCESS_TOKEN),
      SecureStore.getItemAsync(AppConstants.SECURE_STORE.USER_ID),
      SecureStore.getItemAsync(AppConstants.SECURE_STORE.ROLE_ID),
      SecureStore.getItemAsync(AppConstants.SECURE_STORE.USER_NAME),
      SecureStore.getItemAsync(AppConstants.SECURE_STORE.ONBOARDING_COMPLETED),
    ]);

    const update: Partial<AuthStore> = {
      onboardingCompleted: onboardingFlag === 'true',
    };

    if (accessToken && userId && roleId && userName) {
      update.userId = Number(userId);
      update.roleId = Number(roleId);
      update.userName = userName;
      update.isAuthenticated = true;
    }

    set(update as AuthStore);
  },
}));
