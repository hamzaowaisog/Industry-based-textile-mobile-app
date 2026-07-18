import React, { useEffect, useRef } from 'react';

import { Animated, View } from 'react-native';

import { AppConstants } from '@constants/appConstants';

import { styles } from './styles';

const { PULSE_DURATION_MS, PULSE_MIN_OPACITY, REPORT_STAT_CARDS, LIST_PLACEHOLDER_COUNT } =
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
      <View style={styles.clientCard}>
        <View style={styles.clientRow}>
          <View style={[styles.line, { width: 44, height: 44, borderRadius: 22 }]} />
          <View style={styles.clientTextWrap}>
            <View style={[styles.line, { width: '50%', height: 16 }]} />
            <View style={[styles.line, { width: '30%', height: 12, marginTop: 6 }]} />
          </View>
        </View>
      </View>

      <View style={styles.heroCard}>
        <View style={[styles.line, { width: 130, height: 11 }]} />
        <View style={[styles.line, { width: '55%', height: 32, marginTop: 8 }]} />
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

      <View style={styles.tabsRow}>
        {Array.from({ length: 3 }).map((_, i) => (
          <View key={i} style={styles.tabItem}>
            <View style={[styles.line, { width: 50, height: 13 }]} />
          </View>
        ))}
      </View>

      <View style={styles.tabContent}>
        {Array.from({ length: LIST_PLACEHOLDER_COUNT }).map((_, i) => (
          <View key={i} style={styles.rowCard}>
            <View style={[styles.line, { width: 36, height: 36, borderRadius: 10 }]} />
            <View style={styles.rowBody}>
              <View style={[styles.line, { width: '60%', height: 13 }]} />
              <View style={[styles.line, { width: '35%', height: 11, marginTop: 6 }]} />
            </View>
            <View style={[styles.line, { width: 50, height: 13 }]} />
          </View>
        ))}
      </View>
    </Animated.View>
  );
};
