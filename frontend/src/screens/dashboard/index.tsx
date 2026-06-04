import { DashboardComponent } from '@components/dashboard';

import { useDashboard } from '@hooks/useDashboard';

export const DashboardScreen = () => {
  const hookValues = useDashboard();

  return <DashboardComponent {...hookValues} />;
};
