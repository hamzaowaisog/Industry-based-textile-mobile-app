import React from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';
import { FingerprintIcon, RefreshIcon } from '@constants/svgAssets';

import { BiometricComponentProps } from '../../types/biometric.types';
import { styles } from './styles';

const { RING_DURATION_MS, RING_SCALE_MAX, RING_OPACITY_MAX, RING_OPACITY_MIN } =
  AppConstants.BIOMETRIC;

const AnimatedRing = ({ delay = 0 }: { delay?: number }) => {
  const scale = useSharedValue<number>(1);
  const opacity = useSharedValue<number>(RING_OPACITY_MIN);

  React.useEffect(() => {
    const delayMs = delay * AppConstants.TIME.MS_PER_SECOND;
    setTimeout(() => {
      scale.value = withRepeat(
        withSequence(
          withTiming(RING_SCALE_MAX, { duration: RING_DURATION_MS }),
          withTiming(1, { duration: RING_DURATION_MS }),
        ),
        -1,
        false,
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(RING_OPACITY_MAX, { duration: RING_DURATION_MS }),
          withTiming(RING_OPACITY_MIN, { duration: RING_DURATION_MS }),
        ),
        -1,
        false,
      );
    }, delayMs);
  }, [delay]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View pointerEvents="none" style={[styles.ring, ringStyle]} />;
};

export const BiometricComponent = ({
  userName,
  userEmail,
  initials,
  isPending,
  error,
  onAuthenticate,
  onSwitchAccount,
  onUsePassword,
}: BiometricComponentProps) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // Pulsing rings with staggered delays defined in AppConstants.BIOMETRIC.RING_STAGGER_DELAYS
  const rings = AppConstants.BIOMETRIC.RING_STAGGER_DELAYS.map((delay, id) => ({ id, delay }));

  return (
    <View style={styles.container}>
      <View style={[styles.inner, { paddingTop: insets.top + 40 }]}>
        {/* Top: Switch account */}
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.switchChip} onPress={onSwitchAccount} activeOpacity={0.7}>
            <RefreshIcon size={13} color={colors.textSecondary} />
            <Text style={styles.switchChipText}>{t('biometric.switchAccount')}</Text>
          </TouchableOpacity>
        </View>

        {/* Center: Avatar + Fingerprint */}
        <View style={styles.centerSection}>
          {/* Avatar section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
            <View style={styles.avatarInfo}>
              <Text style={styles.signingInAs}>{t('biometric.signingInAs')}</Text>
              <Text style={styles.userName}>{userName || '...'}</Text>
              {userEmail ? <Text style={styles.userEmail}>{userEmail}</Text> : null}
            </View>
          </View>

          {/* Fingerprint with 3 animated rings — tap re-opens biometric prompt */}
          <TouchableOpacity
            style={styles.fingerprintSection}
            onPress={onAuthenticate}
            activeOpacity={0.75}
            disabled={isPending}
            accessibilityRole="button"
            accessibilityLabel={t('biometric.touchSensor')}
            accessibilityState={{ disabled: isPending, busy: isPending }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            {rings.map((ring) => (
              <AnimatedRing key={ring.id} delay={ring.delay} />
            ))}
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.gradientCircle, isPending && styles.gradientCirclePending]}
              pointerEvents="none"
            >
              <FingerprintIcon size={56} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Labels — also tappable so “Touch sensor” clearly retries */}
          <TouchableOpacity
            style={styles.labelSection}
            onPress={onAuthenticate}
            activeOpacity={0.7}
            disabled={isPending}
            accessibilityRole="button"
            accessibilityLabel={t('biometric.touchSensor')}
          >
            <Text style={styles.touchLabel}>{t('biometric.touchSensor')}</Text>
            <Text style={styles.orLabel}>{t('biometric.orFaceId')}</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </TouchableOpacity>
        </View>

        {/* Bottom: Ghost button */}
        <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 24 }]}>
          <TouchableOpacity style={styles.ghostButton} onPress={onUsePassword} activeOpacity={0.7}>
            <Text style={styles.ghostButtonText}>{t('biometric.usePassword')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
