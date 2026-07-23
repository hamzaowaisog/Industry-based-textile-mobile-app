import { File, Paths } from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import { AppConstants } from '@constants/appConstants';

import { AuthStore } from '../types/authStore.types';

export const useAuthStore = create<AuthStore>((set) => ({
  userId: null,
  roleId: null,
  userName: null,
  isAuthenticated: false,
  onboardingCompleted: false,
  isBiometricEnabled: false,
  hydrated: false,

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
      isBiometricEnabled: false,
    }),

  setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed }),
  setBiometricEnabled: (enabled) => set({ isBiometricEnabled: enabled }),

  hydrate: async () => {
    const onboardingFile = new File(Paths.document, AppConstants.FILES.ONBOARDING_COMPLETED);
    const [accessToken, userId, roleId, userName, biometricToken] = await Promise.all([
      SecureStore.getItemAsync(AppConstants.SECURE_STORE.ACCESS_TOKEN),
      SecureStore.getItemAsync(AppConstants.SECURE_STORE.USER_ID),
      SecureStore.getItemAsync(AppConstants.SECURE_STORE.ROLE_ID),
      SecureStore.getItemAsync(AppConstants.SECURE_STORE.USER_NAME),
      SecureStore.getItemAsync(AppConstants.SECURE_STORE.BIOMETRIC_TOKEN),
    ]);

    const update: Partial<AuthStore> = {
      onboardingCompleted: onboardingFile.exists,
      isBiometricEnabled: !!biometricToken,
    };

    if (accessToken && userId && roleId && userName && !biometricToken) {
      update.userId = Number(userId);
      update.roleId = Number(roleId);
      update.userName = userName;
      update.isAuthenticated = true;
    }

    set({ ...(update as Partial<AuthStore>), hydrated: true });
  },
}));
