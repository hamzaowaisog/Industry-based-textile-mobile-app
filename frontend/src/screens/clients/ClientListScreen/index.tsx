import React from 'react';

import { ClientListComponent } from '@components/clients/ClientListComponent';
import { useClientList } from '@hooks/useClientList';

export const ClientListScreen = () => {
  const props = useClientList();
  return <ClientListComponent {...props} clients={props.rows} />;
};
