import React from 'react';

import { View } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AppConstants } from '@constants/appConstants';

import { InvoiceStackParamList } from '../../types/navigation.types';
import { placeholderStyles } from './placeholderStyles';

const Stack = createNativeStackNavigator<InvoiceStackParamList>();
const S = AppConstants.SCREENS.MAIN;

const Placeholder = () => <View style={placeholderStyles.container} />;

export const InvoicesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={S.INVOICE_LIST} component={Placeholder} />
    <Stack.Screen name={S.INVOICE_DETAIL} component={Placeholder} />
    <Stack.Screen name={S.INVOICE_FORM} component={Placeholder} />
  </Stack.Navigator>
);
