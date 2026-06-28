import React from 'react';

import { ActivityIndicator, TouchableOpacity } from 'react-native';

import { PdfIcon } from '@constants/svgAssets';
import { colors } from '@theme/colors';

import type { PdfButtonProps } from '../../../types/common.types';
import { styles } from './styles';

export const PdfButton = ({ onPress, isLoading, size = 20, color }: PdfButtonProps) => (
  <TouchableOpacity style={styles.btn} onPress={onPress} activeOpacity={0.7} disabled={isLoading}>
    {isLoading ? (
      <ActivityIndicator size="small" color={color ?? colors.primary} />
    ) : (
      <PdfIcon size={size} color={color ?? colors.primary} />
    )}
  </TouchableOpacity>
);
