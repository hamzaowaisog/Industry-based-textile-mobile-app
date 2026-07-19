import React, { useEffect, useRef } from 'react';

import { Animated, View } from 'react-native';

import { AppConstants } from '@constants/appConstants';

import { styles } from './styles';

const { PULSE_DURATION_MS, PULSE_MIN_OPACITY, REPORT_TABLE_ROWS } = AppConstants.SKELETON;

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
      <View style={styles.chartCard}>
        <View style={styles.legendRow}>
          <View style={[styles.line, { width: 50, height: 11 }]} />
          <View style={[styles.line, { width: 50, height: 11 }]} />
        </View>
        <View style={[styles.line, { height: 160, borderRadius: 12 }]} />
      </View>

      <View style={styles.totalsGrid}>
        {Array.from({ length: 2 }).map((_, i) => (
          <View key={i} style={styles.totalTile}>
            <View style={[styles.line, { width: 80, height: 11 }]} />
            <View style={[styles.line, { width: '60%', height: 20, marginTop: 8 }]} />
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
              <View style={[styles.line, { width: 50, height: 12 }]} />
              <View style={[styles.line, { width: 40, height: 12 }]} />
              <View style={[styles.line, { width: 40, height: 12 }]} />
              <View style={[styles.line, { width: 40, height: 12 }]} />
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
};
