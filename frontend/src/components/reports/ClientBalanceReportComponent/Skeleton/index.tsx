import React, { useEffect, useRef } from 'react';

import { Animated, View } from 'react-native';

import { AppConstants } from '@constants/appConstants';

import { styles } from './styles';

const { PULSE_DURATION_MS, PULSE_MIN_OPACITY, REPORT_BALANCE_ROWS } = AppConstants.SKELETON;

export const Skeleton = () => {
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
      <View style={styles.chartCard}>
        <View style={[styles.line, { width: 140, height: 15, marginBottom: 12 }]} />
        <View style={[styles.line, { height: 120, borderRadius: 12 }]} />
      </View>

      {Array.from({ length: REPORT_BALANCE_ROWS }).map((_, i) => (
        <View key={i} style={styles.rowCard}>
          <View style={[styles.line, { width: 36, height: 36, borderRadius: 18 }]} />
          <View style={styles.rowBody}>
            <View style={[styles.line, { width: '55%', height: 13 }]} />
            <View style={[styles.line, { width: '30%', height: 11, marginTop: 6 }]} />
          </View>
          <View style={[styles.line, { width: 60, height: 13 }]} />
        </View>
      ))}
    </Animated.View>
  );
};
