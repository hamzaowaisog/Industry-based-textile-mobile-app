import React, { useEffect, useRef } from 'react';

import { Animated, View } from 'react-native';

import { AppConstants } from '@constants/appConstants';

import { styles } from './styles';

const { PULSE_DURATION_MS, PULSE_MIN_OPACITY, DETAIL_PLACEHOLDER_COUNT } = AppConstants.SKELETON;

export const ProductDetailSkeleton = () => {
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
      <View style={styles.header}>
        <View style={[styles.block, { width: 160, height: 22, borderRadius: 10 }]} />
        <View style={[styles.block, { width: 80, height: 16, borderRadius: 8 }]} />
      </View>
      <View style={styles.chart} />
      <View style={styles.grid}>
        {Array.from({ length: DETAIL_PLACEHOLDER_COUNT }).map((_, k) => (
          <View key={k} style={styles.cell}>
            <View style={[styles.block, { width: 32, height: 32, borderRadius: 9 }]} />
            <View style={[styles.block, { width: '80%', height: 14, borderRadius: 7 }]} />
            <View style={[styles.block, { width: '60%', height: 11, borderRadius: 6 }]} />
          </View>
        ))}
      </View>
    </Animated.View>
  );
};
