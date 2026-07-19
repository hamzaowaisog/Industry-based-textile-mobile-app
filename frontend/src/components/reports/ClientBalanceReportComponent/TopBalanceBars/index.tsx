import React from 'react';

import { Text, View } from 'react-native';

import { AppAmount } from '@components/common/AppAmount';

import type { TopBalanceBarsProps } from '../../../../types/reports.types';
import { styles } from './styles';

const TOP_N = 5;

export const TopBalanceBars = ({ rows, color }: TopBalanceBarsProps) => {
  const top = rows.slice(0, TOP_N);
  const max = Math.max(...top.map((r) => r.balance), 1);

  return (
    <View style={styles.wrap}>
      {top.map((row) => (
        <View key={row.clientId} style={styles.item}>
          <View style={styles.itemHeader}>
            <Text style={styles.label} numberOfLines={1}>
              {row.name}
            </Text>
            <AppAmount value={row.balance} size={13} />
          </View>
          <View style={styles.track}>
            <View
              style={[styles.fill, { width: `${(row.balance / max) * 100}%`, backgroundColor: color }]}
            />
          </View>
        </View>
      ))}
    </View>
  );
};
