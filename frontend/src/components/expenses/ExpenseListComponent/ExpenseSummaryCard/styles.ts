import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  info: { flex: 1 },
  label: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.4,
  },
  total: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
    marginTop: 4,
  },
  meta: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 4,
  },
  legendWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
