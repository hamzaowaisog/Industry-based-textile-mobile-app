import React from 'react';

import { NavigationContainer } from '@react-navigation/native';

import { useAuthStore } from '@stores/authStore';

import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';

export const RootNavigator = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrated = useAuthStore((s) => s.hydrated);

  if (!hydrated) return null;

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
