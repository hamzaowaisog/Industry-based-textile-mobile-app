import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  cardInner: {
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lineIndex: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 0.4,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  lineTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  lineTotalLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
