import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppConstants } from '@constants/appConstants';
import { LogoIcon, WeavePattern } from '@constants/svgAssets';
import { colors } from '@theme/colors';
import { WELCOME_FEATURES, WELCOME_STATS } from '@utils/helpers/welcomeContent';
import { WelcomeComponentProps } from '../../types/welcome.types';

import { styles } from './styles';

export const WelcomeComponent = ({ onGetStarted, onSignIn, onTerms, onPrivacy }: WelcomeComponentProps) => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>

        {/* Hero */}
        <View style={styles.heroWrapper}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0.7, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.heroGradient}
          >
            <WeavePattern />
            <View style={styles.orbTopRight} />
            <View style={styles.orbBottomLeft} />

            <View style={styles.wordmarkContainer}>
              <View style={styles.logoBox}>
                <LogoIcon size={56} color="#fff" />
              </View>
              <Text style={styles.brandName}>{AppConstants.APP.NAME}</Text>
              <Text style={styles.brandSubtitle}>{t('welcome.brandSubtitle')}</Text>
            </View>

            <Text style={styles.heroTagline}>{t('welcome.heroTagline')}</Text>
          </LinearGradient>
        </View>

        {/* Stats */}
        <View style={styles.statsWrapper}>
          <View style={styles.statsCard}>
            {WELCOME_STATS.map((stat, i) => (
              <View key={stat.labelKey} style={[styles.statItem, i > 0 && styles.statItemBorder]}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{t(stat.labelKey)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Features */}
        <View style={styles.featuresWrapper}>
          {WELCOME_FEATURES.map((f) => (
            <View key={f.labelKey} style={styles.featureRow}>
              <View style={[styles.iconTile, { backgroundColor: f.color + '22' }]}>
                <f.Icon color={f.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureLabel}>{t(f.labelKey)}</Text>
                <Text style={styles.featureSub}>{t(f.subKey)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTAs */}
        <View style={styles.ctaWrapper}>
          <TouchableOpacity style={styles.primaryButton} onPress={onGetStarted} activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>{t('welcome.getStarted')}</Text>
          </TouchableOpacity>

          <View style={styles.signInRow}>
            <Text style={styles.signInText}>{t('welcome.alreadyHaveAccount')} </Text>
            <TouchableOpacity onPress={onSignIn} activeOpacity={0.7}>
              <Text style={styles.signInLink}>{t('welcome.signIn')}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.termsText}>
            {t('welcome.termsPrefix')}{' '}
            <Text style={styles.termsLink} onPress={onTerms}>{t('welcome.terms')}</Text>
            {' '}&{' '}
            <Text style={styles.termsLink} onPress={onPrivacy}>{t('welcome.privacy')}</Text>
          </Text>
        </View>

      </View>
    </SafeAreaView>
  );
};
