import { useCallback, useEffect, useState } from 'react';

import { InteractionManager } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useNotificationStore } from '@stores/notificationStore';

import { handleDeepLink } from '@utils/helpers/notificationDeepLink';

import {
  deleteNotification,
  getUnreadNotifications,
  markAllRead,
  markAsRead,
} from '@db/queries/notifications';

import type { MainStackParamList } from '../types/navigation.types';
import type { NotificationItem } from '../types/notifications.types';

export const useNotifications = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { unreadCount, decrementUnread, resetUnread } = useNotificationStore();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const data = await getUnreadNotifications();
    setItems(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      void load();
    });
    return () => task.cancel();
  }, [load]);

  const onBack = useCallback(() => navigation.goBack(), [navigation]);

  const onMarkAllRead = useCallback(async () => {
    await markAllRead();
    resetUnread();
    setItems([]);
  }, [resetUnread]);

  const onRowPress = useCallback(
    async (item: NotificationItem) => {
      await markAsRead(item.id);
      decrementUnread(1);
      setItems((prev) => prev.filter((n) => n.id !== item.id));
      handleDeepLink(item.type, item.entityId);
    },
    [decrementUnread],
  );

  const onRowDelete = useCallback(
    async (id: string) => {
      await deleteNotification(id);
      decrementUnread(1);
      setItems((prev) => prev.filter((n) => n.id !== id));
    },
    [decrementUnread],
  );

  return { items, isLoading, unreadCount, onBack, onMarkAllRead, onRowPress, onRowDelete };
};
