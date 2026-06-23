import React from 'react';

import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import type { AppButtonProps } from '../../../types/common.types';
import { styles, variantColors } from './styles';

export const AppButton = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  Icon,
  disabled = false,
  loading = false,
}: AppButtonProps) => {
  const isDisabled = disabled || loading;
  const fg = variantColors[variant];

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[`size_${size}`],
        styles[`container_${variant}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator color={fg} size="small" />
      ) : (
        <View style={styles.content}>
          {Icon && <Icon size={size === 'sm' ? 14 : 18} color={fg} />}
          <Text
            style={[styles.label, styles[`labelSize_${size}`], { color: fg }]}
            numberOfLines={1}
          >
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
