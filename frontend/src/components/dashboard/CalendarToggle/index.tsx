import React from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import type { CalendarToggleProps } from '../../../types/common.types';
import { styles } from './styles';

export const CalendarToggle = ({ calendar, onChange }: CalendarToggleProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.option, calendar === 'gregorian' && styles.optionActive]}
        onPress={() => onChange('gregorian')}
        activeOpacity={0.7}
      >
        <Text style={[styles.optionText, calendar === 'gregorian' && styles.optionTextActive]}>
          {t('common.calendarGregorian')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.option, calendar === 'hijri' && styles.optionActive]}
        onPress={() => onChange('hijri')}
        activeOpacity={0.7}
      >
        <Text style={[styles.optionText, calendar === 'hijri' && styles.optionTextActive]}>
          {t('common.calendarHijri')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
