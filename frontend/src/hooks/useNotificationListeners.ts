import { useEffect } from 'react';

import { AppState, AppStateStatus } from 'react-native';

import {
  getInitialNotification,
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
} from '@react-native-firebase/messaging';

import { useDeviceStore } from '@stores/deviceStore';
import { useNotificationStore } from '@stores/notificationStore';

import { forceLogout } from '@utils/forceLogout';
import { handleDeepLink } from '@utils/helpers/notificationDeepLink';
import i18n from '@utils/i18n';
import { showError } from '@utils/toast';

import { AppConstants } from '@constants/appConstants';

import { displayLocalNotification } from '../core/pushChannel';
import type { BannerPayload } from '../types/notifications.types';

const fcm = getMessaging();

export const useNotificationListeners = () => {
  const { incrementUnread, showBanner } = useNotificationStore.getState();
  const checkPermissionStatus = useDeviceStore((s) => s.checkPermissionStatus);

  useEffect(() => {
    const unsubFg = onMessage(fcm, async (remoteMessage) => {
      const data = remoteMessage.data as Record<string, string>;
      if (!data?.type) return;

      if (data.type === AppConstants.NOTIFICATION_TYPES.ACCOUNT_DEACTIVATED) {
        await forceLogout();
        showError(i18n.t('auth.accountDeactivatedTitle'), i18n.t('auth.accountDeactivatedMessage'));
        return;
      }

      incrementUnread();

      const banner: BannerPayload = {
        id: 0,
        type: data.type,
        title: data.title ?? '',
        body: data.body ?? '',
        entityId: data.entityId ? Number(data.entityId) : undefined,
      };
      showBanner(banner);

      // The OS only auto-displays FCM alerts when backgrounded/killed, so mirror it
      // with a local notification while foregrounded — same as Facebook.
      void displayLocalNotification(banner.title, banner.body);
    });

    const unsubBgTap = onNotificationOpenedApp(fcm, async (remoteMessage) => {
      const data = remoteMessage.data as Record<string, string>;
      if (!data?.type) return;
      if (data.type === AppConstants.NOTIFICATION_TYPES.ACCOUNT_DEACTIVATED) {
        await forceLogout();
        return;
      }
      incrementUnread();
      handleDeepLink(data.type, data.entityId ? Number(data.entityId) : undefined);
    });

    getInitialNotification(fcm).then(async (remoteMessage) => {
      if (!remoteMessage?.data?.type) return;
      const data = remoteMessage.data as Record<string, string>;
      if (data.type === AppConstants.NOTIFICATION_TYPES.ACCOUNT_DEACTIVATED) {
        await forceLogout();
        return;
      }
      incrementUnread();
      handleDeepLink(data.type, data.entityId ? Number(data.entityId) : undefined);
    });

    const appStateSub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        void checkPermissionStatus();
      }
    });

    return () => {
      unsubFg();
      unsubBgTap();
      appStateSub.remove();
    };
  }, [checkPermissionStatus, incrementUnread, showBanner]);
};
