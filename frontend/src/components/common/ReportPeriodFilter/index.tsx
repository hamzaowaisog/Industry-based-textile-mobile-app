import React from 'react';

import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';

import type { ReportPeriodFilterProps } from '../../../types/reports.types';
import { styles } from './styles';

const MONTH_KEYS = [
  'reports.filter.months.jan',
  'reports.filter.months.feb',
  'reports.filter.months.mar',
  'reports.filter.months.apr',
  'reports.filter.months.may',
  'reports.filter.months.jun',
  'reports.filter.months.jul',
  'reports.filter.months.aug',
  'reports.filter.months.sep',
  'reports.filter.months.oct',
  'reports.filter.months.nov',
  'reports.filter.months.dec',
];

export const ReportPeriodFilter = ({
  filter,
  years,
  onYearChange,
  onMonthChange,
}: ReportPeriodFilterProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        <TouchableOpacity
          style={[styles.chip, !filter.year && styles.chipActive]}
          onPress={() => onYearChange(undefined)}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipText, !filter.year && styles.chipTextActive]}>
            {t('reports.filter.allTime')}
          </Text>
        </TouchableOpacity>
        {years.map((year) => {
          const isActive = filter.year === year;
          return (
            <TouchableOpacity
              key={year}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onYearChange(year)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{year}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {!!filter.year && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          <TouchableOpacity
            style={[styles.chip, !filter.month && styles.chipActive]}
            onPress={() => onMonthChange(undefined)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, !filter.month && styles.chipTextActive]}>
              {t('reports.filter.allMonths')}
            </Text>
          </TouchableOpacity>
          {MONTH_KEYS.map((key, i) => {
            const monthNum = i + 1;
            const isActive = filter.month === monthNum;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => onMonthChange(monthNum)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{t(key)}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};
