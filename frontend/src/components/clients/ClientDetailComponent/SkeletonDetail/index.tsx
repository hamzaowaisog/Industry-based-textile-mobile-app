import React, { useEffect, useRef } from 'react';

import { Animated, ScrollView, View } from 'react-native';

import { colors } from '@theme/colors';

import { styles } from './styles';

export const SkeletonDetail = () => {
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
    <Animated.View style={{ opacity, flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.gradientHeader}>
          <View style={styles.headerNav}>
            <View style={[styles.skelLine, { width: 36, height: 36, borderRadius: 10 }]} />
            <View style={[styles.skelLine, { width: 36, height: 36, borderRadius: 10 }]} />
          </View>
          <View style={styles.identity}>
            <View style={[styles.skelLine, { width: 56, height: 56, borderRadius: 28 }]} />
            <View style={styles.nameRow}>
              <View style={[styles.skelLine, { width: '55%', height: 18 }]} />
              <View style={styles.badgeRow}>
                <View style={[styles.skelLine, { width: 72, height: 24, borderRadius: 999 }]} />
                <View style={[styles.skelLine, { width: 52, height: 24, borderRadius: 999 }]} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.balanceCardWrap}>
          <View style={styles.balanceCard}>
            <View style={styles.cardInner}>
              <View style={[styles.skelLine, { width: 130, height: 11 }]} />
              <View style={[styles.skelLine, { width: '65%', height: 36 }]} />
              <View style={[styles.skelLine, { width: 90, height: 13 }]} />
              <View style={styles.actionBtnRow}>
                <View style={[styles.skelLine, { flex: 1, height: 44, borderRadius: 12 }]} />
                <View style={[styles.skelLine, { flex: 1, height: 44, borderRadius: 12 }]} />
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.sectionPad, { paddingTop: 24 }]}>
          <View style={[styles.skelLine, { width: 100, height: 16, marginBottom: 12 }]} />
          <View style={[styles.infoCard, { overflow: 'hidden' }]}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i}>
                <View style={styles.infoRow}>
                  <View style={[styles.skelLine, { width: 36, height: 36, borderRadius: 10 }]} />
                  <View style={{ flex: 1, gap: 6 }}>
                    <View style={[styles.skelLine, { width: '30%', height: 11 }]} />
                    <View style={[styles.skelLine, { width: '55%', height: 14 }]} />
                  </View>
                </View>
                {i < 3 && <View style={styles.infoDivider} />}
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.tabsWrap, { paddingTop: 24, paddingBottom: 32 }]}>
          <View style={styles.tabBar}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center', paddingBottom: 12 }}>
                <View style={[styles.skelLine, { width: 40, height: 13, borderRadius: 6 }]} />
              </View>
            ))}
          </View>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.tabRow}>
              <View style={[styles.skelLine, { width: 36, height: 36, borderRadius: 10 }]} />
              <View style={{ flex: 1, gap: 6 }}>
                <View style={[styles.skelLine, { width: '40%', height: 14 }]} />
                <View style={[styles.skelLine, { width: '25%', height: 11 }]} />
              </View>
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <View style={[styles.skelLine, { width: 70, height: 14 }]} />
                <View style={[styles.skelLine, { width: 50, height: 22, borderRadius: 8 }]} />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );
};
