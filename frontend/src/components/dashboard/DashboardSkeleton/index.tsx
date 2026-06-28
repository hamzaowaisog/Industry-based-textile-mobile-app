import { useEffect, useRef } from 'react';

import { Animated, ScrollView, View } from 'react-native';

import { SkeletonBlock } from '@components/dashboard/SkeletonBlock';
import { styles as dashStyles } from '@components/dashboard/styles';

import { AppConstants } from '@constants/appConstants';

import { styles as S } from './styles';

const { PULSE_MIN_OPACITY, PULSE_DURATION_MS, DASHBOARD_STAT_CARDS, DASHBOARD_RECENT_ORDERS } =
  AppConstants.SKELETON;

export const DashboardSkeleton = () => {
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
    <Animated.View style={{ opacity, flex: 1 }}>
      <ScrollView
        style={dashStyles.scroll}
        contentContainerStyle={dashStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      >
        {/* Stat cards */}
        <ScrollView
          horizontal
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={dashStyles.statScrollContent}
        >
          {Array.from({ length: DASHBOARD_STAT_CARDS }).map((_, i) => (
            <SkeletonBlock key={i} width={160} height={100} borderRadius={16} />
          ))}
        </ScrollView>

        {/* Financials */}
        <View style={dashStyles.section}>
          <SkeletonBlock width={150} height={16} borderRadius={6} />
          <View style={[dashStyles.card, S.cardSpacing]}>
            <View style={S.row}>
              <SkeletonBlock flex={1} height={64} />
              <View style={S.gap} />
              <SkeletonBlock flex={1} height={64} />
            </View>
            <View style={[S.row, S.rowGap]}>
              <SkeletonBlock flex={1} height={64} />
              <View style={S.gap} />
              <SkeletonBlock flex={1} height={64} />
            </View>
            <View style={S.netProfitWrap}>
              <SkeletonBlock flex={1} height={52} borderRadius={10} />
            </View>
          </View>
        </View>

        {/* Monthly chart */}
        <View style={dashStyles.section}>
          <SkeletonBlock width={150} height={16} borderRadius={6} />
          <View style={[dashStyles.card, S.cardSpacing]}>
            <View style={S.netProfitWrap}>
              <SkeletonBlock flex={1} height={180} />
            </View>
          </View>
        </View>

        {/* Recent orders */}
        <View style={dashStyles.section}>
          <SkeletonBlock width={140} height={16} borderRadius={6} />
          <View style={[dashStyles.card, S.cardSpacing]}>
            {Array.from({ length: DASHBOARD_RECENT_ORDERS }).map((_, i) => (
              <View key={i}>
                <View style={S.orderRow}>
                  <SkeletonBlock width={40} height={40} borderRadius={12} />
                  <View style={S.orderInfo}>
                    <SkeletonBlock width={160} height={14} borderRadius={5} />
                    <View style={S.orderSub}>
                      <SkeletonBlock width={100} height={11} borderRadius={4} />
                    </View>
                  </View>
                  <SkeletonBlock width={56} height={14} borderRadius={5} />
                </View>
                {i < DASHBOARD_RECENT_ORDERS - 1 && <View style={S.orderDivider} />}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
};
