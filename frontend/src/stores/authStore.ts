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
    }),

  setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed }),

  hydrate: async () => {
    const onboardingFile = new File(Paths.document, AppConstants.FILES.ONBOARDING_COMPLETED);
    const [accessToken, userId, roleId, userName] = await Promise.all([
      SecureStore.getItemAsync(AppConstants.SECURE_STORE.ACCESS_TOKEN),
      SecureStore.getItemAsync(AppConstants.SECURE_STORE.USER_ID),
      SecureStore.getItemAsync(AppConstants.SECURE_STORE.ROLE_ID),
      SecureStore.getItemAsync(AppConstants.SECURE_STORE.USER_NAME),
    ]);

    const update: Partial<AuthStore> = {
      onboardingCompleted: onboardingFile.exists,  // file cleared on reinstall; Keychain is not
    };

    if (accessToken && userId && roleId && userName) {
      update.userId = Number(userId);
      update.roleId = Number(roleId);
      update.userName = userName;
      update.isAuthenticated = true;
    }

    set({ ...(update as Partial<AuthStore>), hydrated: true });
  },
}));
