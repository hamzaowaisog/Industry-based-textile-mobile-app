import React from 'react';

import { Text, View } from 'react-native';

import { colors } from '@theme/colors';

import type { AppAvatarProps } from '../../../types/common.types';
import { styles } from './styles';

export const AppAvatar = ({ label, color = colors.primary, size = 40 }: AppAvatarProps) => (
  <View
    style={[
      styles.avatar,
      { width: size, height: size, borderRadius: size / 2, backgroundColor: color + '20' },
    ]}
  >
    <Text style={[styles.label, { color, fontSize: size > 40 ? 16 : 13 }]} numberOfLines={1}>
      {label}
    </Text>
  </View>
);
