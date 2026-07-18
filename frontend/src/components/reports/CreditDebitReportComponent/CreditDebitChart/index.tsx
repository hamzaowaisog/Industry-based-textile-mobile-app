import React from 'react';

import { View, useWindowDimensions } from 'react-native';

import { LineChart } from 'react-native-gifted-charts';

import { formatCompactNumber } from '@utils/helpers/formatNumber';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';

import type { CreditDebitChartProps } from '../../../../types/reports.types';

export const CreditDebitChart = ({ rows }: CreditDebitChartProps) => {
  const { width } = useWindowDimensions();
  const chartWidth = width - 48 - 36 - AppConstants.CHART.Y_AXIS_LABEL_WIDTH;

  const creditData = rows.map((r) => ({
    value: r.totalCredit,
    label: r.month,
    labelTextStyle: { fontSize: 10, color: colors.textSecondary },
  }));
  const debitData = rows.map((r) => ({ value: r.totalDebit }));

  return (
    <View>
      <LineChart
        data={creditData}
        data2={debitData}
        width={chartWidth}
        height={AppConstants.CHART.HEIGHT}
        color={colors.success}
        color2={colors.danger}
        thickness={3}
        thickness2={3}
        dataPointsColor={colors.success}
        dataPointsColor2={colors.danger}
        dataPointsRadius={AppConstants.CHART.DATA_POINT_RADIUS}
        xAxisThickness={0}
        yAxisThickness={0}
        yAxisLabelWidth={AppConstants.CHART.Y_AXIS_LABEL_WIDTH}
        yAxisTextStyle={{ color: colors.textTertiary, fontSize: 10 }}
        formatYLabel={(v: string) => formatCompactNumber(Number(v))}
        rulesType="solid"
        rulesColor={colors.divider}
        noOfSections={AppConstants.CHART.SECTIONS}
        initialSpacing={AppConstants.CHART.INITIAL_SPACING}
        endSpacing={AppConstants.CHART.END_SPACING}
        isAnimated
        animationDuration={AppConstants.CHART.ANIMATION_DURATION_MS}
      />
    </View>
  );
};
