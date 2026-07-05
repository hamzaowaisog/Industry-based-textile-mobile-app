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
  heroBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.warning,
    borderWidth: 3,
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

  // ── Hero text ──
  heroText: {
    alignItems: 'center',
  },
  heroTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 26,
    fontWeight: '700',
    color: colors.textInverse,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    fontWeight: '500',
    color: colors.overlayWhite78,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
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

  // ── Step strip ──
  stepStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepItem: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: colors.bgAlt,
    alignItems: 'center',
    gap: 8,
  },
  stepIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  stepConnector: {
    width: 10,
    height: 1.5,
    backgroundColor: colors.border,
    borderRadius: 1,
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
