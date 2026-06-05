import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  cell: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  borderRight: {
    borderRightWidth: 1,
    borderRightColor: colors.divider,
    paddingRight: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingBottom: 18,
  },
  padLeft: {
    paddingLeft: 16,
  },
  padTop: {
    paddingTop: 18,
  },
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.4,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 3,
  },
  trendText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    fontWeight: '600',
  },
  trendVs: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
    fontWeight: '500',
    color: colors.textTertiary,
  },
});
