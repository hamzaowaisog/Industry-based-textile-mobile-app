import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgAlt,
  },

  // Nav
  heroNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.bgAlt,
  },
  heroNavBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    opacity: 0.5,
  },

  // Scroll
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // Hero body
  heroBody: {
    backgroundColor: colors.bgAlt,
    paddingHorizontal: 24,
    paddingBottom: 56,
    paddingTop: 4,
    gap: 6,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statusPillSkel: {
    width: 94,
    height: 28,
    borderRadius: 20,
    backgroundColor: colors.surface,
    opacity: 0.6,
  },

  // Floating stat cards
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
    gap: 6,
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },

  // Progress track
  progressSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  progressCard: {
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
  progressCircleSkel: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bgAlt,
  },
  progressLineSkel: {
    flex: 1,
    height: 2,
    backgroundColor: colors.bgAlt,
    marginTop: 13,
    alignSelf: 'flex-start',
  },

  // Sections
  section: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  skelLine: {
    backgroundColor: colors.bgAlt,
  },

  // Client card
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
    backgroundColor: colors.bgAlt,
  },
  clientInfo: {
    flex: 1,
    gap: 8,
  },
  dateGrid: {
    flexDirection: 'row',
  },
  dateCell: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
  dateCellRight: {
    borderLeftWidth: 1,
    borderLeftColor: colors.divider,
  },

  // Lines card
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
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  indexCircleSkel: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: colors.bgAlt,
    flexShrink: 0,
  },
  lineLeft: {
    flex: 1,
    gap: 6,
  },
  lineDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: 14,
  },

  // Bottom bar
  bottomBar: {
    flexDirection: 'column',
    gap: 10,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  ghostBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  ghostBtnSkel: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.bgAlt,
  },
  primaryBtnSkel: {
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.bgAlt,
  },
});
