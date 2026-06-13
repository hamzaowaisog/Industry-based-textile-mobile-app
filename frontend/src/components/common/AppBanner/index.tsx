import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { AppBannerProps } from '@types/common.types';

import { styles } from './styles';

export const AppBanner = ({
  visible,
  title,
  body,
  Icon,
  iconColor,
  onPress,
  onDismiss,
  autoDismissMs = 4000,
}: AppBannerProps) => {
  const { top } = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-120)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) {
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
      onDismiss();
    }, autoDismissMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, onDismiss, translateY, autoDismissMs]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.container, { top: top + 8, transform: [{ translateY }] }]}
      pointerEvents="box-none"
    >
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
        <View style={[styles.iconWrap, { backgroundColor: `${iconColor}18` }]}>
          <Icon size={18} color={iconColor} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.body} numberOfLines={1}>{body}</Text>
        </View>
        <TouchableOpacity onPress={onDismiss} style={styles.close} hitSlop={8}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};
