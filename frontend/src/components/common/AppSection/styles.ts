import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  section: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  title: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
    color: colors.text,
  },
  action: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
});
