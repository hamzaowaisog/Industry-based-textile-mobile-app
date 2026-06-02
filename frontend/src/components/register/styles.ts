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
    paddingBottom: 40,
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
  orbBottomLeft: {
    position: 'absolute',
    bottom: 20,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.overlayWhite04,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.overlayWhite18,
    borderWidth: 1,
    borderColor: colors.overlayWhite25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  // ── Hero icon ──
  heroIconArea: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  heroRingOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.overlayWhite12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRingInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.overlayWhite18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadgeText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textInverse,
  },
  heroIconCore: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.overlayWhite22,
    borderWidth: 1.5,
    borderColor: colors.overlayWhite35,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },

  // ── Hero text ──
  heroText: {
    alignItems: 'center',
  },
  heroTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 22,
    fontWeight: '700',
    color: colors.textInverse,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
    fontWeight: '500',
    color: colors.overlayWhite78,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
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
    padding: 20,
    paddingTop: 24,
    gap: 14,
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
    paddingRight: 8,
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

  // ── Primary button ──
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 12,
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

  // ── Sign in row ──
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  signInLink: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});
