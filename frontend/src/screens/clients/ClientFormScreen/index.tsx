import React from 'react';

import { ClientFormComponent } from '@components/clients/ClientFormComponent';
import { useClientForm } from '@hooks/useClientForm';

export const ClientFormScreen = () => {
  const hookResult = useClientForm();
  return <ClientFormComponent {...hookResult} />;
};
