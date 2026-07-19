import React from 'react';

import { Text, View } from 'react-native';

import { colors } from '@theme/colors';

import type { AppStatCardProps } from '../../../types/common.types';
import { styles } from './styles';

export const AppStatCard = ({
  tint = colors.primary,
  Icon,
  label,
  value,
  sub,
  trend,
  style,
}: AppStatCardProps) => {
  const trendPositive = (trend ?? 0) >= 0;
  const trendColor = trendPositive ? colors.success : colors.danger;
  const trendBg = trendPositive ? colors.successLight : colors.dangerLight;

  return (
    <View style={[styles.card, style]}>
      <View style={[styles.tintBar, { backgroundColor: tint }]} />
      <View style={styles.body}>
        <View style={[styles.iconTile, { backgroundColor: `${tint}22` }]}>
          <Icon size={18} color={tint} />
        </View>
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        {!!sub && (
          <Text style={styles.sub} numberOfLines={1}>
            {sub}
          </Text>
        )}
        {trend !== undefined && (
          <View style={styles.trendRow}>
            <View style={[styles.trendBadge, { backgroundColor: trendBg }]}>
              <Text style={[styles.trendText, { color: trendColor }]}>
                {trendPositive ? '+' : ''}
                {trend}%
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};
