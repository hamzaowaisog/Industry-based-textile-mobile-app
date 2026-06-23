import React from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { colors } from '@theme/colors';

import { ArrowRightIcon } from '@constants/svgAssets';

import type { AppRowProps } from '../../../types/common.types';
import { styles } from './styles';

export const AppRow = ({
  leading,
  primary,
  secondary,
  right,
  rightSub,
  onPress,
  chevron = true,
}: AppRowProps) => {
  const content = (
    <View style={styles.row}>
      {leading}
      <View style={styles.center}>
        <Text style={styles.primary} numberOfLines={1}>
          {primary}
        </Text>
        {!!secondary && (
          <Text style={styles.secondary} numberOfLines={1}>
            {secondary}
          </Text>
        )}
      </View>
      {(right || rightSub) && (
        <View style={styles.right}>
          {right}
          {!!rightSub && <Text style={styles.rightSub}>{rightSub}</Text>}
        </View>
      )}
      {chevron && onPress && <ArrowRightIcon size={18} color={colors.textTertiary} />}
    </View>
  );

  if (!onPress) return content;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      {content}
    </TouchableOpacity>
  );
};
