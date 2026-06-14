import React from 'react';

import { Text } from 'react-native';

import type { FieldErrorProps } from '../../../../types/products.types';
import { styles } from './styles';

export const FieldError = ({ msg }: FieldErrorProps) =>
  msg ? <Text style={styles.fieldError}>{msg}</Text> : null;
