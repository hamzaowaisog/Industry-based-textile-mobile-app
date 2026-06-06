import { Platform } from 'react-native';

import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  hasPermission,
  onTokenRefresh,
  requestPermission,
} from '@react-native-firebase/messaging';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import { deviceRegister, deviceUnregister, deviceUnregisterAll } from '@api/generated/device/device';
import { AppConstants } from '@constants/appConstants';
import type { DeviceStore } from '../types/notifications.types';

const fcm = getMessaging();

export const useDeviceStore = create<DeviceStore>((set, get) => ({
  pushToken: null,
  notificationsEnabled: false,
  hasBeenPrompted: true,

  hydratePromptedFlag: async () => {
    const flag = await SecureStore.getItemAsync(
      AppConstants.SECURE_STORE.NOTIFICATIONS_PROMPTED,
    );
    const prompted = flag === 'true';
    if (prompted) {
      const token = await SecureStore.getItemAsync(AppConstants.SECURE_STORE.PUSH_TOKEN);
      if (token) {
        console.log('FCM TOKEN >>>', token);
        set({ hasBeenPrompted: true, pushToken: token, notificationsEnabled: true });
      } else {
        set({ hasBeenPrompted: true, pushToken: null, notificationsEnabled: false });
        await get().checkPermissionStatus();
      }
    } else {
      set({ hasBeenPrompted: false, notificationsEnabled: false });
    }
  },

  registerForPush: async () => {
    try {
      const status = await requestPermission(fcm);
      const authorized =
        status === AuthorizationStatus.AUTHORIZED ||
        status === AuthorizationStatus.PROVISIONAL;

      await SecureStore.setItemAsync(AppConstants.SECURE_STORE.NOTIFICATIONS_PROMPTED, 'true');

      if (!authorized) {
        set({ notificationsEnabled: false, hasBeenPrompted: true });
        return;
      }

      const token = await getToken(fcm);
      console.log('FCM TOKEN >>>', token);
      await SecureStore.setItemAsync(AppConstants.SECURE_STORE.PUSH_TOKEN, token);

      await deviceRegister({
        pushToken: token,
        deviceType: Platform.OS,
        appVersion: Constants.expoConfig?.version ?? '1.0.0',
      });

      onTokenRefresh(fcm, async (newToken: string) => {
        await SecureStore.setItemAsync(AppConstants.SECURE_STORE.PUSH_TOKEN, newToken);
        set({ pushToken: newToken });
        await deviceRegister({
          pushToken: newToken,
          deviceType: Platform.OS,
          appVersion: Constants.expoConfig?.version ?? '1.0.0',
        });
      });

      set({ pushToken: token, notificationsEnabled: true, hasBeenPrompted: true });
    } catch (e) {
      console.log('registerForPush ERROR >>>', e);
      set({ notificationsEnabled: false, hasBeenPrompted: true });
      await SecureStore.setItemAsync(AppConstants.SECURE_STORE.NOTIFICATIONS_PROMPTED, 'true');
    }
  },

  declineNotifications: async () => {
    await SecureStore.setItemAsync(AppConstants.SECURE_STORE.NOTIFICATIONS_PROMPTED, 'true');
    set({ notificationsEnabled: false, hasBeenPrompted: true });
  },

  checkPermissionStatus: async () => {
    try {
      const status = await hasPermission(fcm);
      const authorized =
        status === AuthorizationStatus.AUTHORIZED ||
        status === AuthorizationStatus.PROVISIONAL;
      const { pushToken } = get();

      if (authorized && !pushToken) {
        await get().registerForPush();
      } else if (!authorized && pushToken) {
        await SecureStore.deleteItemAsync(AppConstants.SECURE_STORE.PUSH_TOKEN);
        set({ pushToken: null, notificationsEnabled: false });
      }
    } catch {
      // Silently ignore — runs on every foreground transition
    }
  },

  unregisterFromPush: async () => {
    try {
      const token = await SecureStore.getItemAsync(AppConstants.SECURE_STORE.PUSH_TOKEN);
      if (token) {
        await deviceUnregister({ pushToken: token });
        await SecureStore.deleteItemAsync(AppConstants.SECURE_STORE.PUSH_TOKEN);
      }
      set({ pushToken: null, notificationsEnabled: false });
    } catch {
      set({ pushToken: null, notificationsEnabled: false });
    }
  },

  unregisterAllDevices: async () => {
    try {
      await deviceUnregisterAll();
      await SecureStore.deleteItemAsync(AppConstants.SECURE_STORE.PUSH_TOKEN);
      set({ pushToken: null, notificationsEnabled: false });
    } catch {
      set({ pushToken: null, notificationsEnabled: false });
    }
  },
}));
