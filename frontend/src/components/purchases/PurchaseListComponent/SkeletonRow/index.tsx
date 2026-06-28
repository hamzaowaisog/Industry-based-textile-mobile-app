import React from 'react';

import { View } from 'react-native';

import { styles } from './styles';

export const SkeletonRow = () => (
  <View style={styles.card}>
    <View style={styles.left}>
      <View style={[styles.line, styles.lineId]} />
      <View style={[styles.line, styles.lineSupplier]} />
      <View style={[styles.line, styles.lineDate]} />
    </View>
    <View style={styles.right} />
  </View>
);
