import { Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { colors } from '@theme/colors';

import { RefreshIcon } from '@constants/svgAssets';

import type { SyncStatusBarProps } from '../../../types/dashboard.types';
import { styles } from './styles';

export const SyncStatusBar = ({ isOnline, isSyncing, onSync }: SyncStatusBarProps) => {
  const { t } = useTranslation();

  if (!isOnline) {
    return (
      <View style={styles.bar}>
        <View style={[styles.dot, { backgroundColor: colors.danger }]} />
        <Text style={styles.text}>{t('dashboard.syncOffline')}</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.bar} onPress={onSync} disabled={isSyncing} activeOpacity={0.7}>
      <RefreshIcon size={14} color={isSyncing ? colors.primary : colors.textSecondary} />
      <Text style={[styles.text, isSyncing && styles.textSyncing]}>
        {isSyncing ? t('dashboard.syncInProgress') : t('dashboard.syncIdle')}
      </Text>
    </TouchableOpacity>
  );
};
