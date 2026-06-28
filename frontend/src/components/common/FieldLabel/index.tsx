import React from 'react';

import { Text, View } from 'react-native';

import type { FieldLabelProps } from '../../../types/common.types';
import { styles } from './styles';

export const FieldLabel = ({ label, required = false }: FieldLabelProps) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    {required ? <Text style={styles.requiredStar}> *</Text> : null}
  </View>
);
