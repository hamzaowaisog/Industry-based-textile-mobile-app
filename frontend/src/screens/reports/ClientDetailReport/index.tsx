import React from 'react';

import { useRoute } from '@react-navigation/native';

import { ClientDetailReportComponent } from '@components/reports/ClientDetailReportComponent';

import { useClientDetailReport } from '@hooks/useClientDetailReport';

import type { ClientDetailReportScreenProps } from '../../../types/navigation.types';

const ClientDetailReportScreen = () => {
  const route = useRoute<ClientDetailReportScreenProps['route']>();
  const handlers = useClientDetailReport(route.params?.clientId);

  return <ClientDetailReportComponent {...handlers} />;
};

export default ClientDetailReportScreen;
