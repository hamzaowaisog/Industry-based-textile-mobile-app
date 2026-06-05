import { useEffect, useRef } from 'react';
import { Animated, ScrollView, View } from 'react-native';

import { styles as dashStyles } from '@components/dashboard/styles';
import { SkeletonBlock } from '@components/dashboard/SkeletonBlock';

import { styles as S } from './styles';

export const DashboardSkeleton = () => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
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
          {[0, 1, 2, 3].map((i) => (
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
            {[0, 1, 2].map((i) => (
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
                {i < 2 && <View style={S.orderDivider} />}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
};
