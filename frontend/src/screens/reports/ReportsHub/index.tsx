import React from 'react';

import { ReportsHubComponent } from '@components/reports/ReportsHubComponent';

import { useReportsHub } from '@hooks/useReportsHub';

const ReportsHubScreen = () => {
  const handlers = useReportsHub();

  return <ReportsHubComponent {...handlers} />;
};

export default ReportsHubScreen;
