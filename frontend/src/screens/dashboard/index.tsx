import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';

import { DashboardComponent } from '@components/dashboard';

import { useDashboard } from '@hooks/useDashboard';

import { AppConstants } from '@constants/appConstants';

import { MainDrawerParamList } from '../../types/navigation.types';

export const DashboardScreen = () => {
  const navigation = useNavigation<DrawerNavigationProp<MainDrawerParamList>>();
  const dash = useDashboard();
  const S = AppConstants.SCREENS.MAIN;

  return (
    <DashboardComponent
      isLoading={dash.isLoading}
      summary={dash.summary}
      monthlyOverview={dash.monthlyOverview}
      userName={dash.userName}
      onOpenDrawer={() => navigation.openDrawer()}
      onNewOrder={() => (navigation as any).navigate(S.ORDERS_STACK)}
      onViewAllOrders={() => (navigation as any).navigate(S.ORDERS_STACK)}
      unreadCount={dash.unreadCount}
      onBell={dash.onBell}
      onSeeAll={dash.onSeeAll}
    />
  );
};
