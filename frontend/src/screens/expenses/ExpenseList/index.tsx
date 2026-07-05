import React from 'react';

import { ExpenseListComponent } from '@components/expenses/ExpenseListComponent';

import { useExpenseList } from '@hooks/useExpenseList';

const ExpenseListScreen = () => {
  const props = useExpenseList();
  return <ExpenseListComponent {...props} />;
};

export default ExpenseListScreen;
