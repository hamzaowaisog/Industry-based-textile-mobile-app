import React from 'react';

import { useRoute } from '@react-navigation/native';

import { CreateOrderComponent } from '@components/orders/CreateOrderComponent';

import { useCreateOrder } from '@hooks/useCreateOrder';

import type { CreateOrderScreenProps } from '../../../types/navigation.types';

const CreateOrderScreen = () => {
  const route = useRoute<CreateOrderScreenProps['route']>();
  const params = route.params;
  const handlers = useCreateOrder(params?.clientId, params?.clientName);

  return <CreateOrderComponent {...handlers} />;
};

export default CreateOrderScreen;
