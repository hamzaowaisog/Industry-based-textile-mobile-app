import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  LockIcon,
  LogoIcon,
  TrendIcon,
  WeavePattern,
  WifiIcon,
} from '@constants/svgAssets';
import { colors } from '@theme/colors';
import { WelcomeComponentProps } from '../../types/welcome.types';

import { styles } from './styles';

export const WelcomeComponent = ({ onGetStarted, onSignIn, onTerms, onPrivacy }: WelcomeComponentProps) => {
  const { t } = useTranslation();

  const stats = [
    { value: '120+', label: t('welcome.stats.mills') },
    { value: '4.8★', label: t('welcome.stats.appRating') },
    { value: '99.9%', label: t('welcome.stats.uptime') },
  ];

  const features = [
    {
      Icon: WifiIcon,
      color: colors.primary,
      label: t('welcome.features.syncLabel'),
      sub: t('welcome.features.syncSub'),
    },
    {
      Icon: LockIcon,
      color: colors.success,
      label: t('welcome.features.securityLabel'),
      sub: t('welcome.features.securitySub'),
    },
    {
      Icon: TrendIcon,
      color: colors.violet,
      label: t('welcome.features.insightsLabel'),
      sub: t('welcome.features.insightsSub'),
    },
  ];

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
              <Text style={styles.brandName}>HamzaTex</Text>
              <Text style={styles.brandSubtitle}>{t('welcome.brandSubtitle')}</Text>
            </View>

            <Text style={styles.heroTagline}>{t('welcome.heroTagline')}</Text>
          </LinearGradient>
        </View>

        {/* Stats */}
        <View style={styles.statsWrapper}>
          <View style={styles.statsCard}>
            {stats.map((stat, i) => (
              <View key={i} style={[styles.statItem, i > 0 && styles.statItemBorder]}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Features */}
        <View style={styles.featuresWrapper}>
          {features.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={[styles.iconTile, { backgroundColor: f.color + '22' }]}>
                <f.Icon color={f.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureLabel}>{f.label}</Text>
                <Text style={styles.featureSub}>{f.sub}</Text>
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
