import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';

import { DashboardComponent } from '@components/dashboard';

import { useDashboard } from '@hooks/useDashboard';

import { MainDrawerParamList } from '../../types/navigation.types';

export const DashboardScreen = () => {
  const navigation = useNavigation<DrawerNavigationProp<MainDrawerParamList>>();
  const hookValues = useDashboard();

  return <DashboardComponent {...hookValues} onOpenDrawer={() => navigation.openDrawer()} />;
};
