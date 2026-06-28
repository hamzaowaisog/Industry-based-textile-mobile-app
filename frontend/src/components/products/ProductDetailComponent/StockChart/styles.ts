import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stockValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  unitLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  subLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 2,
  },
  trendWrap: {
    alignItems: 'flex-end',
    gap: 3,
  },
  trendBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  trendText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 12,
    fontWeight: '700',
  },
  trendCaption: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 10,
    fontWeight: '500',
    color: colors.textTertiary,
  },
  chartWrap: {
    overflow: 'hidden',
    marginLeft: -4,
  },
  yAxisText: {
    color: colors.textTertiary,
    fontSize: 10,
    fontFamily: typography.fontFamily.medium,
  },
  noDataWrap: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noData: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
    color: colors.textTertiary,
  },
});
