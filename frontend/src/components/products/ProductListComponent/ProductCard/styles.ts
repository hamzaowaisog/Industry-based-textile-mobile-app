import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  name: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.1,
  },
  sku: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.4,
  },
  right: {
    alignItems: 'flex-end',
    gap: 3,
    flexShrink: 0,
  },
  stockQty: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  subLine: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
    fontWeight: '500',
    color: colors.textTertiary,
    letterSpacing: 0.2,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 11,
    fontWeight: '700',
  },
});
