import React from 'react';

import { Text, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { AppAvatar } from '@components/common/AppAvatar';
import { AppBadge } from '@components/common/AppBadge';
import { AppCard } from '@components/common/AppCard';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';

import type { UserRowCardProps } from '../../../../types/users.types';
import { styles } from './styles';

export const UserRowCard = React.memo(({ item, onPress }: UserRowCardProps) => {
  const { t } = useTranslation();
  const isAdmin = item.roleId === AppConstants.ROLES.ADMIN;

  return (
    <AppCard onPress={() => onPress(item.id)} padding={14}>
      <View style={styles.row}>
        <AppAvatar
          label={item.initials}
          color={isAdmin ? colors.primary : colors.success}
          size={44}
        />

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            {item.email}
          </Text>
        </View>

        <View style={styles.right}>
          <AppBadge
            label={item.roleName}
            bg={isAdmin ? colors.primaryLight : colors.successLight}
            fg={isAdmin ? colors.primary : colors.success}
          />
          <Text style={styles.statusText}>
            {item.isActive ? t('users.active') : t('users.inactive')}
          </Text>
        </View>
      </View>
    </AppCard>
  );
});
