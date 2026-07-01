import React from 'react';

import { PaymentListComponent } from '@components/payments/PaymentListComponent';

import { usePaymentList } from '@hooks/usePaymentList';

const PaymentListScreen = () => {
  const props = usePaymentList();
  return <PaymentListComponent {...props} />;
};

export default PaymentListScreen;
