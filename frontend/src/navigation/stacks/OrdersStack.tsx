import React from 'react';

import { View } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AppConstants } from '@constants/appConstants';

import { OrderStackParamList } from '../../types/navigation.types';
import { placeholderStyles } from './placeholderStyles';

const Stack = createNativeStackNavigator<OrderStackParamList>();
const S = AppConstants.SCREENS.MAIN;

const Placeholder = () => <View style={placeholderStyles.container} />;

export const OrdersStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={S.ORDER_LIST} component={Placeholder} />
    <Stack.Screen name={S.ORDER_DETAIL} component={Placeholder} />
    <Stack.Screen name={S.CREATE_ORDER} component={Placeholder} />
  </Stack.Navigator>
);
