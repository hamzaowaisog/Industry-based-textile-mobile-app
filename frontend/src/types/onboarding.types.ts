import { OnboardingSlide } from '@constants/onboarding';

export type OnboardingComponentProps = {
  slideIndex: number;
  totalSlides: number;
  currentSlide: OnboardingSlide;
  isLastSlide: boolean;
  onContinue: () => void;
  onSkip: () => void;
};
