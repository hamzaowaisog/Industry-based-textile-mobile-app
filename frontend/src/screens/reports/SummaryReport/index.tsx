import React from 'react';

import { SummaryReportComponent } from '@components/reports/SummaryReportComponent';

import { useSummaryReport } from '@hooks/useSummaryReport';

const SummaryReportScreen = () => {
  const handlers = useSummaryReport();

  return <SummaryReportComponent {...handlers} />;
};

export default SummaryReportScreen;
