import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    fontWeight: '700',
    color: colors.surface,
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
  right: { alignItems: 'flex-end', gap: 2 },
  balanceAmount: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  balanceLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  settledText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
    color: colors.textTertiary,
  },
});
