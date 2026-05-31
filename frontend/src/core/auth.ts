import * as SecureStore from 'expo-secure-store';

import { authForgotPassword, authLogin, authResetPassword, authVerifyResetOtp } from '../api/generated/auth/auth';
import { ForgotPasswordViewModel, ResetPasswordWithTokenViewModel, VerifyOtpViewModel } from '../api/models';
import { AppConstants } from '../constants/appConstants';
import { useAuthStore } from '../stores/authStore';
import { LoginOptions, LoginResponse } from '../types/login.types';
import i18n from '../utils/i18n';

export const loginAsync = async ({
  credentials,
  rememberMe,
}: LoginOptions): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await authLogin(credentials);
    const res = response as unknown as LoginResponse;

    if (!res.success || !res.data) {
      return { success: false, error: res.message ?? i18n.t('auth.loginFailed') };
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
    return { success: false, error: i18n.t('auth.invalidCredentials') };
  }
};

export const forgotPasswordAsync = async (
  payload: ForgotPasswordViewModel,
): Promise<{ success: boolean; nextResendAt?: string; error?: string }> => {
  try {
    const response = await authForgotPassword(payload);
    const res = response as unknown as { success: boolean; data?: { nextResendAt?: string }; message?: string; errors?: string[] };
    if (res && !res.success) {
      return { success: false, error: res.errors?.[0] ?? res.message ?? i18n.t('auth.otpSendFailed') };
    }
    return { success: true, nextResendAt: res?.data?.nextResendAt };
  } catch (err: any) {
    const data = err?.response?.data;
    const msg = data?.errors?.[0] ?? data?.message ?? i18n.t('auth.otpSendFailed');
    return { success: false, error: msg };
  }
};

export const verifyResetOtpAsync = async (
  payload: VerifyOtpViewModel,
): Promise<{ success: boolean; resetToken?: string; error?: string }> => {
  try {
    const response = await authVerifyResetOtp(payload);
    const res = response as unknown as { success: boolean; data?: { resetToken?: string }; message?: string; errors?: string[] };
    if (res && !res.success) {
      return { success: false, error: res.errors?.[0] ?? res.message ?? i18n.t('auth.invalidOtp') };
    }
    return { success: true, resetToken: res?.data?.resetToken };
  } catch (err: any) {
    const data = err?.response?.data;
    const msg = data?.errors?.[0] ?? data?.message ?? i18n.t('auth.invalidOtp');
    return { success: false, error: msg };
  }
};

export const resetPasswordAsync = async (
  payload: ResetPasswordWithTokenViewModel,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await authResetPassword(payload);
    const res = response as unknown as { success: boolean; message?: string };
    if (res && !res.success) {
      return { success: false, error: res.message ?? i18n.t('auth.resetFailed') };
    }
    return { success: true };
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? i18n.t('auth.resetFailedRetry');
    return { success: false, error: msg };
  }
};
