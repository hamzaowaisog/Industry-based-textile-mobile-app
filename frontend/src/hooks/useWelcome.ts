import { AppConstants } from '@constants/appConstants';

import { WelcomeNavProp } from '../types/navigation.types';

export const useWelcome = (navigation: WelcomeNavProp) => {
  const handleGetStarted = () => navigation.navigate(AppConstants.SCREENS.AUTH.ONBOARDING);
  const handleSignIn = () => navigation.navigate(AppConstants.SCREENS.AUTH.LOGIN);

  return { handleGetStarted, handleSignIn };
};
