import { colors } from '@theme/colors';

export type OnboardingSlide = {
  bg: string;
  titleKey: string;
  bodyKey: string;
  pointKeys: [string, string, string];
};

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    bg: colors.primaryLight,
    titleKey: 'onboarding.slides.slide1.title',
    bodyKey: 'onboarding.slides.slide1.body',
    pointKeys: [
      'onboarding.slides.slide1.point1',
      'onboarding.slides.slide1.point2',
      'onboarding.slides.slide1.point3',
    ],
  },
  {
    bg: colors.successLight,
    titleKey: 'onboarding.slides.slide2.title',
    bodyKey: 'onboarding.slides.slide2.body',
    pointKeys: [
      'onboarding.slides.slide2.point1',
      'onboarding.slides.slide2.point2',
      'onboarding.slides.slide2.point3',
    ],
  },
  {
    bg: colors.violetLight,
    titleKey: 'onboarding.slides.slide3.title',
    bodyKey: 'onboarding.slides.slide3.body',
    pointKeys: [
      'onboarding.slides.slide3.point1',
      'onboarding.slides.slide3.point2',
      'onboarding.slides.slide3.point3',
    ],
  },
];
