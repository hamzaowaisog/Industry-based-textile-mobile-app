import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ── Layout ──
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  // ── Top area ──
  topRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  switchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 999,
    backgroundColor: colors.bgAlt,
  },
  switchChipText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textSecondary,
  },

  // ── Center area ──
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },

  // ── Avatar ──
  avatarSection: {
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarInitials: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 26,
    fontWeight: '700',
    color: colors.textInverse,
    letterSpacing: 0.5,
  },
  avatarInfo: {
    alignItems: 'center',
  },
  signingInAs: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  userName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.4,
    marginTop: 4,
  },
  userEmail: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12.5,
    fontWeight: '500',
    color: colors.textTertiary,
    marginTop: 2,
  },

  // ── Fingerprint ──
  fingerprintSection: {
    position: 'relative',
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  ring: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1.5,
    borderColor: `${colors.primary}33`,
  },
  gradientCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.33,
    shadowRadius: 50,
    elevation: 8,
  },
  gradientCirclePending: {
    opacity: 0.55,
  },

  // ── Labels ──
  labelSection: {
    alignItems: 'center',
  },
  touchLabel: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  orLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 4,
  },

  // ── Error ──
  errorText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
    marginTop: 4,
  },

  // ── Bottom section ──
  bottomSection: {
    gap: 12,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotOnline: {
    backgroundColor: colors.success,
  },
  dotOffline: {
    backgroundColor: colors.danger,
  },
  onlineText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    fontWeight: '600',
    color: colors.success,
  },
  onlineTextOffline: {
    color: colors.danger,
  },

  // ── Ghost button ──
  ghostButton: {
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostButtonText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
});
