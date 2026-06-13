import { useEffect, useRef, useState } from 'react';

import { Alert } from 'react-native';

import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useTranslation } from 'react-i18next';

import { AppConstants } from '@constants/appConstants';

import { biometricLoginAsync, biometricSetupAsync } from '../core/auth';
import { useAuthStore } from '../stores/authStore';
import { BiometricNavProp } from '../types/navigation.types';
import { showError, showSuccess } from '../utils/toast';

const deriveInitials = (name: string | null): string => {
  if (!name) return '?';
  return name
    .split(/[\s_.-]/)
    .map((p) => p[0]?.toUpperCase())
    .filter(Boolean)
    .slice(0, 2)
    .join('');
};

export const useBiometric = (navigation: BiometricNavProp) => {
  const { t } = useTranslation();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    Promise.all([
      SecureStore.getItemAsync(AppConstants.SECURE_STORE.USER_NAME),
      SecureStore.getItemAsync(AppConstants.SECURE_STORE.EMAIL),
    ]).then(([name, email]) => {
      if (mountedRef.current) {
        setUserName(name);
        setUserEmail(email);
      }
    });

    void runAuthenticate();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const runAuthenticate = async () => {
    if (!mountedRef.current) return;
    setError(null);
    setIsPending(true);
    try {
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        if (mountedRef.current) setError(t('biometric.notEnrolled'));
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t('biometric.promptMessage'),
        fallbackLabel: t('biometric.fallbackLabel'),
        cancelLabel: t('biometric.cancelLabel'),
        disableDeviceFallback: false,
      });
      if (result.success) {
        const loginResult = await biometricLoginAsync();
        if (!loginResult.success && mountedRef.current) {
          setError(loginResult.error ?? t('biometric.loginFailed'));
        }
      }
    } finally {
      if (mountedRef.current) setIsPending(false);
    }
  };

  return {
    userName,
    userEmail,
    initials: deriveInitials(userName),
    isPending,
    error,
    onAuthenticate: runAuthenticate,
    onSwitchAccount: () => {
      SecureStore.deleteItemAsync(AppConstants.SECURE_STORE.BIOMETRIC_TOKEN).catch(() => {});
      useAuthStore.getState().setBiometricEnabled(false);
      navigation.navigate(AppConstants.SCREENS.AUTH.LOGIN);
    },
    onUsePassword: () => {
      navigation.navigate(AppConstants.SCREENS.AUTH.LOGIN);
    },
  };
};

export const offerBiometricSetup = async (t: (key: string) => string): Promise<void> => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  const isBiometricEnabled = useAuthStore.getState().isBiometricEnabled;
  if (!hasHardware || !isEnrolled || isBiometricEnabled) return;

  Alert.alert(t('biometric.setupTitle'), t('biometric.setupMessage'), [
    { text: t('biometric.setupSkip'), style: 'cancel' },
    {
      text: t('biometric.setupEnable'),
      onPress: async () => {
        const result = await biometricSetupAsync();
        if (result.success) {
          showSuccess(t('biometric.setupSuccessTitle'), t('biometric.setupSuccessSubtitle'));
        } else {
          showError(t('biometric.setupFailedTitle'), result.error);
        }
      },
    },
  ]);
};
