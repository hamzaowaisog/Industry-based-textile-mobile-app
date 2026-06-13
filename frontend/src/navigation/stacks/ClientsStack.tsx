import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AppConstants } from '@constants/appConstants';
import { ClientListScreen } from '@screens/clients/ClientListScreen';
import { ClientDetailScreen } from '@screens/clients/ClientDetailScreen';
import { ClientFormScreen } from '@screens/clients/ClientFormScreen';

import type { ClientStackParamList } from '../../types/navigation.types';

const Stack = createNativeStackNavigator<ClientStackParamList>();
const S = AppConstants.SCREENS.MAIN;

export const ClientsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen name={S.CLIENT_LIST} component={ClientListScreen} />
    <Stack.Screen name={S.CLIENT_DETAIL} component={ClientDetailScreen} />
    <Stack.Screen name={S.CLIENT_FORM} component={ClientFormScreen} />
  </Stack.Navigator>
);
