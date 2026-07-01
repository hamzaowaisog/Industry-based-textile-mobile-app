import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import EditPaymentScreen from '@screens/payments/EditPayment';
import PaymentDetailScreen from '@screens/payments/PaymentDetail';
import PaymentListScreen from '@screens/payments/PaymentList';
import RecordPaymentScreen from '@screens/payments/RecordPayment';

import { AppConstants } from '@constants/appConstants';

import { PaymentStackParamList } from '../../types/navigation.types';

const Stack = createNativeStackNavigator<PaymentStackParamList>();
const S = AppConstants.SCREENS.MAIN;

export const PaymentsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={S.PAYMENT_LIST} component={PaymentListScreen} />
    <Stack.Screen name={S.PAYMENT_DETAIL} component={PaymentDetailScreen} />
    <Stack.Screen name={S.RECORD_PAYMENT} component={RecordPaymentScreen} />
    <Stack.Screen name={S.EDIT_PAYMENT} component={EditPaymentScreen} />
  </Stack.Navigator>
);
