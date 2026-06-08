import React from 'react';

import { ClientDetailComponent } from '@components/clients/ClientDetailComponent';
import { useClientDetail } from '@hooks/useClientDetail';

export const ClientDetailScreen = () => {
  const props = useClientDetail();
  return <ClientDetailComponent {...props} />;
};
