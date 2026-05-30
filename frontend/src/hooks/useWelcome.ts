import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AuthStackParamList } from '../types/navigation.types';

type WelcomeNavProp = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

export const useWelcome = (navigation: WelcomeNavProp) => {
  const handleGetStarted = () => navigation.navigate('Onboarding');
  const handleSignIn = () => navigation.navigate('Login');

  return { handleGetStarted, handleSignIn };
};
