import React from 'react';

import { Text, View, useWindowDimensions } from 'react-native';

import { useTranslation } from 'react-i18next';
import { LineChart } from 'react-native-gifted-charts';

import { AppCard } from '@components/common/AppCard';

import { formatCompactNumber } from '@utils/helpers/formatNumber';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';

import type { BalanceTrendChartProps } from '../../../../types/reports.types';
import { styles } from './styles';

const {
  Y_AXIS_LABEL_WIDTH,
  HEIGHT,
  SECTIONS,
  INITIAL_SPACING,
  END_SPACING,
  DATA_POINT_RADIUS,
  ANIMATION_DURATION_MS,
  START_OPACITY,
} = AppConstants.CHART;

export const BalanceTrendChart = ({ points }: BalanceTrendChartProps) => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const chartWidth = width - 48 - 36 - Y_AXIS_LABEL_WIDTH;

  const data = points.map((p) => ({
    value: p.balance,
    label: p.month.split(' ')[0],
    labelTextStyle: { fontSize: 10, color: colors.textSecondary },
  }));

  return (
    <View>
      <Text style={styles.sectionTitle}>{t('reports.clientDetail.balanceTrend')}</Text>
      <AppCard padding={18}>
        <LineChart
          data={data}
          width={chartWidth}
          height={HEIGHT}
          color={colors.primary}
          thickness={3}
          startFillColor={colors.primary}
          endFillColor={colors.surface}
          startOpacity={START_OPACITY}
          endOpacity={0}
          areaChart
          dataPointsColor={colors.primary}
          dataPointsRadius={DATA_POINT_RADIUS}
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisLabelWidth={Y_AXIS_LABEL_WIDTH}
          yAxisTextStyle={{ color: colors.textTertiary, fontSize: 10 }}
          formatYLabel={(v: string) => formatCompactNumber(Number(v))}
          rulesType="solid"
          rulesColor={colors.divider}
          noOfSections={SECTIONS}
          initialSpacing={INITIAL_SPACING}
          endSpacing={END_SPACING}
          isAnimated
          animationDuration={ANIMATION_DURATION_MS}
        />
      </AppCard>
    </View>
  );
};
