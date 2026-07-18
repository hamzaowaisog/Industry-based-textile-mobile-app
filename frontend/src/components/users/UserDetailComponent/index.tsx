import React from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppAvatar } from '@components/common/AppAvatar';
import { AppBadge } from '@components/common/AppBadge';
import { AppCard } from '@components/common/AppCard';
import { ReportScreenHeader } from '@components/common/ReportScreenHeader';

import { getInitials } from '@utils/helpers/textHelpers';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';
import { CalendarIcon, MailIcon, PhoneIcon, TrashIcon, UserIcon } from '@constants/svgAssets';

import type { UserDetailComponentProps } from '../../../types/users.types';
import { SkeletonDetail } from './SkeletonDetail';
import { styles } from './styles';

export const UserDetailComponent = ({
  user,
  loading,
  submitting,
  onBack,
  onDelete,
}: UserDetailComponentProps) => {
  const { t } = useTranslation();

  if (loading || !user) return <SkeletonDetail />;

  const isAdmin = user.roleId === AppConstants.ROLES.ADMIN;
  const roleColor = isAdmin ? colors.primary : colors.success;

  const infoRows = [
    { icon: <MailIcon size={18} color={colors.primary} />, key: t('users.fieldEmail'), val: user.email },
    {
      icon: <UserIcon size={18} color={colors.primary} />,
      key: t('users.fieldUserName'),
      val: user.userName,
    },
    {
      icon: <PhoneIcon size={18} color={colors.primary} />,
      key: t('users.fieldPhone'),
      val: user.phoneNumber ?? '—',
    },
    {
      icon: <CalendarIcon size={18} color={colors.primary} />,
      key: t('users.fieldCreatedAt'),
      val: user.createdAt ?? '—',
    },
  ];

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ReportScreenHeader
        title={t('users.detailTitle')}
        onBack={onBack}
        right={
          <TouchableOpacity
            style={[styles.deleteBtn, submitting && styles.deleteBtnDisabled]}
            onPress={onDelete}
            activeOpacity={0.7}
            disabled={submitting}
          >
            <TrashIcon size={20} color={colors.danger} />
          </TouchableOpacity>
        }
      />

      <View style={styles.content}>
        <AppCard padding={20}>
          <View style={styles.avatarRow}>
            <AppAvatar label={getInitials(user.name)} color={roleColor} size={56} />
            <View style={styles.avatarTextWrap}>
              <Text style={styles.name} numberOfLines={1}>
                {user.name}
              </Text>
              <View style={styles.badgeRow}>
                <AppBadge
                  label={user.roleName}
                  bg={isAdmin ? colors.primaryLight : colors.successLight}
                  fg={roleColor}
                />
                <Text style={styles.statusText}>
                  {user.isActive ? t('users.active') : t('users.inactive')}
                </Text>
              </View>
            </View>
          </View>
        </AppCard>

        <View style={styles.sectionPad}>
          <Text style={styles.sectionLabel}>{t('users.detailSection')}</Text>
          <View style={styles.infoCard}>
            {infoRows.map((row, i, arr) => (
              <View key={row.key}>
                <View style={styles.infoRow}>
                  <View style={[styles.iconTile, { backgroundColor: colors.primaryLight }]}>
                    {row.icon}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoKey}>{row.key}</Text>
                    <Text style={styles.infoVal}>{row.val}</Text>
                  </View>
                </View>
                {i < arr.length - 1 && <View style={styles.infoDivider} />}
              </View>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};
