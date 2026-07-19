import React from 'react';

import { ProfitLossReportComponent } from '@components/reports/ProfitLossReportComponent';

import { useProfitLossReport } from '@hooks/useProfitLossReport';

const ProfitLossScreen = () => {
  const handlers = useProfitLossReport();

  return <ProfitLossReportComponent {...handlers} />;
};

export default ProfitLossScreen;
