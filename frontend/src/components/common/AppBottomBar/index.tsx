import React from 'react';

import { View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@theme/colors';

import type { AppBottomBarProps } from '../../../types/common.types';
import { styles } from './styles';

export const AppBottomBar = ({ children }: AppBottomBarProps) => (
  <SafeAreaView style={{ backgroundColor: colors.surface }} edges={['bottom']}>
    <View style={styles.bar}>{children}</View>
  </SafeAreaView>
);
