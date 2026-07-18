import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  summaryWrap: { paddingHorizontal: 24, paddingBottom: 12 },
  summaryLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  summarySub: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textTertiary,
    marginTop: 4,
  },

  tabsWrap: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 12,
    gap: 8,
  },
  tabChip: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.bgAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabChipActive: {
    backgroundColor: colors.primary,
  },
  tabChipText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabChipTextActive: {
    color: colors.white,
  },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 12,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    color: colors.text,
  },

  chartWrap: { paddingHorizontal: 24, paddingBottom: 12 },
  chartTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },

  loadingWrap: { paddingVertical: 60, alignItems: 'center' },
  emptyWrap: { paddingVertical: 60, alignItems: 'center', gap: 12 },
  emptyText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },

  list: { paddingHorizontal: 24, paddingBottom: 32 },
  gap: { height: 10 },
});
