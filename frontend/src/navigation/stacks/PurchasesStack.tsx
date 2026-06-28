import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CreatePurchaseScreen from '@screens/purchases/CreatePurchase';
import EditPurchaseScreen from '@screens/purchases/EditPurchase';
import PurchaseDetailScreen from '@screens/purchases/PurchaseDetail';
import PurchaseListScreen from '@screens/purchases/PurchaseList';

import { AppConstants } from '@constants/appConstants';

import { PurchaseStackParamList } from '../../types/navigation.types';

const Stack = createNativeStackNavigator<PurchaseStackParamList>();
const S = AppConstants.SCREENS.MAIN;

export const PurchasesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={S.PURCHASE_LIST} component={PurchaseListScreen} />
    <Stack.Screen name={S.PURCHASE_DETAIL} component={PurchaseDetailScreen} />
    <Stack.Screen name={S.CREATE_PURCHASE} component={CreatePurchaseScreen} />
    <Stack.Screen name={S.EDIT_PURCHASE} component={EditPurchaseScreen} />
  </Stack.Navigator>
);
