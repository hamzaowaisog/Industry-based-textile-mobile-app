import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MoreScreen } from '@screens/more';
import { NotificationCenterScreen } from '@screens/notifications';

import type { MainStackParamList } from '../types/navigation.types';
import { MainNavigator } from './MainNavigator';

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen name="DrawerRoot" component={MainNavigator} />
    <Stack.Screen name="More" component={MoreScreen} />
    <Stack.Screen name="NotificationCenter" component={NotificationCenterScreen} />
  </Stack.Navigator>
);
