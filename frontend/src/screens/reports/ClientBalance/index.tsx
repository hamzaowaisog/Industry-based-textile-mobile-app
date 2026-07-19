import React from 'react';

import { ClientBalanceReportComponent } from '@components/reports/ClientBalanceReportComponent';

import { useClientBalanceReport } from '@hooks/useClientBalanceReport';

const ClientBalanceScreen = () => {
  const handlers = useClientBalanceReport();

  return <ClientBalanceReportComponent {...handlers} />;
};

export default ClientBalanceScreen;
