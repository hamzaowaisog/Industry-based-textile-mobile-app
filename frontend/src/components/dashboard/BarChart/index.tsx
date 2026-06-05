import { Text, View, useWindowDimensions } from 'react-native';

import { useTranslation } from 'react-i18next';
import { BarChart as GiftedBarChart } from 'react-native-gifted-charts';

import { mapMonthlyToBarData } from '@utils/helpers/dashboardMappers';
import { formatCompactNumber } from '@utils/helpers/formatNumber';

import { colors } from '@theme/colors';

import type { BarChartProps } from '../../../types/dashboard.types';
import { styles } from './styles';

export const BarChart = ({ data }: BarChartProps) => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const chartWidth = width - 48 - 40;

  const barData = mapMonthlyToBarData(data);

  const legends = [
    { color: colors.primary, label: t('dashboard.salesLabel') },
    { color: colors.warning, label: t('dashboard.purchasesLabel') },
    { color: colors.danger, label: t('dashboard.expensesLabel') },
  ];

  return (
    <View>
      <View style={styles.legendRow}>
        {legends.map((l) => (
          <View key={l.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: l.color }]} />
            <Text style={styles.legendLabel}>{l.label}</Text>
          </View>
        ))}
      </View>

      <GiftedBarChart
        data={barData}
        width={chartWidth}
        height={160}
        noOfSections={4}
        isAnimated
        animationDuration={600}
        barBorderRadius={3}
        xAxisThickness={1}
        xAxisColor={colors.divider}
        yAxisThickness={0}
        yAxisTextStyle={{ color: colors.textTertiary, fontSize: 10 }}
        formatYLabel={(v: string) => formatCompactNumber(Number(v))}
        rulesColor={colors.divider}
        rulesType="solid"
        initialSpacing={12}
        endSpacing={4}
      />
    </View>
  );
};
