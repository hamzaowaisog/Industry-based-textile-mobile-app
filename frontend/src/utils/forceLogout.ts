import * as SecureStore from 'expo-secure-store';

import { useAuthStore } from '@stores/authStore';

import { AppConstants } from '@constants/appConstants';

export const forceLogout = async (): Promise<void> => {
  await Promise.all([
    SecureStore.deleteItemAsync(AppConstants.SECURE_STORE.ACCESS_TOKEN),
    SecureStore.deleteItemAsync(AppConstants.SECURE_STORE.REFRESH_TOKEN),
    SecureStore.deleteItemAsync(AppConstants.SECURE_STORE.BIOMETRIC_TOKEN),
  ]);
  useAuthStore.getState().clearAuth();
};
