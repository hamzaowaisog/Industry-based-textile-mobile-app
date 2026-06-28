import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  left: {
    flex: 1,
    minWidth: 0,
  },
  right: {
    alignItems: 'flex-end',
    gap: 6,
  },
  orderId: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: colors.textSecondary,
  },
  clientName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 3,
    letterSpacing: -0.2,
  },
  date: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 3,
  },
  progressWrap: {
    marginTop: 12,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.bgAlt,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  progressLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
