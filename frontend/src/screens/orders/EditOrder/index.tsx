import React from 'react';

import { EditOrderComponent } from '@components/orders/EditOrderComponent';

import { useEditOrder } from '@hooks/useEditOrder';

import type { EditOrderScreenProps } from '../../../types/navigation.types';

const EditOrderScreen = ({ route }: EditOrderScreenProps) => {
  const { orderId } = route.params;
  const handlers = useEditOrder(orderId);

  return <EditOrderComponent {...handlers} />;
};

export default EditOrderScreen;
