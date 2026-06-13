import React, { useEffect, useRef } from 'react';

import { Animated, ScrollView, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@theme/colors';

import { styles } from './styles';

const S = ({ w, h = 12, r = 6, style }: { w: number | string; h?: number; r?: number; style?: object }) => (
  <View style={[styles.skelLine, { width: w, height: h, borderRadius: r }, style]} />
);

export const OrderDetailSkeleton = () => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBtn} />
        <View style={styles.headerCenter}>
          <S w="30%" h={14} />
          <S w="45%" h={11} />
        </View>
        <View style={styles.headerBtn} />
      </View>

      <Animated.View style={{ opacity, flex: 1 }}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        >
          {/* Status banner */}
          <View style={styles.section}>
            <View style={styles.bannerCard} />
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
                  <S w="55%" h={11} />
                  <S w="70%" h={14} />
                </View>
                <View style={[styles.dateCell, styles.dateCellRight]}>
                  <S w="55%" h={11} />
                  <S w="70%" h={14} />
                </View>
              </View>
            </View>
          </View>

          {/* Line items */}
          <View style={styles.section}>
            <S w="35%" h={12} style={{ marginBottom: 8 }} />
            <View style={styles.linesCard}>
              {[0, 1, 2].map((i) => (
                <View key={i}>
                  <View style={styles.lineRow}>
                    <View style={styles.lineLeft}>
                      <S w="60%" h={13} />
                      <S w="35%" h={11} />
                    </View>
                    <S w={64} h={13} />
                  </View>
                  {i < 2 && <View style={styles.lineDivider} />}
                </View>
              ))}
            </View>
          </View>

          {/* Financial summary */}
          <View style={styles.section}>
            <View style={styles.summaryCard}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={styles.summaryRow}>
                  <S w="30%" h={12} />
                  <S w="25%" h={12} />
                </View>
              ))}
              <View style={{ height: 1, backgroundColor: colors.divider }} />
              <View style={styles.summaryRow}>
                <S w="25%" h={14} />
                <S w="30%" h={16} />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom bar placeholder */}
        <View style={styles.bottomBar}>
          <View style={styles.ghostBtnRow}>
            <View style={styles.ghostBtnSkel} />
            <View style={styles.ghostBtnSkel} />
          </View>
          <View style={styles.primaryBtnSkel} />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};
