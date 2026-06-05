import React from 'react';
import { View } from 'react-native';

import { createDrawerNavigator } from '@react-navigation/drawer';

import { AppConstants } from '@constants/appConstants';
import { DashboardScreen } from '@screens/dashboard';
import { useAuthStore } from '@stores/authStore';
import { colors } from '@theme/colors';
import { MainDrawerParamList } from '@types/navigation.types';

import { DrawerContent } from './DrawerContent';
import { ClientsStack } from './stacks/ClientsStack';
import { ExpensesStack } from './stacks/ExpensesStack';
import { InvoicesStack } from './stacks/InvoicesStack';
import { LedgerStack } from './stacks/LedgerStack';
import { OrdersStack } from './stacks/OrdersStack';
import { PaymentsStack } from './stacks/PaymentsStack';
import { ProductsStack } from './stacks/ProductsStack';
import { PurchasesStack } from './stacks/PurchasesStack';
import { ReportsStack } from './stacks/ReportsStack';
import { StockStack } from './stacks/StockStack';
import { UsersStack } from './stacks/UsersStack';

const Drawer = createDrawerNavigator<MainDrawerParamList>();
const S = AppConstants.SCREENS.MAIN;

const SettingsPlaceholder = () => <View style={{ flex: 1, backgroundColor: colors.background }} />;

export const MainNavigator = () => {
  const roleId = useAuthStore((s) => s.roleId);
  const isAdmin = roleId === AppConstants.ROLES.ADMIN;

  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: { width: 296 },
        overlayColor: 'rgba(15,23,42,0.44)',
        swipeEnabled: false,
      }}
    >
      <Drawer.Screen name={S.DASHBOARD} component={DashboardScreen} />
      <Drawer.Screen name={S.CLIENTS_STACK} component={ClientsStack} />
      <Drawer.Screen name={S.ORDERS_STACK} component={OrdersStack} />
      <Drawer.Screen name={S.PRODUCTS_STACK} component={ProductsStack} />
      <Drawer.Screen name={S.PURCHASES_STACK} component={PurchasesStack} />
      <Drawer.Screen name={S.PAYMENTS_STACK} component={PaymentsStack} />
      <Drawer.Screen name={S.INVOICES_STACK} component={InvoicesStack} />
      <Drawer.Screen name={S.EXPENSES_STACK} component={ExpensesStack} />
      <Drawer.Screen name={S.STOCK_STACK} component={StockStack} />
      <Drawer.Screen name={S.LEDGER_STACK} component={LedgerStack} />
      {isAdmin && <Drawer.Screen name={S.REPORTS_STACK} component={ReportsStack} />}
      {isAdmin && <Drawer.Screen name={S.USERS_STACK} component={UsersStack} />}
      <Drawer.Screen name={S.SETTINGS} component={SettingsPlaceholder} />
    </Drawer.Navigator>
  );
};
