import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AppConstants } from '@constants/appConstants';

import ChangePasswordScreen from '../../screens/settings/ChangePassword';
import SettingsScreen from '../../screens/settings/Settings';
import { SettingsStackParamList } from '../../types/navigation.types';

const Stack = createNativeStackNavigator<SettingsStackParamList>();
const S = AppConstants.SCREENS.MAIN;

export const SettingsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={S.SETTINGS} component={SettingsScreen} />
    <Stack.Screen name={S.CHANGE_PASSWORD} component={ChangePasswordScreen} />
  </Stack.Navigator>
);
