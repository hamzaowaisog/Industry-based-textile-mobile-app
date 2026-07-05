import { DrawerContentComponentProps, DrawerNavigationProp } from '@react-navigation/drawer';

import { DrawerComponent } from '@components/drawer';

import { useDrawer } from '@hooks/useDrawer';

import { AppConstants } from '@constants/appConstants';

import { MainDrawerParamList } from '@types/navigation.types';

const S = AppConstants.SCREENS.MAIN;

/** Drawer stacks always open on their list/root screen so detail state is not restored later. */
const DRAWER_STACK_LIST_SCREEN: Partial<Record<string, string>> = {
  [S.CLIENTS_STACK]: S.CLIENT_LIST,
  [S.ORDERS_STACK]: S.ORDER_LIST,
  [S.PRODUCTS_STACK]: S.PRODUCT_LIST,
  [S.PURCHASES_STACK]: S.PURCHASE_LIST,
  [S.PAYMENTS_STACK]: S.PAYMENT_LIST,
  [S.INVOICES_STACK]: S.INVOICE_LIST,
  [S.EXPENSES_STACK]: S.EXPENSE_LIST,
  [S.STOCK_STACK]: S.STOCK_MOVE_LIST,
  [S.LEDGER_STACK]: S.TRANSACTION_LIST,
  [S.REPORTS_STACK]: S.REPORTS_HUB,
  [S.USERS_STACK]: S.USER_LIST,
};

export const DrawerContent = ({ state, navigation }: DrawerContentComponentProps) => {
  const { userName, roleId, onSignOut } = useDrawer();
  const drawerNav = navigation as DrawerNavigationProp<MainDrawerParamList>;

  const activeRoute = state.routes[state.index]?.name ?? '';

  const handleNav = (routeId: string) => {
    const listScreen = DRAWER_STACK_LIST_SCREEN[routeId];
    if (listScreen) {
      drawerNav.navigate(routeId, { screen: listScreen });
    } else {
      drawerNav.navigate(routeId as keyof MainDrawerParamList);
    }
  };
  const handleSettings = () => {
    navigation.navigate(AppConstants.SCREENS.MAIN.SETTINGS);
  };
  const handleSignOut = async () => {
    navigation.closeDrawer();
    await onSignOut();
  };

  return (
    <DrawerComponent
      activeRoute={activeRoute}
      userName={userName}
      roleId={roleId}
      onNavigate={handleNav}
      onSettings={handleSettings}
      onSignOut={handleSignOut}
    />
  );
};
