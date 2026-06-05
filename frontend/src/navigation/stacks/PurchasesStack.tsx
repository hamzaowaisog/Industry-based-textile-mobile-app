import React from 'react';

import { View } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AppConstants } from '@constants/appConstants';

import { PurchaseStackParamList } from '../../types/navigation.types';
import { placeholderStyles } from './placeholderStyles';

const Stack = createNativeStackNavigator<PurchaseStackParamList>();
const S = AppConstants.SCREENS.MAIN;

const Placeholder = () => <View style={placeholderStyles.container} />;

export const PurchasesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={S.PURCHASE_LIST} component={Placeholder} />
    <Stack.Screen name={S.PURCHASE_DETAIL} component={Placeholder} />
    <Stack.Screen name={S.CREATE_PURCHASE} component={Placeholder} />
  </Stack.Navigator>
);
