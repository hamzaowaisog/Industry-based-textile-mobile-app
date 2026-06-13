import React, { useEffect } from 'react';

import { useRoute } from '@react-navigation/native';

import { OrderDetailComponent } from '@components/orders/OrderDetailComponent';

import { useOrderDetail } from '@hooks/useOrderDetail';

import type { OrderDetailScreenProps } from '../../../types/navigation.types';

const OrderDetailScreen = () => {
  const route = useRoute<OrderDetailScreenProps['route']>();
  const { orderId } = route.params;
  const handlers = useOrderDetail(orderId);

  useEffect(() => {
    handlers.load();
  }, [orderId]);

  return <OrderDetailComponent {...handlers} />;
};

export default OrderDetailScreen;
