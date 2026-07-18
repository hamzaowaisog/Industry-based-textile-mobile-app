import React from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { colors } from '@theme/colors';

import { ArrowLeftIcon } from '@constants/svgAssets';

import type { ReportScreenHeaderProps } from '../../../types/reports.types';
import { styles } from './styles';

export const ReportScreenHeader = ({ title, subtitle, onBack, right }: ReportScreenHeaderProps) => (
  <View style={styles.header}>
    <View style={styles.row}>
      <TouchableOpacity style={styles.iconBtn} onPress={onBack} activeOpacity={0.7}>
        <ArrowLeftIcon size={20} color={colors.text} />
      </TouchableOpacity>
      <View style={styles.titleWrap}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {!!subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {!!right && <View style={styles.rightWrap}>{right}</View>}
    </View>
  </View>
);
