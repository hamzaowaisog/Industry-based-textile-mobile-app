import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  requiredStar: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    fontWeight: '600',
    color: colors.danger,
  },
});
