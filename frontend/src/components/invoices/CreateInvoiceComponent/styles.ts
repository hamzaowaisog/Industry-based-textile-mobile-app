import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  headerSpacer: { width: 40, height: 40 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  headerSub: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 2,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 24, gap: 20 },

  fieldGroup: { gap: 8 },
  fieldError: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    color: colors.danger,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 12,
  },
  selectRowError: { borderColor: colors.danger },
  selectBody: { flex: 1, gap: 2 },
  selectValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  selectPlaceholder: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 15,
    fontWeight: '500',
    color: colors.textTertiary,
  },

  linesSection: { gap: 12 },
  linesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linesCount: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textTertiary,
  },
  addLineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  addLineTxt: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  totalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  totalLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  totalValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.3,
  },

  bottomBarRow: { flexDirection: 'row', gap: 10, width: '100%' },
  flexBtn: { flex: 1 },
});
