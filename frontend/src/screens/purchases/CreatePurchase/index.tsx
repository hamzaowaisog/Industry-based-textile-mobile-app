import React from 'react';

import { useRoute } from '@react-navigation/native';

import { CreatePurchaseComponent } from '@components/purchases/CreatePurchaseComponent';

import { useCreatePurchase } from '@hooks/useCreatePurchase';

import type { CreatePurchaseScreenProps } from '../../../types/navigation.types';

const CreatePurchaseScreen = () => {
  const route = useRoute<CreatePurchaseScreenProps['route']>();
  const params = route.params;
  const handlers = useCreatePurchase(params?.supplierId, params?.supplierName);

  return <CreatePurchaseComponent {...handlers} />;
};

export default CreatePurchaseScreen;
