import React from 'react';

import { Text, View } from 'react-native';

import type { MiniStatProps } from '../../../../types/products.types';
import { styles } from './styles';

export const MiniStat = ({ Icon, iconColor, iconBg, label, value }: MiniStatProps) => (
  <View style={styles.card}>
    <View style={[styles.iconTile, { backgroundColor: iconBg }]}>
      <Icon size={16} color={iconColor} />
    </View>
    <Text style={styles.value} numberOfLines={1}>
      {value}
    </Text>
    <Text style={styles.label}>{label}</Text>
  </View>
);
