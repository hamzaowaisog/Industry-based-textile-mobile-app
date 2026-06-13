import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Error header
  errorHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  // Fixed nav bar (outside scroll, same bg as hero)
  heroNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  heroNavBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  // Scroll
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // Hero body (inside scroll — scrolls away)
  heroBody: {
    paddingHorizontal: 24,
    paddingBottom: 56,
    paddingTop: 4,
    gap: 2,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  heroOrderId: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 0.4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.surface,
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  statusPillText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 12,
    fontWeight: '700',
  },
  heroClientName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  heroAmount: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 34,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.8,
    marginTop: 6,
  },
  heroAmountLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Floating stat cards — overlap hero via negative margin
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 20,
    marginTop: -40,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 5,
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  statLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 10,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  statValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },

  // Progress track
  progressSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  progressTrack: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  progressNodesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  progressNode: {
    alignItems: 'center',
    width: 72,
    gap: 8,
  },
  progressCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.divider,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircleDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.divider,
    marginTop: 13,
    alignSelf: 'flex-start',
  },
  progressLineFilled: {
    backgroundColor: colors.success,
  },
  progressLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  progressLabelDone: {
    color: colors.success,
    fontFamily: typography.fontFamily.semibold,
    fontWeight: '600',
  },

  // Cancelled banner
  cancelledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.dangerLight,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cancelledText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    fontWeight: '600',
    color: colors.danger,
    flex: 1,
  },

  // Content sections
  section: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Client + dates card
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  clientSub: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 2,
  },
  dateGrid: {
    flexDirection: 'row',
  },
  dateCell: {
    flex: 1,
    padding: 16,
  },
  dateCellRight: {
    borderLeftWidth: 1,
    borderLeftColor: colors.divider,
  },
  dateCellLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  dateCellValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },

  // Lines card — inner scroll capped at ~5 items
  linesScroll: {
    maxHeight: 260,
  },
  linesCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  // Notes card
  notesCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  notesText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 20,
  },

  // States
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  emptySub: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Bottom bar
  bottomBar: {
    flexDirection: 'column',
    gap: 10,
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  ghostBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  ghostBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  ghostBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  cancelBtn: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  cancelBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    fontWeight: '700',
    color: colors.danger,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
