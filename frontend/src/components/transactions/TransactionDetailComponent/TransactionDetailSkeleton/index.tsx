import React, { useEffect, useRef } from 'react';

import { Animated, ScrollView, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { AppConstants } from '@constants/appConstants';

import { styles } from './styles';

const { PULSE_MIN_OPACITY, PULSE_DURATION_MS, ORDER_STAT_CARDS } = AppConstants.SKELETON;

const S = ({
  w,
  h = 12,
  r = 6,
  style,
}: {
  w: number | string;
  h?: number;
  r?: number;
  style?: object;
}) => <View style={[styles.skelLine, { width: w, height: h, borderRadius: r }, style]} />;

export const TransactionDetailSkeleton = () => {
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
      <Animated.View style={[styles.heroNav, { opacity }]}>
        <View style={styles.heroNavBtn} />
        <View style={styles.heroNavActions}>
          <View style={styles.heroNavBtn} />
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        <Animated.View style={[styles.heroBody, { opacity }]}>
          <View style={styles.heroTopRow}>
            <S w="30%" h={11} />
            <View style={styles.statusPillSkel} />
          </View>
          <S w="55%" h={20} style={{ marginBottom: 12 }} />
          <S w="60%" h={34} r={8} style={{ marginBottom: 6 }} />
          <S w="40%" h={11} />
        </Animated.View>

        <Animated.View style={[styles.statsRow, { opacity }]}>
          {Array.from({ length: ORDER_STAT_CARDS }).map((_, i) => (
            <View key={i} style={styles.statCard}>
              <S w="70%" h={10} />
              <S w="85%" h={14} />
            </View>
          ))}
        </Animated.View>

        <Animated.View style={{ opacity }}>
          <View style={styles.section}>
            <S w="28%" h={12} style={{ marginBottom: 10 }} />
            <View style={styles.card}>
              {Array.from({ length: 3 }).map((_, i) => (
                <View key={i} style={styles.infoRow}>
                  <S w="35%" h={13} />
                  <S w={90} h={13} />
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};
