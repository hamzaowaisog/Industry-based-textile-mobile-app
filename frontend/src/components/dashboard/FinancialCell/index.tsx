import { Text, View } from 'react-native';

import { colors } from '@theme/colors';

import type { FinancialCellProps } from '../../../types/dashboard.types';
import { styles } from './styles';

export const FinancialCell = ({
  label,
  value,
  borderRight,
  borderBottom,
  padLeft,
  padTop,
  valueColor,
  trend,
  trendVsLabel,
}: FinancialCellProps) => (
  <View
    style={[
      styles.cell,
      borderRight && styles.borderRight,
      borderBottom && styles.borderBottom,
      padLeft && styles.padLeft,
      padTop && styles.padTop,
    ]}
  >
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, valueColor ? { color: valueColor } : undefined]}>{value}</Text>
    {trend != null && (
      <View style={styles.trendBadge}>
        <Text style={[styles.trendText, { color: trend.up ? colors.success : colors.danger }]}>
          {trend.up ? '▲' : '▼'} {trend.pct}%
        </Text>
        {trendVsLabel ? <Text style={styles.trendVs}>{trendVsLabel}</Text> : null}
      </View>
    )}
  </View>
);
