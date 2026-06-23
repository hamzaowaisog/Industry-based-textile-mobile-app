import React from 'react';

import { TouchableOpacity, View } from 'react-native';

import type { AppCardProps } from '../../../types/common.types';
import { styles } from './styles';

export const AppCard = ({
  children,
  padding = 16,
  tone = 'surface',
  elevated = true,
  onPress,
}: AppCardProps) => {
  const content = (
    <View style={[styles.card, styles[`tone_${tone}`], elevated && styles.elevated, { padding }]}>
      {children}
    </View>
  );

  if (!onPress) return content;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      {content}
    </TouchableOpacity>
  );
};
