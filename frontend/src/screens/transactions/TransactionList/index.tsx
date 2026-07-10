import React from 'react';

import { TransactionListComponent } from '@components/transactions/TransactionListComponent';

import { useTransactionList } from '@hooks/useTransactionList';

const TransactionListScreen = () => {
  const handlers = useTransactionList();

  return <TransactionListComponent {...handlers} />;
};

export default TransactionListScreen;
