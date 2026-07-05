import React from 'react';

import { useRoute } from '@react-navigation/native';

import { RecordPaymentComponent } from '@components/payments/RecordPaymentComponent';

import { useRecordPayment } from '@hooks/useRecordPayment';

import type { RecordPaymentScreenProps } from '../../../types/navigation.types';

const RecordPaymentScreen = () => {
  const route = useRoute<RecordPaymentScreenProps['route']>();
  const params = route.params;
  const handlers = useRecordPayment(
    params?.clientId,
    params?.clientName,
    params?.orderId,
    params?.purchaseId,
  );

  return <RecordPaymentComponent {...handlers} />;
};

export default RecordPaymentScreen;
