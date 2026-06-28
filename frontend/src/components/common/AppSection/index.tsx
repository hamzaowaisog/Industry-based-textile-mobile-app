import React from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import type { AppSectionProps } from '../../../types/common.types';
import { styles } from './styles';

export const AppSection = ({ title, actionLabel, onAction }: AppSectionProps) => (
  <View style={styles.section}>
    <Text style={styles.title}>{title}</Text>
    {!!actionLabel && (
      <TouchableOpacity onPress={onAction}>
        <Text style={styles.action}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);
