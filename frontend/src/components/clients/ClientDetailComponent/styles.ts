import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  // Gradient header
  gradientHeader: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    overflow: 'hidden',
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 66,
  },
  headerBackBtn: {
    width: 36,
    height: 36,
    marginLeft: -8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: { flexDirection: 'row', gap: 4 },
  headerActionBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 8,
  },
  headerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 20,
    fontWeight: '700',
    color: colors.surface,
  },
  headerName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 22,
    fontWeight: '700',
    color: colors.surface,
    letterSpacing: -0.4,
  },
  headerBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  headerBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerBadgeUnsaved: {
    backgroundColor: `${colors.warning}40`,
  },
  headerBadgeText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    fontWeight: '600',
    color: colors.surface,
  },

  // Summary stat chips in balance card
  statRow: { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap' },
  statChip: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 10,
    gap: 2,
  },
  statChipLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  statChipValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.1,
  },


  // Balance hero card (overlaps header)
  balanceCardWrap: { paddingHorizontal: 24, marginTop: -16 },
  balanceCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  balanceLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  balanceAmount: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.6,
    marginTop: 6,
  },
  balanceSub: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 4,
  },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
  },
  actionBtnGhost: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
  },
  actionBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    fontWeight: '700',
    color: colors.surface,
  },
  actionBtnGhostText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },

  // Contact section
  sectionPad: { paddingHorizontal: 24, paddingTop: 24 },
  sectionLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.2,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    paddingHorizontal: 16,
  },
  infoDivider: { height: 1, backgroundColor: colors.divider, marginHorizontal: 16 },
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoKey: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  infoVal: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },

  // Tabs
  tabsWrap: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  tabBtn: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  tabBtnActive: { borderBottomColor: colors.primary },
  tabText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: { color: colors.primary },
  tabContentScroll: { marginTop: 14 },
  tabContent: { gap: 10, paddingBottom: 8 },

  tabEmpty: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  tabEmptyText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    color: colors.textTertiary,
  },
});
