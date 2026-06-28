import React, { useEffect, useRef } from 'react';

import { Animated, ScrollView, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { AppConstants } from '@constants/appConstants';

import { styles } from './styles';

const {
  PULSE_MIN_OPACITY,
  PULSE_DURATION_MS,
  ORDER_STAT_CARDS,
  ORDER_PROGRESS_NODES,
  ORDER_LINE_ITEMS,
} = AppConstants.SKELETON;

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

export const OrderDetailSkeleton = () => {
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
      {/* Fixed nav */}
      <Animated.View style={[styles.heroNav, { opacity }]}>
        <View style={styles.heroNavBtn} />
        <View style={styles.heroNavBtn} />
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        {/* Hero body */}
        <Animated.View style={[styles.heroBody, { opacity }]}>
          <View style={styles.heroTopRow}>
            <S w="22%" h={11} />
            <View style={styles.statusPillSkel} />
          </View>
          <S w="55%" h={18} style={{ marginBottom: 12 }} />
          <S w="72%" h={34} r={8} style={{ marginBottom: 6 }} />
          <S w="28%" h={11} />
        </Animated.View>

        {/* Floating stat cards */}
        <Animated.View style={[styles.statsRow, { opacity }]}>
          {Array.from({ length: ORDER_STAT_CARDS }).map((_, i) => (
            <View key={i} style={styles.statCard}>
              <S w="70%" h={10} />
              <S w="85%" h={14} />
            </View>
          ))}
        </Animated.View>

        <Animated.View style={{ opacity }}>
          {/* Progress track */}
          <View style={styles.progressSection}>
            <View style={styles.progressCard}>
              <View style={styles.progressNodesRow}>
                {Array.from({ length: ORDER_PROGRESS_NODES }).map((_, i) => (
                  <React.Fragment key={i}>
                    <View style={styles.progressNode}>
                      <View style={styles.progressCircleSkel} />
                      <S w={50} h={10} />
                    </View>
                    {i < ORDER_PROGRESS_NODES - 1 && <View style={styles.progressLineSkel} />}
                  </React.Fragment>
                ))}
              </View>
            </View>
          </View>

          {/* Client + dates card */}
          <View style={styles.section}>
            <View style={styles.card}>
              <View style={styles.clientRow}>
                <View style={styles.avatar} />
                <View style={styles.clientInfo}>
                  <S w="50%" h={14} />
                  <S w="30%" h={11} />
                </View>
              </View>
              <View style={styles.dateGrid}>
                <View style={styles.dateCell}>
                  <S w="55%" h={10} />
                  <S w="70%" h={14} />
                </View>
                <View style={[styles.dateCell, styles.dateCellRight]}>
                  <S w="55%" h={10} />
                  <S w="70%" h={14} />
                </View>
              </View>
            </View>
          </View>

          {/* Line items */}
          <View style={styles.section}>
            <S w="35%" h={12} style={{ marginBottom: 10 }} />
            <View style={styles.linesCard}>
              {Array.from({ length: ORDER_LINE_ITEMS }).map((_, i) => (
                <View key={i}>
                  <View style={styles.lineRow}>
                    <View style={styles.indexCircleSkel} />
                    <View style={styles.lineLeft}>
                      <S w="60%" h={13} />
                      <S w="35%" h={11} />
                    </View>
                    <S w={64} h={13} />
                  </View>
                  {i < ORDER_LINE_ITEMS - 1 && <View style={styles.lineDivider} />}
                </View>
              ))}
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom bar placeholder */}
      <Animated.View style={[styles.bottomBar, { opacity }]}>
        <View style={styles.ghostBtnRow}>
          <View style={styles.ghostBtnSkel} />
          <View style={styles.ghostBtnSkel} />
        </View>
        <View style={styles.primaryBtnSkel} />
      </Animated.View>
    </SafeAreaView>
  );
};
