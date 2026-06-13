import { useCallback, useEffect, useState } from 'react';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';

import { AppConstants } from '@constants/appConstants';
import { useAuthStore } from '@stores/authStore';
import { useNotificationStore } from '@stores/notificationStore';
import { MORE_ITEMS } from '@utils/helpers/moreContent';
import type { MainStackParamList } from '../types/navigation.types';
import type { MoreItemConfig, MoreProfileData } from '../types/notifications.types';

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const useMore = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const roleId = useAuthStore((s) => s.roleId);
  const userName = useAuthStore((s) => s.userName) ?? '';
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const isAdmin = roleId === AppConstants.ROLES.ADMIN;

  const [email, setEmail] = useState('');

  useEffect(() => {
    SecureStore.getItemAsync(AppConstants.SECURE_STORE.EMAIL).then((val) => {
      if (val) setEmail(val);
    });
  }, []);

  const items: MoreItemConfig[] = MORE_ITEMS.filter((i) => {
    if (i.adminOnly && !isAdmin) return false;
    return true;
  });

  const profile: MoreProfileData = {
    initials: getInitials(userName),
    name: userName,
    email,
    roleName: isAdmin ? 'Admin' : 'Staff',
  };

  const onBack = useCallback(() => navigation.goBack(), [navigation]);

  const onTilePress = useCallback(
    (destination: string) => {
      if (destination === 'NotificationCenter') {
        navigation.navigate('NotificationCenter');
      } else {
        navigation.navigate('DrawerRoot', { screen: destination } as any);
      }
    },
    [navigation],
  );

  return { items, profile, unreadCount, onBack, onTilePress };
};
