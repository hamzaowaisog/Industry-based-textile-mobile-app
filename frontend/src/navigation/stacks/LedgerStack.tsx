import React from 'react';

import { View } from 'react-native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AppConstants } from '@constants/appConstants';

import { LedgerStackParamList } from '../../types/navigation.types';
import { placeholderStyles } from './placeholderStyles';

const Stack = createNativeStackNavigator<LedgerStackParamList>();
const S = AppConstants.SCREENS.MAIN;

const Placeholder = () => <View style={placeholderStyles.container} />;

export const LedgerStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={S.TRANSACTION_LIST} component={Placeholder} />
  </Stack.Navigator>
);
