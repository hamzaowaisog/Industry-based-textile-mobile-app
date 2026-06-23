import React from 'react';

import { Text, View } from 'react-native';

import type { AppBadgeProps } from '../../../types/common.types';
import { styles } from './styles';

export const AppBadge = ({ label, bg, fg, size = 'md' }: AppBadgeProps) => (
  <View style={[styles.badge, styles[`size_${size}`], { backgroundColor: bg }]}>
    <Text style={[styles.label, styles[`labelSize_${size}`], { color: fg }]} numberOfLines={1}>
      {label}
    </Text>
  </View>
);
