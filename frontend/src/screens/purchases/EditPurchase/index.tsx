import React from 'react';

import { EditPurchaseComponent } from '@components/purchases/EditPurchaseComponent';

import { useEditPurchase } from '@hooks/useEditPurchase';

import type { EditPurchaseScreenProps } from '../../../types/navigation.types';

const EditPurchaseScreen = ({ route }: EditPurchaseScreenProps) => {
  const { purchaseId } = route.params;
  const handlers = useEditPurchase(purchaseId);

  return <EditPurchaseComponent {...handlers} />;
};

export default EditPurchaseScreen;
