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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.overlayWhite18,
    borderWidth: 1,
    borderColor: colors.overlayWhite25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  // ── Hero icon ──
  heroIconArea: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  heroRingOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.overlayWhite12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRingInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.overlayWhite18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIconCore: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: colors.overlayWhite22,
    borderWidth: 1.5,
    borderColor: colors.overlayWhite35,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  heroBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.success,
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadgeText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 12,
    color: colors.textInverse,
  },

  // ── Hero text ──
  heroText: {
    alignItems: 'center',
  },
  heroTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 26,
    color: colors.textInverse,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    color: colors.overlayWhite78,
    marginTop: 6,
    textAlign: 'center',
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
    gap: 20,
  },

  // ── Password rules ──
  rulesBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  rulesTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    color: colors.primary,
    marginBottom: 2,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ruleDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  ruleDotMet: {
    backgroundColor: colors.success,
  },
  ruleText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  ruleTextMet: {
    color: colors.success,
  },

  // ── Primary button ──
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: colors.textInverse,
  },

  // ── Back to login ──
  backToLogin: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backToLoginText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  backToLoginLink: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
    color: colors.primary,
  },
});
