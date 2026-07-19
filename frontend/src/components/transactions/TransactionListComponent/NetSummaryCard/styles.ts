import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  label: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  netValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginTop: 4,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 10,
  },
  chipText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12.5,
    fontWeight: '600',
  },
});
