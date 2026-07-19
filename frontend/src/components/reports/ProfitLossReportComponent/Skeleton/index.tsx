import React, { useEffect, useRef } from 'react';

import { Animated, View } from 'react-native';

import { AppConstants } from '@constants/appConstants';

import { styles } from './styles';

const { PULSE_DURATION_MS, PULSE_MIN_OPACITY, REPORT_STAT_CARDS, REPORT_TABLE_ROWS } =
  AppConstants.SKELETON;

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
    <Animated.View style={{ opacity }}>
      <View style={styles.heroCard}>
        <View style={[styles.line, { width: 130, height: 11 }]} />
        <View style={[styles.line, { width: '55%', height: 32, marginTop: 8 }]} />
      </View>

      <View style={styles.chartCard}>
        <View style={[styles.line, { height: 180, borderRadius: 12 }]} />
      </View>

      <View style={styles.statsGrid}>
        {Array.from({ length: REPORT_STAT_CARDS }).map((_, i) => (
          <View key={i} style={styles.statCard}>
            <View style={[styles.line, { width: 32, height: 32, borderRadius: 10 }]} />
            <View style={[styles.line, { width: '70%', height: 10, marginTop: 12 }]} />
            <View style={[styles.line, { width: '50%', height: 16, marginTop: 6 }]} />
          </View>
        ))}
      </View>

      <View style={styles.tableWrap}>
        <View style={[styles.line, { width: 150, height: 15, marginBottom: 12 }]} />
        <View style={styles.tableCard}>
          {Array.from({ length: REPORT_TABLE_ROWS }).map((_, i) => (
            <View
              key={i}
              style={[styles.tableRow, i === REPORT_TABLE_ROWS - 1 && styles.tableRowLast]}
            >
              <View style={[styles.line, { width: 60, height: 12 }]} />
              <View style={[styles.line, { width: 50, height: 12 }]} />
              <View style={[styles.line, { width: 50, height: 12 }]} />
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
};
