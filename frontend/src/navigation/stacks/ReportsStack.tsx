import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AppConstants } from '@constants/appConstants';

import ClientBalanceScreen from '../../screens/reports/ClientBalance';
import ClientDetailReportScreen from '../../screens/reports/ClientDetailReport';
import CreditDebitScreen from '../../screens/reports/CreditDebit';
import ProfitLossScreen from '../../screens/reports/ProfitLoss';
import ReportsHubScreen from '../../screens/reports/ReportsHub';
import SummaryReportScreen from '../../screens/reports/SummaryReport';
import { ReportStackParamList } from '../../types/navigation.types';

const Stack = createNativeStackNavigator<ReportStackParamList>();
const S = AppConstants.SCREENS.MAIN;

export const ReportsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={S.REPORTS_HUB} component={ReportsHubScreen} />
    <Stack.Screen name={S.PROFIT_LOSS} component={ProfitLossScreen} />
    <Stack.Screen name={S.CLIENT_BALANCE} component={ClientBalanceScreen} />
    <Stack.Screen name={S.CREDIT_DEBIT} component={CreditDebitScreen} />
    <Stack.Screen name={S.SUMMARY_REPORT} component={SummaryReportScreen} />
    <Stack.Screen name={S.CLIENT_DETAIL_REPORT} component={ClientDetailReportScreen} />
  </Stack.Navigator>
);
