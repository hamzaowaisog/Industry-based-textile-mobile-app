import React from 'react';

import { useNavigation } from '@react-navigation/native';

import { OnboardingComponent } from '@components/onboarding';
import { useOnboarding } from '@hooks/useOnboarding';

import { OnboardingNavProp } from '../../types/navigation.types';

export const OnboardingScreen = () => {
  const navigation = useNavigation<OnboardingNavProp>();
  const {
    slideIndex,
    totalSlides,
    currentSlide,
    isLastSlide,
    handleContinue,
    handleSkip,
  } = useOnboarding(navigation);

  return (
    <OnboardingComponent
      slideIndex={slideIndex}
      totalSlides={totalSlides}
      currentSlide={currentSlide}
      isLastSlide={isLastSlide}
      onContinue={handleContinue}
      onSkip={handleSkip}
    />
  );
};
