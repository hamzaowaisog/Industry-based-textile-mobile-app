import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { markAsRead } from '@db/queries/notifications';
import { useNotificationStore } from '@stores/notificationStore';
import { handleDeepLink } from '@utils/helpers/notificationDeepLink';
import { getNotificationIcon } from '@utils/helpers/notificationMappers';

import { styles } from './styles';

export const NotificationBanner = () => {
  const { top } = useSafeAreaInsets();
  const banner = useNotificationStore((s) => s.banner);
  const { hideBanner, decrementUnread } = useNotificationStore();
  const translateY = useRef(new Animated.Value(-120)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!banner) {
      Animated.timing(translateY, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }).start();
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    timerRef.current = setTimeout(() => {
      hideBanner();
    }, 4000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [banner, hideBanner, translateY]);

  if (!banner) return null;

  const { Icon, color } = getNotificationIcon(banner.type);

  const onTap = async () => {
    hideBanner();
    await markAsRead(banner.id);
    decrementUnread(1);
    handleDeepLink(banner.type, banner.entityId);
  };

  return (
    <Animated.View
      style={[styles.container, { top: top + 8, transform: [{ translateY }] }]}
      pointerEvents="box-none"
    >
      <TouchableOpacity style={styles.card} onPress={onTap} activeOpacity={0.9}>
        <View style={[styles.iconWrap, { backgroundColor: `${color}18` }]}>
          <Icon size={18} color={color} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>{banner.title}</Text>
          <Text style={styles.body} numberOfLines={1}>{banner.body}</Text>
        </View>
        <TouchableOpacity onPress={hideBanner} style={styles.close} hitSlop={8}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};
