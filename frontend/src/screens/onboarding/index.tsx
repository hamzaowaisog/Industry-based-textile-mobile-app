import React from 'react';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { OnboardingComponent } from '@components/onboarding';
import { useOnboarding } from '@hooks/useOnboarding';

import { AuthStackParamList } from '../../types/navigation.types';

export const OnboardingScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>>();
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
