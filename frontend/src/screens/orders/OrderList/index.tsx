import React from 'react';

import { OrderListComponent } from '@components/orders/OrderListComponent';

import { useOrderList } from '@hooks/useOrderList';

const OrderListScreen = () => {
  const props = useOrderList();
  return <OrderListComponent {...props} />;
};

export default OrderListScreen;
