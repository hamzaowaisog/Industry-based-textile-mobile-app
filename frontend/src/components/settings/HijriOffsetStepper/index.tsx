import React from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import type { HijriOffsetStepperProps } from '../../../types/settings.types';
import { styles } from './styles';

export const HijriOffsetStepper = ({
  hijriOffsetDays,
  saving,
  onIncrement,
  onDecrement,
}: HijriOffsetStepperProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('settings.hijriOffsetLabel')}</Text>
      <View style={styles.stepperRow}>
        <TouchableOpacity
          accessibilityLabel={t('settings.hijriOffsetDecrement')}
          disabled={saving}
          onPress={onDecrement}
          style={styles.stepperButton}
        >
          <Text style={styles.stepperButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.valueText}>{hijriOffsetDays}</Text>
        <TouchableOpacity
          accessibilityLabel={t('settings.hijriOffsetIncrement')}
          disabled={saving}
          onPress={onIncrement}
          style={styles.stepperButton}
        >
          <Text style={styles.stepperButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
