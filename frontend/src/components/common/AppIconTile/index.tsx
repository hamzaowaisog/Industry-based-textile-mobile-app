import React from 'react';

import { View } from 'react-native';

import { colors } from '@theme/colors';

import type { AppIconTileProps } from '../../../types/common.types';
import { styles } from './styles';

export const AppIconTile = ({
  Icon,
  color = colors.primary,
  size = 40,
  soft = true,
}: AppIconTileProps) => (
  <View
    style={[
      styles.tile,
      { width: size, height: size, backgroundColor: soft ? color + '18' : color },
    ]}
  >
    <Icon size={size > 40 ? 22 : 20} color={soft ? color : colors.white} />
  </View>
);
