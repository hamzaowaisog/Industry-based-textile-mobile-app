import React from 'react';

import { useNavigation } from '@react-navigation/native';

import { WelcomeComponent } from '@components/welcome';
import { AppConstants } from '@constants/appConstants';
import { useWelcome } from '@hooks/useWelcome';

import { WelcomeNavProp } from '../../types/navigation.types';

export const WelcomeScreen = () => {
  const navigation = useNavigation<WelcomeNavProp>();
  const { handleGetStarted, handleSignIn } = useWelcome(navigation);

  return (
    <WelcomeComponent
      onGetStarted={handleGetStarted}
      onSignIn={handleSignIn}
      onTerms={() => navigation.navigate(AppConstants.SCREENS.AUTH.TERMS)}
      onPrivacy={() => navigation.navigate(AppConstants.SCREENS.AUTH.PRIVACY)}
    />
  );
};
