import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CheckIcon,
  LogoIcon,
  OnboardingSlide1,
  OnboardingSlide2,
  OnboardingSlide3,
} from '@constants/svgAssets';
import { OnboardingComponentProps } from '../../types/onboarding.types';

import { styles } from './styles';

const ILLUSTRATIONS = [OnboardingSlide1, OnboardingSlide2, OnboardingSlide3];

export const OnboardingComponent = ({
  slideIndex,
  totalSlides,
  currentSlide,
  isLastSlide,
  onContinue,
  onSkip,
}: OnboardingComponentProps) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const Illustration = ILLUSTRATIONS[slideIndex];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.logoRow}>
          <View style={styles.logoMini}>
            <LogoIcon size={20} color="#fff" />
          </View>
          <Text style={styles.logoName}>HamzaTex</Text>
        </View>
        <TouchableOpacity onPress={onSkip} style={styles.skipButton} activeOpacity={0.7}>
          <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable content */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Illustration */}
        <View style={[styles.illustrationBlock, { backgroundColor: currentSlide.bg }]}>
          <Illustration />
        </View>

        {/* Title + body */}
        <View style={styles.textBlock}>
          <Text style={styles.title}>{t(currentSlide.titleKey)}</Text>
          <Text style={styles.body}>{t(currentSlide.bodyKey)}</Text>
        </View>

        {/* Checklist */}
        <View style={styles.pointsList}>
          {currentSlide.pointKeys.map((key, i) => (
            <View key={i} style={styles.pointRow}>
              <View style={styles.checkCircle}>
                <CheckIcon />
              </View>
              <Text style={styles.pointText}>{t(key)}</Text>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* Bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.paginationRow}>
          <View style={styles.dots}>
            {Array.from({ length: totalSlides }).map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === slideIndex ? styles.dotActive : styles.dotInactive]}
              />
            ))}
          </View>
          <Text style={styles.counter}>
            {t('onboarding.counter', { current: slideIndex + 1, total: totalSlides })}
          </Text>
        </View>

        <TouchableOpacity style={styles.continueButton} onPress={onContinue} activeOpacity={0.85}>
          <Text style={styles.continueText}>
            {isLastSlide ? t('onboarding.getStarted') : t('onboarding.continue')}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};
