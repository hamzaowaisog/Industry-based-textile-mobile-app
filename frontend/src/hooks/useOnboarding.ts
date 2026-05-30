import { useState } from 'react';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';

import { AppConstants } from '@constants/appConstants';
import { ONBOARDING_SLIDES } from '@constants/onboarding';
import { useAuthStore } from '@stores/authStore';

import { AuthStackParamList } from '../types/navigation.types';

type OnboardingNavProp = NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;

export const useOnboarding = (navigation: OnboardingNavProp) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const setOnboardingCompleted = useAuthStore((s) => s.setOnboardingCompleted);

  const completeOnboarding = async () => {
    await SecureStore.setItemAsync(AppConstants.SECURE_STORE.ONBOARDING_COMPLETED, 'true');
    setOnboardingCompleted(true);
    navigation.navigate('Login');
  };

  const handleContinue = () => {
    if (slideIndex < ONBOARDING_SLIDES.length - 1) {
      setSlideIndex((prev) => prev + 1);
    } else {
      void completeOnboarding();
    }
  };

  const handleSkip = () => void completeOnboarding();

  return {
    slideIndex,
    totalSlides: ONBOARDING_SLIDES.length,
    currentSlide: ONBOARDING_SLIDES[slideIndex],
    isLastSlide: slideIndex === ONBOARDING_SLIDES.length - 1,
    handleContinue,
    handleSkip,
  };
};
