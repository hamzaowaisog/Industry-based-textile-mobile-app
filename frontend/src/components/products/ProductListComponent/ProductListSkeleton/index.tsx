import React, { useEffect, useRef } from 'react';

import { Animated, View } from 'react-native';

import { AppConstants } from '@constants/appConstants';

import { styles } from './styles';

const { PULSE_DURATION_MS, PULSE_MIN_OPACITY, LIST_PLACEHOLDER_COUNT } = AppConstants.SKELETON;

export const ProductListSkeleton = () => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: PULSE_MIN_OPACITY,
          duration: PULSE_DURATION_MS,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: PULSE_DURATION_MS,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.wrap, { opacity }]}>
      {Array.from({ length: LIST_PLACEHOLDER_COUNT }).map((_, k) => (
        <View key={k} style={styles.card}>
          <View style={styles.icon} />
          <View style={styles.body}>
            <View style={[styles.line, { width: '55%' }]} />
            <View style={[styles.line, { width: '35%', height: 10 }]} />
          </View>
          <View style={styles.right} />
        </View>
      ))}
    </Animated.View>
  );
};
