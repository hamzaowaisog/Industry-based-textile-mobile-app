import React from 'react';

import { Text, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { AppCard } from '@components/common/AppCard';

import type { TrendsListProps } from '../../../../types/reports.types';
import { styles } from './styles';

export const TrendsList = ({ trends }: TrendsListProps) => {
  const { t } = useTranslation();

  return (
    <View>
      <Text style={styles.sectionTitle}>{t('reports.summary.trendsTitle')}</Text>
      <AppCard padding={0}>
        {trends.map((row, index) => (
          <View key={row.key} style={[styles.row, index === trends.length - 1 && styles.rowLast]}>
            <Text style={styles.label}>{t(row.labelKey)}</Text>
            <Text style={row.positive ? styles.valuePositive : styles.valueNegative}>
              {row.value}
            </Text>
          </View>
        ))}
      </AppCard>
    </View>
  );
};
