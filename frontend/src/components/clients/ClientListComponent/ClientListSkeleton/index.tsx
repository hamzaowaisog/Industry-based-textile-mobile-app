import React, { useEffect, useRef } from 'react';

import { Animated, View } from 'react-native';

import { AppConstants } from '@constants/appConstants';

import { styles } from './styles';

const { PULSE_DURATION_MS, PULSE_MIN_OPACITY, LIST_PLACEHOLDER_COUNT } = AppConstants.SKELETON;

const SkeletonRow = () => (
  <View style={styles.row}>
    <View style={styles.avatar} />
    <View style={styles.body}>
      <View style={[styles.line, styles.lineWide]} />
      <View style={[styles.line, styles.lineNarrow]} />
    </View>
    <View style={styles.right} />
  </View>
);

export const ClientListSkeleton = () => {
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
        <SkeletonRow key={k} />
      ))}
    </Animated.View>
  );
};
