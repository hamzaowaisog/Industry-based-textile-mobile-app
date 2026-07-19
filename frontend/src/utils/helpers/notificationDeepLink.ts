import { navigationRef } from '@navigation/navigationRef';

import { AppConstants } from '@constants/appConstants';

const S = AppConstants.SCREENS.MAIN;

export const handleDeepLink = (type: string, entityId?: number): void => {
  if (!navigationRef.isReady()) return;

  const navigateToDrawer = (screen: string) => {
    navigationRef.navigate('DrawerRoot', { screen } as any);
  };

  if (type.startsWith('order_')) {
    navigateToDrawer(S.ORDERS_STACK);
  } else if (type.startsWith('purchase_')) {
    navigateToDrawer(S.PURCHASES_STACK);
  } else if (type.startsWith('payment_')) {
    navigateToDrawer(S.PAYMENTS_STACK);
  } else if (type.startsWith('invoice_')) {
    navigateToDrawer(S.INVOICES_STACK);
  } else if (type.startsWith('expense_')) {
    navigateToDrawer(S.EXPENSES_STACK);
  } else if (type === 'low_stock') {
    navigateToDrawer(S.PRODUCTS_STACK);
  } else if (type.startsWith('stock_movement_')) {
    navigateToDrawer(S.STOCK_STACK);
  } else if (type.startsWith('client_')) {
    navigateToDrawer(S.CLIENTS_STACK);
  }
};
