import React, { useMemo } from 'react';

import { Text, View, useWindowDimensions } from 'react-native';

import { useTranslation } from 'react-i18next';
import { LineChart } from 'react-native-gifted-charts';

import { formatCompactNumber } from '@utils/helpers/formatNumber';

import { colors } from '@theme/colors';

import type { StockChartProps } from '../../../../types/products.types';
import { styles } from './styles';

const Y_AXIS_LABEL_WIDTH = 40;

export const StockChart = ({ currentStock, unit, chartData, trendPct }: StockChartProps) => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const chartWidth = width - 48 - 32 - Y_AXIS_LABEL_WIDTH;

  const lineData = useMemo(() => chartData.map((v) => ({ value: v })), [chartData]);

  const maxValue = useMemo(() => {
    const peak = Math.max(...chartData, 0);
    if (peak === 0) return 4;
    const min = Math.min(...chartData);
    return peak === min ? Math.ceil(peak * 1.25) || 4 : Math.ceil(peak * 1.12);
  }, [chartData]);

  const trendPositive = trendPct !== null && trendPct >= 0;
  const trendColor = trendPositive ? colors.success : colors.danger;
  const trendBg = trendPositive ? colors.successLight : colors.dangerLight;
  const trendSign = trendPositive ? '+' : '';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.stockValue}>
            {currentStock.toLocaleString()} <Text style={styles.unitLabel}>{unit}</Text>
          </Text>
          <Text style={styles.subLabel}>{t('products.detail.allTimeMovements')}</Text>
        </View>
        {trendPct !== null && (
          <View style={styles.trendWrap}>
            <View style={[styles.trendBadge, { backgroundColor: trendBg }]}>
              <Text style={[styles.trendText, { color: trendColor }]}>
                {`${trendSign}${trendPct.toFixed(1)}%`}
              </Text>
            </View>
            <Text style={styles.trendCaption}>{t('products.detail.trendVsOpening')}</Text>
          </View>
        )}
      </View>

      {lineData.length >= 1 ? (
        <View style={styles.chartWrap}>
          <LineChart
            data={lineData}
            width={chartWidth}
            height={120}
            maxValue={maxValue}
            color={colors.primary}
            thickness={3}
            startFillColor={colors.primary}
            endFillColor={colors.surface}
            startOpacity={0.28}
            endOpacity={0}
            areaChart
            hideDataPoints={false}
            dataPointsColor={colors.primary}
            dataPointsRadius={4}
            xAxisThickness={0}
            yAxisThickness={0}
            yAxisLabelWidth={Y_AXIS_LABEL_WIDTH}
            yAxisTextStyle={styles.yAxisText}
            formatYLabel={(v: string) => formatCompactNumber(Number(v))}
            rulesType="solid"
            rulesColor={colors.divider}
            noOfSections={5}
            initialSpacing={8}
            endSpacing={8}
            isAnimated
            animationDuration={600}
          />
        </View>
      ) : (
        <View style={styles.noDataWrap}>
          <Text style={styles.noData}>{t('products.detail.noMovements')}</Text>
        </View>
      )}
    </View>
  );
};
