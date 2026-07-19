import React from 'react';

import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppCard } from '@components/common/AppCard';
import { AppIconTile } from '@components/common/AppIconTile';
import { AppRow } from '@components/common/AppRow';
import { AppSection } from '@components/common/AppSection';
import { AppToggle } from '@components/common/AppToggle';

import { colors } from '@theme/colors';

import {
  BellIcon,
  FingerprintIcon,
  InfoIcon,
  LockIcon,
  LogOutIcon,
  MailIcon,
  MenuIcon,
} from '@constants/svgAssets';

import type { SettingsComponentProps } from '../../../types/settings.types';
import { ProfileCard } from './ProfileCard';
import { styles } from './styles';

export const SettingsComponent = ({
  userName,
  userEmail,
  roleLabel,
  isAdmin,
  isBiometricAvailable,
  isBiometricEnabled,
  isBiometricPending,
  isNotificationsEnabled,
  isNotificationsPending,
  appVersion,
  onMenuPress,
  onChangePassword,
  onResendConfirmation,
  isResendingConfirmation,
  onToggleBiometric,
  onToggleNotifications,
  onSignOut,
}: SettingsComponentProps) => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn} onPress={onMenuPress} activeOpacity={0.7}>
          <MenuIcon size={23} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ProfileCard
            userName={userName}
            userEmail={userEmail}
            roleLabel={roleLabel}
            isAdmin={isAdmin}
          />
        </View>

        <View style={styles.section}>
          <AppSection title={t('settings.accountSection')} />
          <AppCard padding={0}>
            <View style={styles.rowPad}>
              <AppRow
                leading={<AppIconTile Icon={LockIcon} color={colors.primary} size={44} />}
                primary={t('settings.changePassword')}
                secondary={t('settings.changePasswordSub')}
                onPress={onChangePassword}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.rowPad}>
              <AppRow
                leading={<AppIconTile Icon={MailIcon} color={colors.warning} size={44} />}
                primary={t('settings.resendConfirmation')}
                secondary={t('settings.resendConfirmationSub')}
                onPress={isResendingConfirmation ? undefined : onResendConfirmation}
                chevron={!isResendingConfirmation}
                right={
                  isResendingConfirmation ? <ActivityIndicator color={colors.warning} /> : undefined
                }
              />
            </View>
          </AppCard>
        </View>

        {isBiometricAvailable && (
          <View style={styles.section}>
            <AppSection title={t('settings.securitySection')} />
            <AppCard padding={0}>
              <View style={styles.rowPad}>
                <AppRow
                  leading={<AppIconTile Icon={FingerprintIcon} color={colors.success} size={44} />}
                  primary={t('settings.biometricLogin')}
                  secondary={t('settings.biometricLoginSub')}
                  chevron={false}
                  right={
                    <AppToggle
                      value={isBiometricEnabled}
                      onValueChange={onToggleBiometric}
                      disabled={isBiometricPending}
                    />
                  }
                />
              </View>
            </AppCard>
          </View>
        )}

        <View style={styles.section}>
          <AppSection title={t('settings.notificationsSection')} />
          <AppCard padding={0}>
            <View style={styles.rowPad}>
              <AppRow
                leading={<AppIconTile Icon={BellIcon} color={colors.violet} size={44} />}
                primary={t('settings.pushNotifications')}
                secondary={t('settings.pushNotificationsSub')}
                chevron={false}
                right={
                  <AppToggle
                    value={isNotificationsEnabled}
                    onValueChange={onToggleNotifications}
                    disabled={isNotificationsPending}
                  />
                }
              />
            </View>
          </AppCard>
        </View>

        <View style={styles.section}>
          <AppSection title={t('settings.aboutSection')} />
          <AppCard padding={0}>
            <View style={styles.rowPad}>
              <AppRow
                leading={<AppIconTile Icon={InfoIcon} color={colors.textSecondary} size={44} />}
                primary={t('settings.appVersion')}
                secondary={appVersion}
                chevron={false}
              />
            </View>
          </AppCard>
        </View>

        <View style={styles.section}>
          <AppCard padding={0}>
            <TouchableOpacity style={styles.signOutRow} onPress={onSignOut} activeOpacity={0.75}>
              <AppIconTile Icon={LogOutIcon} color={colors.danger} size={40} />
              <Text style={styles.signOutText}>{t('settings.signOut')}</Text>
            </TouchableOpacity>
          </AppCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
