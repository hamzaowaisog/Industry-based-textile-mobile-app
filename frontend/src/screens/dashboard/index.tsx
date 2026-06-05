import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';

import { DashboardComponent } from '@components/dashboard';
import { SyncBottomSheet } from '@components/sync/SyncBottomSheet';
import { AppConstants } from '@constants/appConstants';
import { useDashboard } from '@hooks/useDashboard';
import { MainDrawerParamList } from '@types/navigation.types';

export const DashboardScreen = () => {
  const navigation = useNavigation<DrawerNavigationProp<MainDrawerParamList>>();
  const dash = useDashboard();
  const S = AppConstants.SCREENS.MAIN;

  return (
    <>
      <DashboardComponent
        isOnline={dash.isOnline}
        isLoading={dash.isLoading}
        isSyncing={dash.isSyncing}
        summary={dash.summary}
        monthlyOverview={dash.monthlyOverview}
        userName={dash.userName}
        onSync={dash.onSync}
        onOpenDrawer={() => navigation.openDrawer()}
        onNewOrder={() => (navigation as any).navigate(S.ORDERS_STACK)}
        onViewAllOrders={() => (navigation as any).navigate(S.ORDERS_STACK)}
      />
      <SyncBottomSheet
        ref={dash.syncSheetRef}
        isSyncing={dash.isSyncing}
        syncPhase={dash.syncPhase}
        pendingCount={dash.pendingCount}
        pendingChanges={dash.pendingChanges}
        lastSyncedAt={dash.lastSyncedAt}
      />
    </>
  );
};
