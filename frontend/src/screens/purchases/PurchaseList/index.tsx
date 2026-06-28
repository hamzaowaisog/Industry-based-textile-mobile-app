import React from 'react';

import { PurchaseListComponent } from '@components/purchases/PurchaseListComponent';

import { usePurchaseList } from '@hooks/usePurchaseList';

const PurchaseListScreen = () => {
  const props = usePurchaseList();
  return <PurchaseListComponent {...props} />;
};

export default PurchaseListScreen;
