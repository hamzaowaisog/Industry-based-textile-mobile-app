import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  info: { flex: 1, minWidth: 0 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  number: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.4,
  },
  client: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginTop: 3,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 8,
  },
  due: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12.5,
    fontWeight: '500',
    color: colors.textSecondary,
    flexShrink: 1,
  },
  dueOverdue: {
    color: colors.danger,
    fontFamily: typography.fontFamily.bold,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  viewBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.violetLight,
  },
  viewBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
    fontWeight: '700',
    color: colors.violet,
  },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgAlt,
  },
});
