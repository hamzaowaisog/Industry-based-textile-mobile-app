import React, { useEffect, useRef } from 'react';

import { Animated, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { AppConstants } from '@constants/appConstants';

import { styles } from './styles';

const { PULSE_MIN_OPACITY, PULSE_DURATION_MS } = AppConstants.SKELETON;

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

export const EditInvoiceSkeleton = () => {
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
      <View style={styles.header}>
        <View style={styles.backBtn} />
        <View style={styles.headerCenter}>
          <S w={140} h={20} r={8} />
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <Animated.View style={[{ flex: 1, paddingHorizontal: 24, gap: 18 }, { opacity }]}>
        <S w="35%" h={12} />
        <S w="100%" h={50} r={10} />

        <S w="35%" h={12} />
        <S w="100%" h={50} r={10} />

        <S w="30%" h={12} />
        <View style={styles.statusGrid}>
          <View style={styles.statusBtn} />
          <View style={styles.statusBtn} />
          <View style={styles.statusBtn} />
          <View style={styles.statusBtn} />
        </View>

        <S w="25%" h={12} />
        <S w="100%" h={88} r={10} />
      </Animated.View>

      <Animated.View style={[styles.bottomBar, { opacity }]} />
    </SafeAreaView>
  );
};
