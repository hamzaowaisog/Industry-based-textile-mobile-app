import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

import { CheckIcon, FingerprintIcon, RefreshIcon } from '@constants/svgAssets';
import { colors } from '@theme/colors';
import { BiometricComponentProps } from '../../types/biometric.types';

import { styles } from './styles';

const AnimatedRing = ({ delay = 0 }: { delay?: number }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.15);

  React.useEffect(() => {
    const delayMs = delay * 1000;
    setTimeout(() => {
      scale.value = withRepeat(
        withSequence(withTiming(1.08, { duration: 2000 }), withTiming(1, { duration: 2000 })),
        -1,
        false
      );
      opacity.value = withRepeat(
        withSequence(withTiming(0.4, { duration: 2000 }), withTiming(0.15, { duration: 2000 })),
        -1,
        false
      );
    }, delayMs);
  }, [delay]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.ring, ringStyle]} />;
};

export const BiometricComponent = ({
  userName,
  userEmail,
  initials,
  isPending,
  error,
  lastSyncMinutes,
  onAuthenticate,
  onSwitchAccount,
  onUsePassword,
}: BiometricComponentProps) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // Three pulsing rings with staggered delays: 0s, 0.4s, 0.8s
  const rings = [
    { id: 0, delay: 0 },
    { id: 1, delay: 0.4 },
    { id: 2, delay: 0.8 },
  ];

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

          {/* Fingerprint with 3 animated rings */}
          <TouchableOpacity
            style={styles.fingerprintSection}
            onPress={onAuthenticate}
            activeOpacity={0.75}
            disabled={isPending}
          >
            {rings.map((ring) => (
              <AnimatedRing key={ring.id} delay={ring.delay} />
            ))}
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.gradientCircle, isPending && styles.gradientCirclePending]}
            >
              <FingerprintIcon size={56} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Labels */}
          <View style={styles.labelSection}>
            <Text style={styles.touchLabel}>{t('biometric.touchSensor')}</Text>
            <Text style={styles.orLabel}>{t('biometric.orFaceId')}</Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        </View>

        {/* Bottom: Status card + Ghost button */}
        <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.statusCard}>
            <View style={styles.statusIcon}>
              <CheckIcon size={16} color={colors.success} />
            </View>
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>
                {t('sync.synced', { time: t('sync.minutesAgo', { count: lastSyncMinutes }) })}
              </Text>
              <Text style={styles.statusSubtitle}>{t('sync.allDataUpToDate')}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.ghostButton} onPress={onUsePassword} activeOpacity={0.7}>
            <Text style={styles.ghostButtonText}>{t('biometric.usePassword')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
