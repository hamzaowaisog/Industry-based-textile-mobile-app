import { useCallback, useState } from 'react';
import { BackHandler } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { File, Paths } from 'expo-file-system';

import { AppConstants } from '@constants/appConstants';
import { ONBOARDING_SLIDES } from '@constants/onboarding';
import { useAuthStore } from '@stores/authStore';

import { OnboardingNavProp } from '../types/navigation.types';

export const useOnboarding = (navigation: OnboardingNavProp) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const setOnboardingCompleted = useAuthStore((s) => s.setOnboardingCompleted);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => sub.remove();
    }, []),
  );

  const completeOnboarding = async () => {
    new File(Paths.document, AppConstants.FILES.ONBOARDING_COMPLETED).write('1');
    setOnboardingCompleted(true);
    navigation.reset({ index: 0, routes: [{ name: AppConstants.SCREENS.AUTH.LOGIN }] });
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
