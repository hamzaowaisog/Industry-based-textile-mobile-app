import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
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
  headerSpacer: {
    width: 40,
    height: 40,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  headerSub: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 1,
  },

  // Step indicator
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 4,
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bgAlt,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepDotDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  stepDotText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 12,
    fontWeight: '700',
    color: colors.textTertiary,
  },
  stepDotTextActive: {
    color: colors.white,
  },
  stepLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  stepLabelActive: {
    color: colors.primary,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginBottom: 14,
    marginHorizontal: 4,
  },
  stepLineDone: {
    backgroundColor: colors.success,
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  stepContent: {
    gap: 16,
  },

  // Fields
  fieldGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  requiredStar: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    fontWeight: '600',
    color: colors.danger,
  },
  fieldError: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    color: colors.danger,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
  },
  selectRowError: {
    borderColor: colors.danger,
  },
  selectValue: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  selectPlaceholder: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textTertiary,
    flex: 1,
  },
  paymentTypeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentTypeBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentTypeBtnActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  paymentTypeTxt: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  paymentTypeTxtActive: {
    color: colors.primary,
  },
  textArea: {
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Step 2
  addLineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    backgroundColor: colors.primaryLight,
  },
  addLineTxt: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  runningTotalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    backgroundColor: colors.primaryLight,
    borderRadius: 14,
    padding: 16,
  },
  runningTotalLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  runningTotalValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.5,
  },

  // Step 3 review
  reviewClientCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  reviewClientLeft: {
    flex: 1,
  },
  reviewClientName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  reviewClientSub: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12.5,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 2,
  },
  reviewLinesCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  reviewLinesHeader: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  reviewLinesCount: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  reviewLineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
  },
  reviewLineRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  reviewLineName: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  reviewLineSub: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 2,
  },
  reviewLineTotal: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  reviewTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    padding: 14,
    backgroundColor: colors.bgAlt,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  reviewTotalLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  reviewTotalValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  reviewNotesCard: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reviewNotesText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  ghostBtn: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  primaryBtn: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  successBtn: {
    backgroundColor: colors.success,
    shadowColor: colors.success,
  },
  primaryBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
