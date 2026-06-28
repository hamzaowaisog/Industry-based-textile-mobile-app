import React from 'react';

import { Text } from 'react-native';

import { formatAmount } from '@utils/helpers/formatCurrency';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';

import type { AppAmountProps } from '../../../types/common.types';
import { styles } from './styles';

const TONE_COLOR: Record<NonNullable<AppAmountProps['tone']>, string> = {
  credit: colors.success,
  debit: colors.danger,
  neutral: colors.text,
  primary: colors.primary,
};

export const AppAmount = ({
  value,
  tone = 'neutral',
  size = 15,
  prefix = AppConstants.APP.CURRENCY + ' ',
}: AppAmountProps) => (
  <Text style={[styles.amount, { color: TONE_COLOR[tone], fontSize: size }]} numberOfLines={1}>
    {prefix}
    {formatAmount(value)}
  </Text>
);
