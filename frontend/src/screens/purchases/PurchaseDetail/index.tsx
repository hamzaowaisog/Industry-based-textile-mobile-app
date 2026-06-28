import React, { useCallback } from 'react';

import { useFocusEffect, useRoute } from '@react-navigation/native';

import { PurchaseDetailComponent } from '@components/purchases/PurchaseDetailComponent';

import { usePurchaseDetail } from '@hooks/usePurchaseDetail';

import type { PurchaseDetailScreenProps } from '../../../types/navigation.types';

const PurchaseDetailScreen = () => {
  const route = useRoute<PurchaseDetailScreenProps['route']>();
  const { purchaseId } = route.params;
  const handlers = usePurchaseDetail(purchaseId);

  useFocusEffect(
    useCallback(() => {
      handlers.load();
    }, [purchaseId]),
  );

  return <PurchaseDetailComponent {...handlers} />;
};

export default PurchaseDetailScreen;
