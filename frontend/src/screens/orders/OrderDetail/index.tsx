import React, { useCallback } from 'react';

import { useFocusEffect, useRoute } from '@react-navigation/native';

import { OrderDetailComponent } from '@components/orders/OrderDetailComponent';

import { useOrderDetail } from '@hooks/useOrderDetail';

import type { OrderDetailScreenProps } from '../../../types/navigation.types';

const OrderDetailScreen = () => {
  const route = useRoute<OrderDetailScreenProps['route']>();
  const { orderId } = route.params;
  const handlers = useOrderDetail(orderId);

  useFocusEffect(
    useCallback(() => {
      handlers.load();
    }, [orderId]),
  );

  return <OrderDetailComponent {...handlers} />;
};

export default OrderDetailScreen;
