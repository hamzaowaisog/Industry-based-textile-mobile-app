import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthStackParamList } from '@types/navigation.types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={PlaceholderScreen} />
      <Stack.Screen name="ForgotPassword" component={PlaceholderScreen} />
      <Stack.Screen name="ResetPassword" component={PlaceholderScreen} />
    </Stack.Navigator>
  );
};

const PlaceholderScreen = () => null;
