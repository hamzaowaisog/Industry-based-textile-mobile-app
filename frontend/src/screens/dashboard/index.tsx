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
      calendar={dash.calendar}
      onCalendarChange={dash.onCalendarChange}
      userName={dash.userName}
      onOpenDrawer={() => navigation.openDrawer()}
      onNewOrder={() => (navigation as any).navigate(S.ORDERS_STACK)}
      onViewAllOrders={() => (navigation as any).navigate(S.ORDERS_STACK)}
      onViewAllPurchases={() => (navigation as any).navigate(S.PURCHASES_STACK)}
      unreadCount={dash.unreadCount}
      onBell={dash.onBell}
      onSeeAll={dash.onSeeAll}
    />
  );
};
