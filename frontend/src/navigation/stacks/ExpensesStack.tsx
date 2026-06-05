import React from 'react';

import { View } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AppConstants } from '@constants/appConstants';

import { ExpenseStackParamList } from '../../types/navigation.types';
import { placeholderStyles } from './placeholderStyles';

const Stack = createNativeStackNavigator<ExpenseStackParamList>();
const S = AppConstants.SCREENS.MAIN;

const Placeholder = () => <View style={placeholderStyles.container} />;

export const ExpensesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={S.EXPENSE_LIST} component={Placeholder} />
    <Stack.Screen name={S.ADD_EXPENSE} component={Placeholder} />
  </Stack.Navigator>
);
