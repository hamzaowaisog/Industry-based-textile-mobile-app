import React from 'react';

import { Text, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { AppCard } from '@components/common/AppCard';
import { AppDonutChart } from '@components/common/AppDonutChart';

import { formatAmount } from '@utils/helpers/formatCurrency';
import { getExpenseCategoryColor } from '@utils/helpers/expenseContent';

import { AppConstants } from '@constants/appConstants';

import type { ExpenseBreakdownCardProps } from '../../../../types/reports.types';
import { styles } from './styles';

export const ExpenseBreakdownCard = ({ categories }: ExpenseBreakdownCardProps) => {
  const { t } = useTranslation();

  return (
    <View>
      <Text style={styles.sectionTitle}>{t('reports.summary.expenseBreakdown')}</Text>
      <AppCard padding={18}>
        {categories.length === 0 ? (
          <Text style={styles.emptyText}>{t('reports.summary.noExpenses')}</Text>
        ) : (
          <View style={styles.topRow}>
            <AppDonutChart
              slices={categories.map((c) => ({
                value: c.amount,
                color: getExpenseCategoryColor(c.expenseTypeId),
              }))}
              size={AppConstants.DONUT.SIZE}
            />
            <View style={styles.legendWrap}>
              {categories.map((c) => (
                <View key={c.expenseTypeId} style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: getExpenseCategoryColor(c.expenseTypeId) }]}
                  />
                  <Text style={styles.legendText} numberOfLines={1}>
                    {c.name}
                  </Text>
                  <Text style={styles.legendValue}>{formatAmount(c.amount)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </AppCard>
    </View>
  );
};
