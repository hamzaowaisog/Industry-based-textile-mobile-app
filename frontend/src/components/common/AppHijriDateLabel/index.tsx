import React from 'react';

import { Text } from 'react-native';

import { useTranslation } from 'react-i18next';

import { getHijriDisplay } from '@utils/helpers/hijriDate';

import type { AppHijriDateLabelProps } from '../../../types/common.types';
import { styles } from './styles';

export const AppHijriDateLabel = ({ value }: AppHijriDateLabelProps) => {
  const { t } = useTranslation();

  return <Text style={styles.text}>{getHijriDisplay(value, t('common.hijriDateFallBack'))}</Text>;
};
