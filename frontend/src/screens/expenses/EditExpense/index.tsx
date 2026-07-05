import React from 'react';

import { EditExpenseComponent } from '@components/expenses/EditExpenseComponent';

import { useEditExpense } from '@hooks/useEditExpense';

const EditExpenseScreen = () => {
  const props = useEditExpense();
  return <EditExpenseComponent {...props} />;
};

export default EditExpenseScreen;
