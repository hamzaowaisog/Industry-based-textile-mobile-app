import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  cardInner: {
    gap: 12,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  productTile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.bgAlt,
    borderRadius: 10,
    padding: 10,
    minHeight: 44,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  productSku: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.3,
    marginTop: 1,
  },
  productPlaceholder: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textTertiary,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
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
