import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 32, gap: 16 },

  loadingWrap: { paddingVertical: 60, alignItems: 'center' },
  emptyWrap: { paddingVertical: 60, alignItems: 'center' },
  emptyText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },

  chartWrap: {},
  legendRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },

  totalsGrid: { flexDirection: 'row', gap: 16 },
  totalTile: { flex: 1 },
  totalLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },

  tableWrap: { gap: 10 },
  sectionTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: colors.bgAlt,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  tableHeaderCell: {
    flex: 1,
    fontFamily: typography.fontFamily.bold,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.4,
  },
  tableHeaderCellRight: { textAlign: 'right' },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  tableRowLast: { borderBottomWidth: 0 },
  tableCell: {
    flex: 1,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  tableCellRightWrap: { flex: 1, alignItems: 'flex-end' },
});
