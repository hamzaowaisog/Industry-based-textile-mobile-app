import React from 'react';

import { Text, View } from 'react-native';

import { AppAmount } from '@components/common/AppAmount';
import { AppCard } from '@components/common/AppCard';
import { AppIconTile } from '@components/common/AppIconTile';

import { getExpenseCategoryColor } from '@utils/helpers/expenseContent';

import { ReceiptIcon } from '@constants/svgAssets';

import type { ExpenseRowCardProps } from '../../../../types/expenses.types';
import { styles } from './styles';

export const ExpenseRowCard = React.memo(({ expense, onPress }: ExpenseRowCardProps) => {
  const tileColor = getExpenseCategoryColor(expense.expenseTypeId);
  const notes = expense.notes?.trim();
  const secondary = notes
    ? `${notes} · ${expense.transModeName} · ${expense.expenseDate}`
    : `${expense.transModeName} · ${expense.expenseDate}`;

  return (
    <AppCard onPress={() => onPress(expense.id)} padding={14}>
      <View style={styles.row}>
        <AppIconTile Icon={ReceiptIcon} color={tileColor} size={40} />
        <View style={styles.info}>
          <Text style={styles.primary} numberOfLines={1}>
            {expense.expenseTypeName}
          </Text>
          <Text style={styles.secondary} numberOfLines={1}>
            {secondary}
          </Text>
        </View>
        <AppAmount value={expense.amount} tone="debit" size={15} />
      </View>
    </AppCard>
  );
});
