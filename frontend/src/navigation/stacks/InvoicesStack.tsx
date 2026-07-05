import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CreateInvoiceScreen from '@screens/invoices/CreateInvoice';
import EditInvoiceScreen from '@screens/invoices/EditInvoice';
import InvoiceDetailScreen from '@screens/invoices/InvoiceDetail';
import InvoiceListScreen from '@screens/invoices/InvoiceList';

import { AppConstants } from '@constants/appConstants';

import { InvoiceStackParamList } from '../../types/navigation.types';

const Stack = createNativeStackNavigator<InvoiceStackParamList>();
const S = AppConstants.SCREENS.MAIN;

export const InvoicesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={S.INVOICE_LIST} component={InvoiceListScreen} />
    <Stack.Screen name={S.INVOICE_DETAIL} component={InvoiceDetailScreen} />
    <Stack.Screen name={S.CREATE_INVOICE} component={CreateInvoiceScreen} />
    <Stack.Screen name={S.EDIT_INVOICE} component={EditInvoiceScreen} />
  </Stack.Navigator>
);
