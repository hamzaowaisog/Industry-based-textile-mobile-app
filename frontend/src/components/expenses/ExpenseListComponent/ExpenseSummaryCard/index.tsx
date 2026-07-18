import React from 'react';

import { Text, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { AppCard } from '@components/common/AppCard';
import { AppDonutChart } from '@components/common/AppDonutChart';

import { formatAmount, formatPKR } from '@utils/helpers/formatCurrency';
import { getExpenseCategoryColor } from '@utils/helpers/expenseContent';

import { AppConstants } from '@constants/appConstants';

import type { ExpenseSummaryCardProps } from '../../../../types/expenses.types';
import { styles } from './styles';

export const ExpenseSummaryCard = ({ summary, loading }: ExpenseSummaryCardProps) => {
  const { t } = useTranslation();

  if (loading || !summary) return null;

  const slices = summary.categories.map((c) => ({
    value: c.amount,
    color: getExpenseCategoryColor(c.expenseTypeId),
  }));

  return (
    <View style={styles.wrap}>
      <AppCard padding={18}>
        <View style={styles.topRow}>
          <AppDonutChart slices={slices} size={AppConstants.DONUT.SIZE} />
          <View style={styles.info}>
            <Text style={styles.label}>{t('expenses.thisMonth').toUpperCase()}</Text>
            <Text style={styles.total}>{formatPKR(summary.total)}</Text>
            <Text style={styles.meta}>
              {t('expenses.summaryMeta', {
                entries: summary.entryCount,
                categories: summary.categories.length,
              })}
            </Text>
          </View>
        </View>
        {summary.categories.length > 0 && (
          <View style={styles.legendWrap}>
            {summary.categories.map((c) => (
              <View key={c.expenseTypeId} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: getExpenseCategoryColor(c.expenseTypeId) },
                  ]}
                />
                <Text style={styles.legendText} numberOfLines={1}>
                  {`${c.name} · ${formatAmount(c.amount)}`}
                </Text>
              </View>
            ))}
          </View>
        )}
      </AppCard>
    </View>
  );
};
