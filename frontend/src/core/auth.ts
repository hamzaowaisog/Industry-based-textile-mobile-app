import * as SecureStore from 'expo-secure-store';

import {
  authBiometricDisable,
  authBiometricLogin,
  authBiometricSetup,
  authChangePassword,
  authForgotPassword,
  authLogin,
  authLogout,
  authRegister,
  authResendEmailConfirmation,
  authResendSignupOtp,
  authResetPassword,
  authVerifyResetOtp,
  authVerifySignupOtp,
} from '../api/generated/auth/auth';
import {
  ChangePasswordViewModel,
  ForgotPasswordViewModel,
  LogoutRequest,
  RegisterViewModel,
  ResetPasswordWithTokenViewModel,
  VerifyOtpViewModel,
  VerifySignupOtpViewModel,
} from '../api/models';
import { AppConstants } from '../constants/appConstants';
import { useAuthStore } from '../stores/authStore';
import { LoginOptions, LoginResponse } from '../types/login.types';
import { parseApiError, parseApiResponse } from '../utils/helpers/apiResponse';
import i18n from '../utils/i18n';

export const loginAsync = async ({
  credentials,
}: LoginOptions): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await authLogin(credentials);
    const res = response as unknown as LoginResponse;

    if (!res.success || !res.data) {
      return { success: false, error: res.message ?? i18n.t('auth.loginFailed') };
    }

    const { token, refreshToken, userId, roleId, userName, email } = res.data;

    try {
      const accessTokenStr = String(token || '');
      const refreshTokenStr = String(refreshToken || '');
      const userIdStr = String(userId || '');
      const roleIdStr = String(roleId || '');
      const userNameStr = String(userName || '');
      const emailStr = String(email || '');

      if (!accessTokenStr || !refreshTokenStr || !userIdStr || !roleIdStr || !userNameStr) {
        throw new Error('Missing required auth data');
      }

      const secureStoreWrites: Promise<void>[] = [
        SecureStore.setItemAsync(AppConstants.SECURE_STORE.ACCESS_TOKEN, accessTokenStr),
        SecureStore.setItemAsync(AppConstants.SECURE_STORE.REFRESH_TOKEN, refreshTokenStr),
        SecureStore.setItemAsync(AppConstants.SECURE_STORE.USER_ID, userIdStr),
        SecureStore.setItemAsync(AppConstants.SECURE_STORE.ROLE_ID, roleIdStr),
        SecureStore.setItemAsync(AppConstants.SECURE_STORE.USER_NAME, userNameStr),
        SecureStore.setItemAsync(AppConstants.SECURE_STORE.EMAIL, emailStr),
      ];

      await Promise.all(secureStoreWrites);
    } catch (secureStoreError) {
      console.error('SecureStore error:', secureStoreError);
      return { success: false, error: i18n.t('auth.loginFailed') };
    }

    useAuthStore.getState().setAuth({ userId, roleId, userName });

    const storedBiometricToken = await SecureStore.getItemAsync(
      AppConstants.SECURE_STORE.BIOMETRIC_TOKEN,
    );
    useAuthStore.getState().setBiometricEnabled(!!storedBiometricToken);

    return { success: true };
  } catch (err) {
    return { success: false, error: parseApiError(err, i18n.t('auth.invalidCredentials')) };
  }
};

export const forgotPasswordAsync = async (
  payload: ForgotPasswordViewModel,
): Promise<{ success: boolean; nextResendAt?: string; error?: string }> => {
  try {
    const response = await authForgotPassword(payload);
    const r = parseApiResponse<{ nextResendAt?: string }>(response, i18n.t('auth.otpSendFailed'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true, nextResendAt: r.data?.nextResendAt };
  } catch (err) {
    return { success: false, error: parseApiError(err, i18n.t('auth.otpSendFailed')) };
  }
};

export const verifyResetOtpAsync = async (
  payload: VerifyOtpViewModel,
): Promise<{ success: boolean; resetToken?: string; error?: string }> => {
  try {
    const response = await authVerifyResetOtp(payload);
    const r = parseApiResponse<{ resetToken?: string }>(response, i18n.t('auth.invalidOtp'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true, resetToken: r.data?.resetToken };
  } catch (err) {
    return { success: false, error: parseApiError(err, i18n.t('auth.invalidOtp')) };
  }
};

export const biometricSetupAsync = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await authBiometricSetup();
    const r = parseApiResponse<{ biometricToken?: string }>(
      response,
      i18n.t('biometric.setupFailed'),
    );
    if (!r.success) return { success: false, error: r.error };
    if (r.data?.biometricToken) {
      await SecureStore.setItemAsync(
        AppConstants.SECURE_STORE.BIOMETRIC_TOKEN,
        r.data.biometricToken,
      );
      useAuthStore.getState().setBiometricEnabled(true);
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: parseApiError(err, i18n.t('biometric.setupFailed')) };
  }
};

export const biometricLoginAsync = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const biometricToken = await SecureStore.getItemAsync(
      AppConstants.SECURE_STORE.BIOMETRIC_TOKEN,
    );
    if (!biometricToken) {
      return { success: false, error: i18n.t('biometric.notSetup') };
    }

    const response = await authBiometricLogin({ biometricToken });
    const res = response as unknown as LoginResponse;
    if (!res.success || !res.data) {
      await SecureStore.deleteItemAsync(AppConstants.SECURE_STORE.BIOMETRIC_TOKEN);
      useAuthStore.getState().setBiometricEnabled(false);
      return { success: false, error: res.message ?? i18n.t('biometric.loginFailed') };
    }
    const {
      token,
      refreshToken,
      biometricToken: newBiometricToken,
      userId,
      roleId,
      userName,
      email,
    } = res.data;

    await Promise.all([
      SecureStore.setItemAsync(AppConstants.SECURE_STORE.ACCESS_TOKEN, token),
      SecureStore.setItemAsync(AppConstants.SECURE_STORE.REFRESH_TOKEN, refreshToken),
      SecureStore.setItemAsync(
        AppConstants.SECURE_STORE.BIOMETRIC_TOKEN,
        newBiometricToken ?? biometricToken,
      ),
      SecureStore.setItemAsync(AppConstants.SECURE_STORE.USER_ID, String(userId)),
      SecureStore.setItemAsync(AppConstants.SECURE_STORE.ROLE_ID, String(roleId)),
      SecureStore.setItemAsync(AppConstants.SECURE_STORE.USER_NAME, userName),
      SecureStore.setItemAsync(AppConstants.SECURE_STORE.EMAIL, String(email || '')),
    ]);
    useAuthStore.getState().setAuth({ userId, roleId, userName });

    return { success: true };
  } catch (err) {
    return { success: false, error: parseApiError(err, i18n.t('biometric.loginFailed')) };
  }
};

export const biometricDisableAsync = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    await authBiometricDisable();
    await SecureStore.deleteItemAsync(AppConstants.SECURE_STORE.BIOMETRIC_TOKEN);
    useAuthStore.getState().setBiometricEnabled(false);
    return { success: true };
  } catch (err) {
    return { success: false, error: parseApiError(err, i18n.t('biometric.disableFailed')) };
  }
};

export const registerAsync = async (
  payload: RegisterViewModel,
): Promise<{ success: boolean; nextResendAt?: string; error?: string }> => {
  try {
    const response = await authRegister(payload);
    const r = parseApiResponse<{ nextResendAt?: string }>(response, i18n.t('auth.registerFailed'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true, nextResendAt: r.data?.nextResendAt };
  } catch (err) {
    return { success: false, error: parseApiError(err, i18n.t('auth.registerFailed')) };
  }
};

export const verifySignupOtpAsync = async (
  payload: VerifySignupOtpViewModel,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await authVerifySignupOtp(payload);
    const r = parseApiResponse(response, i18n.t('auth.invalidOtp'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true };
  } catch (err) {
    return { success: false, error: parseApiError(err, i18n.t('auth.invalidOtp')) };
  }
};

export const resendSignupOtpAsync = async (
  email: string,
): Promise<{ success: boolean; nextResendAt?: string; error?: string }> => {
  try {
    const response = await authResendSignupOtp({ email });
    const r = parseApiResponse<{ nextResendAt?: string }>(response, i18n.t('auth.otpSendFailed'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true, nextResendAt: r.data?.nextResendAt };
  } catch (err) {
    return { success: false, error: parseApiError(err, i18n.t('auth.otpSendFailed')) };
  }
};

export const resetPasswordAsync = async (
  payload: ResetPasswordWithTokenViewModel,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await authResetPassword(payload);
    const r = parseApiResponse(response, i18n.t('auth.resetFailed'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true };
  } catch (err) {
    return { success: false, error: parseApiError(err, i18n.t('auth.resetFailedRetry')) };
  }
};

export const changePasswordAsync = async (
  payload: ChangePasswordViewModel,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await authChangePassword(payload);
    const r = parseApiResponse(response, i18n.t('changePassword.failed'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true };
  } catch (err) {
    return { success: false, error: parseApiError(err, i18n.t('changePassword.failed')) };
  }
};

export const resendEmailConfirmationAsync = async (
  email: string,
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const response = await authResendEmailConfirmation({ email });
    const r = parseApiResponse(response, i18n.t('settings.resendConfirmationFailed'));
    if (!r.success) return { success: false, error: r.error };
    return { success: true, message: r.message };
  } catch (err) {
    return { success: false, error: parseApiError(err, i18n.t('settings.resendConfirmationFailed')) };
  }
};

export const logoutAsync = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const refreshToken = await SecureStore.getItemAsync(AppConstants.SECURE_STORE.REFRESH_TOKEN);

    if (refreshToken) {
      const pushToken = await SecureStore.getItemAsync(AppConstants.SECURE_STORE.PUSH_TOKEN);
      const payload: LogoutRequest = { refreshToken, pushToken: pushToken ?? undefined };
      await authLogout(payload);
    }

    const { useDeviceStore } = await import('../stores/deviceStore');
    await useDeviceStore.getState().unregisterFromPush();

    await Promise.all([
      SecureStore.deleteItemAsync(AppConstants.SECURE_STORE.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(AppConstants.SECURE_STORE.REFRESH_TOKEN),
      SecureStore.deleteItemAsync(AppConstants.SECURE_STORE.USER_ID),
      SecureStore.deleteItemAsync(AppConstants.SECURE_STORE.ROLE_ID),
      SecureStore.deleteItemAsync(AppConstants.SECURE_STORE.USER_NAME),
      SecureStore.deleteItemAsync(AppConstants.SECURE_STORE.EMAIL),
      // NOTIFICATIONS_PROMPTED intentionally NOT deleted — persists so modal doesn't re-show
    ]);

    useAuthStore.getState().clearAuth();

    return { success: true };
  } catch (err: any) {
    console.error('Logout error:', err);
    await Promise.all([
      SecureStore.deleteItemAsync(AppConstants.SECURE_STORE.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(AppConstants.SECURE_STORE.REFRESH_TOKEN),
    ]);
    useAuthStore.getState().clearAuth();
    return { success: true };
  }
};
