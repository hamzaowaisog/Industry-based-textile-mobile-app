import React, { useCallback } from 'react';

import { useFocusEffect, useRoute } from '@react-navigation/native';

import { PaymentDetailComponent } from '@components/payments/PaymentDetailComponent';

import { usePaymentDetail } from '@hooks/usePaymentDetail';

import type { PaymentDetailScreenProps } from '../../../types/navigation.types';

const PaymentDetailScreen = () => {
  const route = useRoute<PaymentDetailScreenProps['route']>();
  const { paymentId } = route.params;
  const handlers = usePaymentDetail(paymentId);

  useFocusEffect(
    useCallback(() => {
      handlers.load();
    }, [paymentId]),
  );

  return <PaymentDetailComponent {...handlers} />;
};

export default PaymentDetailScreen;
