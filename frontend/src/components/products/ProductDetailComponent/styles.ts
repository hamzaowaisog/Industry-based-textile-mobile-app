import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBtnDisabled: { opacity: 0.5 },
  toolbarActions: { flexDirection: 'row', gap: 8 },

  scroll: { paddingHorizontal: 24, paddingBottom: 40, gap: 16 },

  identityBlock: { gap: 4, paddingTop: 4 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  productName: {
    flex: 1,
    fontFamily: typography.fontFamily.bold,
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  statusActive: { backgroundColor: colors.successLight },
  statusInactive: { backgroundColor: colors.bgAlt },
  statusText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    fontWeight: '600',
  },
  statusTextActive: { color: colors.success },
  statusTextInactive: { color: colors.textSecondary },
  skuText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },

  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCell: { width: '47.5%' },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  sectionLink: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },

  movementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  movementIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  movementBody: { flex: 1, gap: 2 },
  movementNote: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  movementDate: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  movementQty: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    fontWeight: '700',
  },

  noMovementsWrap: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noMovementsText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
});
