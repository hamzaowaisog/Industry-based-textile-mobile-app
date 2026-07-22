import { useCallback, useEffect, useState } from 'react';

import { Platform } from 'react-native';

import { DrawerActions, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useTranslation } from 'react-i18next';

import { useDeviceStore } from '@stores/deviceStore';

import { AppConstants } from '@constants/appConstants';

import {
  biometricDisableAsync,
  biometricSetupAsync,
  logoutAsync,
  resendEmailConfirmationAsync,
} from '../core/auth';
import { fetchSettingsAsync, updateHijriOffsetAsync } from '../core/settings';
import { useAuthStore } from '../stores/authStore';
import type { SettingsStackParamList } from '../types/navigation.types';
import { showError, showSuccess } from '../utils/toast';

const buildVersionLabel = (): string => {
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const build =
    Platform.OS === AppConstants.PLATFORM.OS.IOS
      ? Constants.expoConfig?.ios?.buildNumber
      : String(Constants.expoConfig?.android?.versionCode ?? '');
  return build ? `${version} · build ${build}` : version;
};

export const useSettings = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();

  const userName = useAuthStore((s) => s.userName);
  const roleId = useAuthStore((s) => s.roleId);
  const isBiometricEnabled = useAuthStore((s) => s.isBiometricEnabled);
  const notificationsEnabled = useDeviceStore((s) => s.notificationsEnabled);
  const registerForPush = useDeviceStore((s) => s.registerForPush);
  const unregisterFromPush = useDeviceStore((s) => s.unregisterFromPush);

  const isAdmin = roleId === AppConstants.ROLES.ADMIN;
  const roleLabel = isAdmin ? t('drawer.roleAdmin') : t('drawer.roleStaff');

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricPending, setIsBiometricPending] = useState(false);
  const [isNotificationsPending, setIsNotificationsPending] = useState(false);
  const [isResendingConfirmation, setIsResendingConfirmation] = useState(false);
  const [hijriOffsetDays, setHijriOffsetDays] = useState(0);
  const [isHijriOffsetSaving, setIsHijriOffsetSaving] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(AppConstants.SECURE_STORE.EMAIL).then(setUserEmail);
    Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ]).then(([hasHardware, isEnrolled]) => setIsBiometricAvailable(hasHardware && isEnrolled));
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    fetchSettingsAsync().then((result) => {
      if (result.success && result.hijriOffsetDays !== undefined) {
        setHijriOffsetDays(result.hijriOffsetDays);
      }
    });
  }, [isAdmin]);

  const onMenuPress = useCallback(() => {
    navigation.dispatch(DrawerActions.openDrawer());
  }, [navigation]);

  const onChangePassword = useCallback(() => {
    navigation.navigate(AppConstants.SCREENS.MAIN.CHANGE_PASSWORD);
  }, [navigation]);

  const onResendConfirmation = useCallback(async () => {
    if (!userEmail) return;
    setIsResendingConfirmation(true);
    const result = await resendEmailConfirmationAsync(userEmail);
    setIsResendingConfirmation(false);
    if (result.success) {
      showSuccess(
        result.message ?? t('settings.resendConfirmationSuccessTitle'),
        result.message ? undefined : t('settings.resendConfirmationSuccessSubtitle'),
      );
    } else {
      showError(t('common.errorGeneric'), result.error);
    }
  }, [userEmail, t]);

  const onToggleBiometric = useCallback(
    async (value: boolean) => {
      setIsBiometricPending(true);
      const result = value ? await biometricSetupAsync() : await biometricDisableAsync();
      setIsBiometricPending(false);
      if (!result.success) {
        showError(t('common.errorGeneric'), result.error);
      }
    },
    [t],
  );

  const onToggleNotifications = useCallback(
    async (value: boolean) => {
      setIsNotificationsPending(true);
      await (value ? registerForPush() : unregisterFromPush());
      setIsNotificationsPending(false);
    },
    [registerForPush, unregisterFromPush],
  );

  const onSignOut = useCallback(() => {
    void logoutAsync();
  }, []);

  const applyHijriOffset = useCallback(async (next: number) => {
    if (next < AppConstants.HIJRI_OFFSET.MIN || next > AppConstants.HIJRI_OFFSET.MAX) return;
    setIsHijriOffsetSaving(true);
    const result = await updateHijriOffsetAsync(next);
    setIsHijriOffsetSaving(false);
    if (result.success && result.hijriOffsetDays !== undefined) {
      setHijriOffsetDays(result.hijriOffsetDays);
    } else {
      showError(t('common.errorGeneric'), result.error);
    }
  }, [t]);

  const onIncrementHijriOffset = useCallback(() => {
    void applyHijriOffset(hijriOffsetDays + 1);
  }, [applyHijriOffset, hijriOffsetDays]);

  const onDecrementHijriOffset = useCallback(() => {
    void applyHijriOffset(hijriOffsetDays - 1);
  }, [applyHijriOffset, hijriOffsetDays]);

  return {
    hijriOffsetDays,
    isHijriOffsetSaving,
    onIncrementHijriOffset,
    onDecrementHijriOffset,
    userName,
    userEmail,
    roleLabel,
    isAdmin,
    isBiometricAvailable,
    isBiometricEnabled,
    isBiometricPending,
    isNotificationsEnabled: notificationsEnabled,
    isNotificationsPending,
    appVersion: buildVersionLabel(),
    onMenuPress,
    onChangePassword,
    onResendConfirmation,
    isResendingConfirmation,
    onToggleBiometric,
    onToggleNotifications,
    onSignOut,
  };
};
