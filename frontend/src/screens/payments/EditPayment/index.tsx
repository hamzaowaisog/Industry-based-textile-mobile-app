import React from 'react';

import { useRoute } from '@react-navigation/native';

import { EditPaymentComponent } from '@components/payments/EditPaymentComponent';

import { useEditPayment } from '@hooks/useEditPayment';

import type { EditPaymentScreenProps } from '../../../types/navigation.types';

const EditPaymentScreen = () => {
  const route = useRoute<EditPaymentScreenProps['route']>();
  const { paymentId } = route.params;
  const handlers = useEditPayment(paymentId);

  return <EditPaymentComponent {...handlers} />;
};

export default EditPaymentScreen;
