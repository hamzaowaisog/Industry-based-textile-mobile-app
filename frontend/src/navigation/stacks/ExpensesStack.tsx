import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AddExpenseScreen from '@screens/expenses/AddExpense';
import EditExpenseScreen from '@screens/expenses/EditExpense';
import ExpenseDetailScreen from '@screens/expenses/ExpenseDetail';
import ExpenseListScreen from '@screens/expenses/ExpenseList';

import { AppConstants } from '@constants/appConstants';

import { ExpenseStackParamList } from '../../types/navigation.types';

const Stack = createNativeStackNavigator<ExpenseStackParamList>();
const S = AppConstants.SCREENS.MAIN;

export const ExpensesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={S.EXPENSE_LIST} component={ExpenseListScreen} />
    <Stack.Screen name={S.EXPENSE_DETAIL} component={ExpenseDetailScreen} />
    <Stack.Screen name={S.ADD_EXPENSE} component={AddExpenseScreen} />
    <Stack.Screen name={S.EDIT_EXPENSE} component={EditExpenseScreen} />
  </Stack.Navigator>
);
