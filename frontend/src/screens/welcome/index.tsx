import React from 'react';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { WelcomeComponent } from '@components/welcome';
import { useWelcome } from '@hooks/useWelcome';

import { AuthStackParamList } from '../../types/navigation.types';

export const WelcomeScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList, 'Welcome'>>();
  const { handleGetStarted, handleSignIn } = useWelcome(navigation);

  return (
    <WelcomeComponent
      onGetStarted={handleGetStarted}
      onSignIn={handleSignIn}
      onTerms={() => navigation.navigate('Terms')}
      onPrivacy={() => navigation.navigate('Privacy')}
    />
  );
};
