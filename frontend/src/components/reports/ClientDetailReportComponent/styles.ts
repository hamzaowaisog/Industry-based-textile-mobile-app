import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 32, gap: 16 },

  loadingWrap: { paddingVertical: 60, alignItems: 'center' },
  emptyWrap: { paddingVertical: 60, alignItems: 'center', gap: 14 },
  emptyText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  pickBtn: {
    height: 44,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },

  clientCardWrap: {},
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clientTextWrap: { flex: 1 },
  clientName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  clientType: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12.5,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 2,
  },
  changeBtn: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },

  heroWrap: {},
  heroLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  heroSub: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 4,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    width: '47%',
  },

  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  tabBtn: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabBtnTextActive: {
    color: colors.primary,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 12,
    right: 12,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.primary,
  },
});
