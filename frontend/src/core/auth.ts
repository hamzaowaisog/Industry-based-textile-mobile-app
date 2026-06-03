import * as SecureStore from 'expo-secure-store';

import {
  authBiometricDisable,
  authBiometricLogin,
  authBiometricSetup,
  authForgotPassword,
  authLogin,
  authLogout,
  authRegister,
  authResendSignupOtp,
  authResetPassword,
  authVerifyResetOtp,
  authVerifySignupOtp,
} from '../api/generated/auth/auth';
import {
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

    // Backend returns 'token' not 'accessToken', and includes 'email'
    const { token, refreshToken, userId, roleId, userName, email } = res.data;

    if (rememberMe) {
      try {
        // Ensure all values are non-empty strings before storing
        const accessTokenStr = String(token || '');
        const refreshTokenStr = String(refreshToken || '');
        const userIdStr = String(userId || '');
        const roleIdStr = String(roleId || '');
        const userNameStr = String(userName || '');
        const emailStr = String(email || '');

        // Validate all values are non-empty strings
        if (!accessTokenStr || !refreshTokenStr || !userIdStr || !roleIdStr || !userNameStr) {
          throw new Error('Missing required auth data');
        }

        await Promise.all([
          SecureStore.setItemAsync(AppConstants.SECURE_STORE.ACCESS_TOKEN, accessTokenStr),
          SecureStore.setItemAsync(AppConstants.SECURE_STORE.REFRESH_TOKEN, refreshTokenStr),
          SecureStore.setItemAsync(AppConstants.SECURE_STORE.USER_ID, userIdStr),
          SecureStore.setItemAsync(AppConstants.SECURE_STORE.ROLE_ID, roleIdStr),
          SecureStore.setItemAsync(AppConstants.SECURE_STORE.USER_NAME, userNameStr),
          SecureStore.setItemAsync(AppConstants.SECURE_STORE.EMAIL, emailStr),
        ]);
      } catch (secureStoreError) {
        console.error('SecureStore error:', secureStoreError);
        return { success: false, error: i18n.t('auth.loginFailed') };
      }
    }

    useAuthStore.getState().setAuth({ userId, roleId, userName });

    const storedBiometricToken = await SecureStore.getItemAsync(
      AppConstants.SECURE_STORE.BIOMETRIC_TOKEN,
    );
    useAuthStore.getState().setBiometricEnabled(!!storedBiometricToken);

    return { success: true };
  } catch (err: any) {
    const data = err?.response?.data;
    const msg = data?.message ?? i18n.t('auth.invalidCredentials');
    return { success: false, error: msg };
  }
};

export const forgotPasswordAsync = async (
  payload: ForgotPasswordViewModel,
): Promise<{ success: boolean; nextResendAt?: string; error?: string }> => {
  try {
    const response = await authForgotPassword(payload);
    const res = response as unknown as {
      success: boolean;
      data?: { nextResendAt?: string };
      message?: string;
      errors?: string[];
    };
    if (res && !res.success) {
      return {
        success: false,
        error: res.errors?.[0] ?? res.message ?? i18n.t('auth.otpSendFailed'),
      };
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
    const res = response as unknown as {
      success: boolean;
      data?: { resetToken?: string };
      message?: string;
      errors?: string[];
    };
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

export const biometricSetupAsync = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await authBiometricSetup();
    const res = response as unknown as {
      success: boolean;
      data?: { biometricToken?: string };
      message?: string;
    };
    if (!res.success) {
      return { success: false, error: res.message ?? i18n.t('biometric.setupFailed') };
    }
    if (res.data?.biometricToken) {
      await SecureStore.setItemAsync(
        AppConstants.SECURE_STORE.BIOMETRIC_TOKEN,
        res.data.biometricToken,
      );
      useAuthStore.getState().setBiometricEnabled(true);
    }
    return { success: true };
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? i18n.t('biometric.setupFailed');
    return { success: false, error: msg };
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
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? i18n.t('biometric.loginFailed');
    return { success: false, error: msg };
  }
};

export const biometricDisableAsync = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    await authBiometricDisable();
    await SecureStore.deleteItemAsync(AppConstants.SECURE_STORE.BIOMETRIC_TOKEN);
    useAuthStore.getState().setBiometricEnabled(false);
    return { success: true };
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? i18n.t('biometric.disableFailed');
    return { success: false, error: msg };
  }
};

export const registerAsync = async (
  payload: RegisterViewModel,
): Promise<{ success: boolean; nextResendAt?: string; error?: string }> => {
  try {
    const response = await authRegister(payload);
    const res = response as unknown as {
      success: boolean;
      data?: { nextResendAt?: string };
      message?: string;
      errors?: string[];
    };
    if (res && !res.success) {
      return {
        success: false,
        error: res.errors?.[0] ?? res.message ?? i18n.t('auth.registerFailed'),
      };
    }
    return { success: true, nextResendAt: res?.data?.nextResendAt };
  } catch (err: any) {
    const data = err?.response?.data;
    const msg = data?.errors?.[0] ?? data?.message ?? i18n.t('auth.registerFailed');
    return { success: false, error: msg };
  }
};

export const verifySignupOtpAsync = async (
  payload: VerifySignupOtpViewModel,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await authVerifySignupOtp(payload);
    const res = response as unknown as { success: boolean; message?: string; errors?: string[] };
    if (res && !res.success) {
      return { success: false, error: res.errors?.[0] ?? res.message ?? i18n.t('auth.invalidOtp') };
    }
    return { success: true };
  } catch (err: any) {
    const data = err?.response?.data;
    const msg = data?.errors?.[0] ?? data?.message ?? i18n.t('auth.invalidOtp');
    return { success: false, error: msg };
  }
};

export const resendSignupOtpAsync = async (
  email: string,
): Promise<{ success: boolean; nextResendAt?: string; error?: string }> => {
  try {
    const response = await authResendSignupOtp({ email });
    const res = response as unknown as {
      success: boolean;
      data?: { nextResendAt?: string };
      message?: string;
      errors?: string[];
    };
    if (res && !res.success) {
      return {
        success: false,
        error: res.errors?.[0] ?? res.message ?? i18n.t('auth.otpSendFailed'),
      };
    }
    return { success: true, nextResendAt: res?.data?.nextResendAt };
  } catch (err: any) {
    const data = err?.response?.data;
    const msg = data?.errors?.[0] ?? data?.message ?? i18n.t('auth.otpSendFailed');
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

export const logoutAsync = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const refreshToken = await SecureStore.getItemAsync(AppConstants.SECURE_STORE.REFRESH_TOKEN);

    // Call backend logout API (revoke refresh token)
    // pushToken is optional - only needed if you're using push notifications
    if (refreshToken) {
      const payload: LogoutRequest = { refreshToken };
      await authLogout(payload);
    }

    // Clear session tokens — keep BIOMETRIC_TOKEN so the lock screen can re-authenticate
    await Promise.all([
      SecureStore.deleteItemAsync(AppConstants.SECURE_STORE.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(AppConstants.SECURE_STORE.REFRESH_TOKEN),
      SecureStore.deleteItemAsync(AppConstants.SECURE_STORE.USER_ID),
      SecureStore.deleteItemAsync(AppConstants.SECURE_STORE.ROLE_ID),
      SecureStore.deleteItemAsync(AppConstants.SECURE_STORE.USER_NAME),
      SecureStore.deleteItemAsync(AppConstants.SECURE_STORE.EMAIL),
    ]);

    // Clear auth store (but preserve onboardingCompleted and isBiometricEnabled)
    useAuthStore.getState().clearAuth();

    return { success: true };
  } catch (err: any) {
    console.error('Logout error:', err);
    // Even if API call fails, clear session tokens (keep biometric token)
    await Promise.all([
      SecureStore.deleteItemAsync(AppConstants.SECURE_STORE.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(AppConstants.SECURE_STORE.REFRESH_TOKEN),
    ]);
    useAuthStore.getState().clearAuth();
    return { success: true }; // Return success so user can still logout
  }
};
