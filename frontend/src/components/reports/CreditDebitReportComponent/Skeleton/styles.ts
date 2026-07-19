import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';

export const styles = StyleSheet.create({
  line: {
    borderRadius: 6,
    backgroundColor: colors.bgAlt,
  },

  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  legendRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },

  totalsGrid: { flexDirection: 'row', gap: 16, marginTop: 16 },
  totalTile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },

  tableWrap: { marginTop: 16 },
  tableCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  tableRowLast: { borderBottomWidth: 0 },
});
