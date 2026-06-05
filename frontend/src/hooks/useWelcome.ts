import { useCallback } from 'react';
import { BackHandler } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import { AppConstants } from '@constants/appConstants';

import { WelcomeNavProp } from '../types/navigation.types';

export const useWelcome = (navigation: WelcomeNavProp) => {
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => sub.remove();
    }, []),
  );

  const handleGetStarted = () => navigation.navigate(AppConstants.SCREENS.AUTH.ONBOARDING);
  const handleSignIn = () => navigation.reset({ index: 0, routes: [{ name: AppConstants.SCREENS.AUTH.LOGIN }] });

  return { handleGetStarted, handleSignIn };
};
