import React from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuthStore } from '@stores/authStore';

import { colors } from '@theme/colors';

import { MainTabParamList } from '@types/navigation.types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator = () => {
  const roleId = useAuthStore((s) => s.roleId);
  const isAdmin = roleId === 1;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray500,
        tabBarStyle: { backgroundColor: colors.surface },
      }}
    >
      <Tab.Screen name="Dashboard" component={PlaceholderScreen} />
      <Tab.Screen name="Clients" component={PlaceholderScreen} />
      <Tab.Screen name="Products" component={PlaceholderScreen} />
      <Tab.Screen name="Orders" component={PlaceholderScreen} />
      <Tab.Screen name="Payments" component={PlaceholderScreen} />
      {isAdmin && <Tab.Screen name="Reports" component={PlaceholderScreen} />}
      <Tab.Screen name="Settings" component={PlaceholderScreen} />
    </Tab.Navigator>
  );
};

const PlaceholderScreen = () => null;
