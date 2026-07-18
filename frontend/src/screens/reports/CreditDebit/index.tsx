import React from 'react';

import { CreditDebitReportComponent } from '@components/reports/CreditDebitReportComponent';

import { useCreditDebitReport } from '@hooks/useCreditDebitReport';

const CreditDebitScreen = () => {
  const handlers = useCreditDebitReport();

  return <CreditDebitReportComponent {...handlers} />;
};

export default CreditDebitScreen;
