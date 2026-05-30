import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuthStore } from '@stores/authStore';
import { OnboardingScreen } from '@screens/onboarding';
import { PrivacyScreen } from '@screens/privacy';
import { TermsScreen } from '@screens/terms';
import { WelcomeScreen } from '@screens/welcome';
import { AuthStackParamList } from '../types/navigation.types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
  const onboardingCompleted = useAuthStore((s) => s.onboardingCompleted);

  return (
    <Stack.Navigator
      initialRouteName={onboardingCompleted ? 'Login' : 'Welcome'}
      screenOptions={{ headerShown: false, fullScreenGestureEnabled: false, gestureEnabled: false }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="Login" component={PlaceholderScreen} />
      <Stack.Screen name="ForgotPassword" component={PlaceholderScreen} />
      <Stack.Screen name="ResetPassword" component={PlaceholderScreen} />
    </Stack.Navigator>
  );
};

const PlaceholderScreen = () => null;
