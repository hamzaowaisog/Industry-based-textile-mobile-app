import React from 'react';

import { Platform, Switch } from 'react-native';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';

import type { AppToggleProps } from '../../../types/common.types';

export const AppToggle = ({ value, onValueChange, disabled }: AppToggleProps) => (
  <Switch
    value={value}
    onValueChange={onValueChange}
    disabled={disabled}
    trackColor={{ false: colors.border, true: colors.primary }}
    thumbColor={colors.surface}
    ios_backgroundColor={colors.border}
    style={Platform.OS === AppConstants.PLATFORM.OS.ANDROID ? { transform: [{ scale: 0.95 }] } : undefined}
  />
);
