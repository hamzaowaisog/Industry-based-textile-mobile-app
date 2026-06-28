import { useCallback, useEffect, useState } from 'react';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  notificationDelete,
  notificationGetAll,
  notificationMarkAllRead,
  notificationMarkAsRead,
} from '@api/generated/notification/notification';

import { useNotificationStore } from '@stores/notificationStore';

import { handleDeepLink } from '@utils/helpers/notificationDeepLink';

import type { MainStackParamList } from '../types/navigation.types';
import type { NotificationItem } from '../types/notifications.types';

const toItem = (n: any): NotificationItem => ({
  id: n.id ?? 0,
  type: n.type ?? '',
  title: n.title ?? '',
  body: n.body ?? '',
  entityId: n.entityId ?? undefined,
  isRead: n.isRead ?? false,
  createdAt: n.createdAt ?? '',
});

export const useNotifications = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { unreadCount, decrementUnread, resetUnread } = useNotificationStore();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await notificationGetAll({ unreadOnly: true });
      const r = res as unknown as { success?: boolean; data?: any[] };
      const rawData = r?.data as any;
      const list: any[] = Array.isArray(rawData) ? rawData : (rawData?.items ?? []);
      setItems(list.map(toItem));
    } catch {
      setItems([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onBack = useCallback(() => navigation.goBack(), [navigation]);

  const onMarkAllRead = useCallback(async () => {
    await notificationMarkAllRead();
    resetUnread();
    setItems([]);
  }, [resetUnread]);

  const onRowPress = useCallback(
    async (item: NotificationItem) => {
      await notificationMarkAsRead(item.id);
      decrementUnread(1);
      setItems((prev) => prev.filter((n) => n.id !== item.id));
      handleDeepLink(item.type, item.entityId);
    },
    [decrementUnread],
  );

  const onRowDelete = useCallback(
    async (id: number) => {
      await notificationDelete(id);
      decrementUnread(1);
      setItems((prev) => prev.filter((n) => n.id !== id));
    },
    [decrementUnread],
  );

  return { items, isLoading, unreadCount, onBack, onMarkAllRead, onRowPress, onRowDelete };
};
