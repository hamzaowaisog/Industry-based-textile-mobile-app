import React from 'react';

import { useNavigation } from '@react-navigation/native';

import { DashboardComponent } from '@components/dashboard';
import { useDashboard } from '@hooks/useDashboard';

export const DashboardScreen = () => {
  const navigation = useNavigation();
  const hookValues = useDashboard(navigation);

  return <DashboardComponent {...hookValues} />;
};
