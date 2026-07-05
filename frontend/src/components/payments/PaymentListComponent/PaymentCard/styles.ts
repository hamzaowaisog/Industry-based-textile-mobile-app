import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  reversed: { opacity: 0.55 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  info: { flex: 1, minWidth: 0 },
  name: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  sub: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 2,
  },
  right: { alignItems: 'flex-end', gap: 6 },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  reference: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
    fontWeight: '500',
    color: colors.textTertiary,
    letterSpacing: 0.2,
  },
});
