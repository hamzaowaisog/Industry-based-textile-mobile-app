import React from 'react';

import { AddExpenseComponent } from '@components/expenses/AddExpenseComponent';

import { useAddExpense } from '@hooks/useAddExpense';

const AddExpenseScreen = () => {
  const props = useAddExpense();
  return <AddExpenseComponent {...props} />;
};

export default AddExpenseScreen;
