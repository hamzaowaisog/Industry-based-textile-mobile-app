import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CreateOrderScreen from '@screens/orders/CreateOrder';
import OrderDetailScreen from '@screens/orders/OrderDetail';
import OrderListScreen from '@screens/orders/OrderList';

import { AppConstants } from '@constants/appConstants';

import { OrderStackParamList } from '../../types/navigation.types';

const Stack = createNativeStackNavigator<OrderStackParamList>();
const S = AppConstants.SCREENS.MAIN;

export const OrdersStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={S.ORDER_LIST} component={OrderListScreen} />
    <Stack.Screen name={S.ORDER_DETAIL} component={OrderDetailScreen} />
    <Stack.Screen name={S.CREATE_ORDER} component={CreateOrderScreen} />
  </Stack.Navigator>
);
