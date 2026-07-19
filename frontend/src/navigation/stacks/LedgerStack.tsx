import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TransactionDetailScreen from '@screens/transactions/TransactionDetail';
import TransactionListScreen from '@screens/transactions/TransactionList';

import { AppConstants } from '@constants/appConstants';

import { LedgerStackParamList } from '../../types/navigation.types';

const Stack = createNativeStackNavigator<LedgerStackParamList>();
const S = AppConstants.SCREENS.MAIN;

export const LedgerStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={S.TRANSACTION_LIST} component={TransactionListScreen} />
    <Stack.Screen name={S.TRANSACTION_DETAIL} component={TransactionDetailScreen} />
  </Stack.Navigator>
);
