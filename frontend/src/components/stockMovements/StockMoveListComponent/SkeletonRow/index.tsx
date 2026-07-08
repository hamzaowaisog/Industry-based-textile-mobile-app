import React from 'react';

import { View } from 'react-native';

import { styles } from './styles';

export const SkeletonRow = () => (
  <View style={styles.card}>
    <View style={styles.icon} />
    <View style={styles.body}>
      <View style={[styles.line, styles.linePrimary]} />
      <View style={[styles.line, styles.lineSecondary]} />
    </View>
    <View style={styles.amount} />
  </View>
);
