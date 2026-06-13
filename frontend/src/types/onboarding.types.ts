export type OnboardingSlide = {
  bg: string;
  titleKey: string;
  bodyKey: string;
  pointKeys: [string, string, string];
};

export type OnboardingComponentProps = {
  slideIndex: number;
  totalSlides: number;
  currentSlide: OnboardingSlide;
  isLastSlide: boolean;
  onContinue: () => void;
  onSkip: () => void;
};
