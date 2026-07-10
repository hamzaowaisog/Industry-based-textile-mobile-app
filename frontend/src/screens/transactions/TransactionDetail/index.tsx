import React from 'react';

import { useRoute } from '@react-navigation/native';

import { TransactionDetailComponent } from '@components/transactions/TransactionDetailComponent';

import { useTransactionDetail } from '@hooks/useTransactionDetail';

import type { TransactionDetailScreenProps } from '../../../types/navigation.types';

const TransactionDetailScreen = () => {
  const route = useRoute<TransactionDetailScreenProps['route']>();
  const { transactionId } = route.params;
  const handlers = useTransactionDetail(transactionId);

  return <TransactionDetailComponent {...handlers} />;
};

export default TransactionDetailScreen;
