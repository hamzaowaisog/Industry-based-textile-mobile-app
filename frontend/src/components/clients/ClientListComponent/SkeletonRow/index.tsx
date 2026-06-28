import React from 'react';

import { View } from 'react-native';

import { styles } from './styles';

export const SkeletonRow = () => (
  <View style={styles.row}>
    <View style={styles.avatar} />
    <View style={styles.body}>
      <View style={[styles.line, styles.lineWide]} />
      <View style={[styles.line, styles.lineNarrow]} />
    </View>
    <View style={styles.right} />
  </View>
);
