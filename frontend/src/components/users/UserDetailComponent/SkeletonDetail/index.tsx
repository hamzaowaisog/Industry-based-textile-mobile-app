import React, { useEffect, useRef } from 'react';

import { Animated, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { AppConstants } from '@constants/appConstants';

import { styles } from './styles';

const { PULSE_DURATION_MS, PULSE_MIN_OPACITY } = AppConstants.SKELETON;

export const SkeletonDetail = () => {
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
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <Animated.View style={{ opacity, flex: 1 }}>
        <View style={styles.headerRow}>
          <View style={[styles.line, { width: 36, height: 36, borderRadius: 10 }]} />
          <View style={[styles.line, { width: 100, height: 16 }]} />
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.avatarRow}>
              <View style={[styles.line, { width: 56, height: 56, borderRadius: 28 }]} />
              <View style={{ flex: 1, gap: 8 }}>
                <View style={[styles.line, { width: '60%', height: 18 }]} />
                <View style={[styles.line, { width: 90, height: 22, borderRadius: 11 }]} />
              </View>
            </View>
          </View>

          <View style={styles.sectionPad}>
            <View style={[styles.line, { width: 90, height: 16, marginBottom: 12 }]} />
            <View style={styles.infoCard}>
              {Array.from({ length: 4 }).map((_, i) => (
                <View key={i}>
                  <View style={styles.infoRow}>
                    <View style={[styles.line, { width: 36, height: 36, borderRadius: 10 }]} />
                    <View style={{ flex: 1, gap: 6 }}>
                      <View style={[styles.line, { width: '30%', height: 11 }]} />
                      <View style={[styles.line, { width: '55%', height: 14 }]} />
                    </View>
                  </View>
                  {i < 3 && <View style={styles.infoDivider} />}
                </View>
              ))}
            </View>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};
