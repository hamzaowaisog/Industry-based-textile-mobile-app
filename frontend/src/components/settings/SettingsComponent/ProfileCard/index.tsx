import React from 'react';

import { Text, View } from 'react-native';

import { AppAvatar } from '@components/common/AppAvatar';
import { AppBadge } from '@components/common/AppBadge';
import { AppCard } from '@components/common/AppCard';

import { getInitials } from '@utils/helpers/textHelpers';

import { colors } from '@theme/colors';

import type { ProfileCardProps } from '../../../../types/settings.types';
import { styles } from './styles';

export const ProfileCard = ({ userName, userEmail, roleLabel, isAdmin }: ProfileCardProps) => (
  <AppCard padding={16}>
    <View style={styles.row}>
      <AppAvatar label={getInitials(userName ?? '?')} color={colors.primary} size={56} />
      <View style={styles.textWrap}>
        <Text style={styles.name} numberOfLines={1}>
          {userName ?? '—'}
        </Text>
        {!!userEmail && (
          <Text style={styles.email} numberOfLines={1}>
            {userEmail}
          </Text>
        )}
      </View>
      <AppBadge
        label={roleLabel}
        bg={isAdmin ? colors.primaryLight : colors.successLight}
        fg={isAdmin ? colors.primary : colors.success}
      />
    </View>
  </AppCard>
);
