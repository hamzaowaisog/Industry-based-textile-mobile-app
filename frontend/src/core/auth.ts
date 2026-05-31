import * as SecureStore from 'expo-secure-store';

import { authForgotPassword, authLogin } from '../api/generated/auth/auth';
import { ForgotPasswordViewModel } from '../api/models';
import { AppConstants } from '../constants/appConstants';
import { useAuthStore } from '../stores/authStore';
import { LoginOptions, LoginResponse } from '../types/login.types';

export const loginAsync = async ({
  credentials,
  rememberMe,
}: LoginOptions): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await authLogin(credentials);
    const res = response as unknown as LoginResponse;

    if (!res.success || !res.data) {
      return { success: false, error: res.message ?? 'Login failed. Please try again.' };
    }

    const { accessToken, refreshToken, userId, roleId, userName } = res.data;

    if (rememberMe) {
      await Promise.all([
        SecureStore.setItemAsync(AppConstants.SECURE_STORE.ACCESS_TOKEN, accessToken),
        SecureStore.setItemAsync(AppConstants.SECURE_STORE.REFRESH_TOKEN, refreshToken),
        SecureStore.setItemAsync(AppConstants.SECURE_STORE.USER_ID, String(userId)),
        SecureStore.setItemAsync(AppConstants.SECURE_STORE.ROLE_ID, String(roleId)),
        SecureStore.setItemAsync(AppConstants.SECURE_STORE.USER_NAME, userName),
      ]);
    }

    useAuthStore.getState().setAuth({ userId, roleId, userName });

    return { success: true };
  } catch {
    return { success: false, error: 'Invalid email or password. Please try again.' };
  }
};

export const forgotPasswordAsync = async (
  payload: ForgotPasswordViewModel,
): Promise<{ success: boolean; error?: string }> => {
  try {
    await authForgotPassword(payload);
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to send reset link. Please try again.' };
  }
};
