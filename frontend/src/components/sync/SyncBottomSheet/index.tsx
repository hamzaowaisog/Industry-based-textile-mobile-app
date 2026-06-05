import { forwardRef, useEffect, useRef } from 'react';

import { Animated, Text, View } from 'react-native';

import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';

import { AppBottomSheet } from '@components/common/AppBottomSheet';
import { CheckIcon, RefreshIcon } from '@constants/svgAssets';
import { AppConstants } from '@constants/appConstants';
import { colors } from '@theme/colors';
import { formatRelativeTime } from '@utils/helpers/formatRelativeTime';
import {
  getSyncHeroState,
  getSyncPhaseConfigs,
  getSyncProgressTarget,
} from '@utils/helpers/syncSheetContent';

import type { SyncBottomSheetProps } from '../../../types/dashboard.types';
import { styles } from './styles';

export const SyncBottomSheet = forwardRef<BottomSheetModal, SyncBottomSheetProps>(
  ({ isSyncing, syncPhase, pendingCount, lastSyncedAt }, ref) => {
    const { t } = useTranslation();
    const progressAnim = useRef(new Animated.Value(0)).current;

    const isSynced = !isSyncing && pendingCount === 0;
    const hero = getSyncHeroState(isSyncing, isSynced, pendingCount);
    const phases = getSyncPhaseConfigs(syncPhase, isSyncing, isSynced, pendingCount, lastSyncedAt);

    useEffect(() => {
      Animated.timing(progressAnim, {
        toValue: getSyncProgressTarget(syncPhase, isSyncing, isSynced, lastSyncedAt),
        duration: 450,
        useNativeDriver: false,
      }).start();
    }, [isSyncing, isSynced, syncPhase, lastSyncedAt, progressAnim]);

    const heroSub = lastSyncedAt
      ? t('sync.sheetLastSynced', { time: formatRelativeTime(lastSyncedAt) })
      : t('sync.sheetNeverSynced');

    return (
      <AppBottomSheet ref={ref} snapPoints={AppConstants.SYNC.SNAP_POINTS}>
        <View style={styles.sheetInner}>
          <BottomSheetScrollView contentContainerStyle={styles.content}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{t('sync.sheetTitle')}</Text>
            </View>

            <View style={[styles.heroCard, { backgroundColor: hero.heroBg }]}>
              <View style={styles.heroIconCircle}>
                {isSynced
                  ? <CheckIcon size={32} color={hero.heroIconColor} />
                  : <RefreshIcon size={32} color={hero.heroIconColor} />}
              </View>
              <Text style={styles.heroTitle}>
                {t(hero.titleKey, { count: hero.titleCount })}
              </Text>
              <Text style={styles.heroSub}>{heroSub}</Text>
            </View>

            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: hero.progressColor,
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>

            <Text style={styles.sectionLabel}>{t('sync.sheetPhasesLabel')}</Text>
            <View style={styles.phasesCard}>
              {phases.map((phase, i) => (
                <View key={phase.key}>
                  <View style={styles.phaseRow}>
                    <View style={[
                      styles.phaseIconTile,
                      phase.active && styles.phaseIconActive,
                      phase.done && styles.phaseIconDone,
                    ]}>
                      {phase.done
                        ? <CheckIcon size={16} color={colors.success} />
                        : <RefreshIcon size={16} color={phase.active ? colors.primary : colors.textTertiary} />}
                    </View>
                    <View style={styles.phaseInfo}>
                      <Text style={[styles.phaseLabel, phase.active && styles.phaseLabelActive]}>
                        {t(phase.labelKey)}
                      </Text>
                      <Text style={styles.phaseSub}>
                        {t(phase.subKey, { count: phase.subCount })}
                      </Text>
                    </View>
                    {phase.active && (
                      <View style={[styles.phaseBadge, { backgroundColor: colors.primaryLight }]}>
                        <Text style={[styles.phaseBadgeText, { color: colors.primary }]}>
                          {t('sync.sheetProgressHero')}
                        </Text>
                      </View>
                    )}
                  </View>
                  {i < phases.length - 1 && <View style={styles.phaseDivider} />}
                </View>
              ))}
            </View>
          </BottomSheetScrollView>

        </View>
      </AppBottomSheet>
    );
  },
);
