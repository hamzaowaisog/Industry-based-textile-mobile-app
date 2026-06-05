import React, { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';

import { useAuthStore } from '@stores/authStore';

import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';

export const RootNavigator = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrated = useAuthStore((s) => s.hydrated);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) {
      queryClient.clear();
    }
  }, [isAuthenticated, queryClient]);

  if (!hydrated) return null;

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
