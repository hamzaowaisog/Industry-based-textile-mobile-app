import { Text, View } from 'react-native';

import { colors } from '@theme/colors';

import type { StatCardProps } from '../../../types/dashboard.types';
import { styles } from './styles';

export const StatCardItem = ({ tint, icon, label, value, sub, trend }: StatCardProps) => {
  const trendPositive = (trend ?? 0) >= 0;
  const trendColor = trendPositive ? colors.success : colors.danger;
  const trendBg = trendPositive ? colors.successLight : colors.dangerLight;

  return (
    <View style={styles.card}>
      <View style={[styles.tintBar, { backgroundColor: tint }]} />
      <View style={styles.body}>
        <View style={[styles.iconTile, { backgroundColor: `${tint}22` }]}>{icon}</View>
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {sub}
        </Text>
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
