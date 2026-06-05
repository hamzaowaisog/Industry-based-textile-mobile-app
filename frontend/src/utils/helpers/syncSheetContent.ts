import { AppConstants } from '@constants/appConstants';
import { colors } from '@theme/colors';
import type { SyncHeroState, SyncPhaseConfig } from '../../types/dashboard.types';
import type { SyncPhase } from '../../types/store.types';

export const getSyncProgressTarget = (
  syncPhase: SyncPhase,
  isSyncing: boolean,
  isSynced: boolean,
  lastSyncedAt: string | null,
): number => {
  if (isSynced && lastSyncedAt != null) return AppConstants.SYNC.PROGRESS.DONE;
  if (syncPhase === AppConstants.SYNC.PHASES.PULLING) return AppConstants.SYNC.PROGRESS.PULLING;
  if (syncPhase === AppConstants.SYNC.PHASES.CLEARING) return AppConstants.SYNC.PROGRESS.CLEARING;
  if (syncPhase === AppConstants.SYNC.PHASES.PUSHING) return AppConstants.SYNC.PROGRESS.PUSHING;
  if (isSyncing) return AppConstants.SYNC.PROGRESS.INIT;
  return 0;
};

export const getSyncHeroState = (
  isSyncing: boolean,
  isSynced: boolean,
  pendingCount: number,
): SyncHeroState => ({
  heroBg: isSyncing ? colors.primaryLight : isSynced ? colors.successLight : colors.warningLight,
  heroIconColor: isSyncing ? colors.primary : isSynced ? colors.success : colors.warning,
  progressColor: isSyncing ? colors.primary : isSynced ? colors.success : colors.warning,
  titleKey: isSyncing
    ? 'sync.sheetProgressHero'
    : isSynced
      ? 'sync.sheetSyncedHero'
      : 'sync.sheetPendingHero',
  titleCount: pendingCount,
  subKey: '',
});

export const getSyncPhaseConfigs = (
  syncPhase: SyncPhase,
  isSyncing: boolean,
  isSynced: boolean,
  pendingCount: number,
  lastSyncedAt: string | null,
): SyncPhaseConfig[] => [
  {
    key: AppConstants.SYNC.PHASES.PUSHING,
    labelKey: 'sync.sheetPhaseUpload',
    subKey: pendingCount > 0 ? 'sync.sheetPhaseUploadSub' : 'sync.sheetPhaseUploadSubNone',
    subCount: pendingCount,
    active: syncPhase === AppConstants.SYNC.PHASES.PUSHING && !isSynced,
    done: isSyncing
      ? syncPhase === AppConstants.SYNC.PHASES.CLEARING || syncPhase === AppConstants.SYNC.PHASES.PULLING
      : isSynced && lastSyncedAt != null,
  },
  {
    key: AppConstants.SYNC.PHASES.CLEARING,
    labelKey: 'sync.sheetPhaseClear',
    subKey: 'sync.sheetPhaseClearSub',
    active: syncPhase === AppConstants.SYNC.PHASES.CLEARING && !isSynced,
    done: isSyncing ? syncPhase === AppConstants.SYNC.PHASES.PULLING : isSynced && lastSyncedAt != null,
  },
  {
    key: AppConstants.SYNC.PHASES.PULLING,
    labelKey: 'sync.sheetPhasePull',
    subKey: 'sync.sheetPhasePullSub',
    active: syncPhase === AppConstants.SYNC.PHASES.PULLING && !isSynced,
    done: isSynced && lastSyncedAt != null,
  },
];
