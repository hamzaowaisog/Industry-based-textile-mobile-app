import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ── Hero ──
  hero: {
    paddingHorizontal: 28,
    paddingBottom: 72,
    overflow: 'hidden',
  },
  orbTopRight: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.overlayWhite07,
  },
  orbBottomRight: {
    position: 'absolute',
    top: 80,
    right: -120,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.overlayWhite04,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.overlayWhite20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.overlayWhite25,
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  brandName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 22,
    fontWeight: '700',
    color: colors.textInverse,
    letterSpacing: -0.4,
  },
  brandTag: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    fontWeight: '600',
    color: colors.overlayWhite74,
    letterSpacing: 1.6,
    marginTop: 2,
  },
  heroText: {
    marginTop: 48,
  },
  heroTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 28,
    fontWeight: '700',
    color: colors.textInverse,
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  heroSubtitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    fontWeight: '500',
    color: colors.overlayWhite78,
    marginTop: 6,
  },

  // ── Form card ──
  formCardWrapper: {
    flex: 1,
    marginTop: -28,
  },
  formCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  formContent: {
    padding: 24,
    paddingTop: 28,
    gap: 24,
  },

  // ── Inputs ──
  inputWrapper: {
    gap: 6,
  },
  inputLabel: {
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    height: 50,
    paddingHorizontal: 14,
    gap: 10,
  },
  inputLeading: {
    width: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    height: '100%',
  },
  inputWithTrailing: {
    paddingRight: 4,
  },
  inputTrailing: {
    padding: 4,
  },
  inputRowError: {
    borderColor: colors.danger,
  },
  fieldError: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    color: colors.danger,
    marginTop: 2,
  },

  // ── Remember / Forgot ──
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -2,
  },
  rememberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rememberText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  forgotText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },

  // ── Error ──
  errorText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
    marginTop: -4,
  },

  // ── Primary button ──
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textInverse,
  },

  // ── Trust line ──
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 2,
  },
  trustText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },

  // ── OR divider ──
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  dividerText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1.2,
  },

  // ── Ghost button ──
  ghostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  ghostButtonText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },

  // ── Request access ──
  requestRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  requestText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  requestLink: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },

  versionText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
    fontWeight: '500',
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: 4,
  },
});
