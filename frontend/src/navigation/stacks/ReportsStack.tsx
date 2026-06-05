import React from 'react';

import { View } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AppConstants } from '@constants/appConstants';

import { ReportStackParamList } from '../../types/navigation.types';
import { placeholderStyles } from './placeholderStyles';

const Stack = createNativeStackNavigator<ReportStackParamList>();
const S = AppConstants.SCREENS.MAIN;

const Placeholder = () => <View style={placeholderStyles.container} />;

export const ReportsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={S.REPORTS_HUB} component={Placeholder} />
    <Stack.Screen name={S.PROFIT_LOSS} component={Placeholder} />
    <Stack.Screen name={S.CLIENT_BALANCE} component={Placeholder} />
    <Stack.Screen name={S.CLIENT_BALANCE_DETAIL} component={Placeholder} />
    <Stack.Screen name={S.CREDIT_DEBIT} component={Placeholder} />
    <Stack.Screen name={S.SUMMARY_REPORT} component={Placeholder} />
  </Stack.Navigator>
);
