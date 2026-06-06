import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import {
  getInitialNotification,
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
} from '@react-native-firebase/messaging';

import { insertNotification } from '@db/queries/notifications';
import { useDeviceStore } from '@stores/deviceStore';
import { useNotificationStore } from '@stores/notificationStore';
import { handleDeepLink } from '@utils/helpers/notificationDeepLink';
import { generateUUID } from '@utils/helpers/uuid';
import type { BannerPayload } from '../types/notifications.types';

const fcm = getMessaging();

const buildItem = (data: Record<string, string>) => ({
  id: generateUUID(),
  type: data.type ?? 'unknown',
  title: data.title ?? '',
  body: data.body ?? '',
  entityId: data.entityId ? Number(data.entityId) : undefined,
  isRead: false,
  createdAt: data.timestamp ?? new Date().toISOString(),
});

export const useNotificationListeners = () => {
  const { incrementUnread, showBanner } = useNotificationStore.getState();
  const checkPermissionStatus = useDeviceStore((s) => s.checkPermissionStatus);

  useEffect(() => {
    const unsubFg = onMessage(fcm, async (remoteMessage) => {
      const data = remoteMessage.data as Record<string, string>;
      if (!data?.type) return;
      const item = buildItem(data);
      await insertNotification(item);
      incrementUnread();
      const banner: BannerPayload = {
        id: item.id,
        type: item.type,
        title: item.title,
        body: item.body,
        entityId: item.entityId,
      };
      showBanner(banner);
    });

    const unsubBgTap = onNotificationOpenedApp(fcm, async (remoteMessage) => {
      const data = remoteMessage.data as Record<string, string>;
      if (!data?.type) return;
      const item = buildItem(data);
      await insertNotification(item);
      incrementUnread();
      handleDeepLink(item.type, item.entityId);
    });

    getInitialNotification(fcm).then(async (remoteMessage) => {
      if (!remoteMessage?.data?.type) return;
      const data = remoteMessage.data as Record<string, string>;
      const item = buildItem(data);
      await insertNotification(item);
      incrementUnread();
      handleDeepLink(item.type, item.entityId);
    });

    const appStateSub = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState === 'active') {
          void checkPermissionStatus();
        }
      },
    );

    return () => {
      unsubFg();
      unsubBgTap();
      appStateSub.remove();
    };
  }, [checkPermissionStatus, incrementUnread, showBanner]);
};
