import React, { useCallback } from 'react';

import { useFocusEffect, useRoute } from '@react-navigation/native';

import { ExpenseDetailComponent } from '@components/expenses/ExpenseDetailComponent';

import { useExpenseDetail } from '@hooks/useExpenseDetail';

import type { ExpenseDetailScreenProps } from '../../../types/navigation.types';

const ExpenseDetailScreen = () => {
  const route = useRoute<ExpenseDetailScreenProps['route']>();
  const { expenseId } = route.params;
  const handlers = useExpenseDetail(expenseId);

  useFocusEffect(
    useCallback(() => {
      handlers.load();
    }, [expenseId]),
  );

  return <ExpenseDetailComponent {...handlers} />;
};

export default ExpenseDetailScreen;
