import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    gap: 16,
  },

  // ── Header ──
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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

  // ── Loader ──
  loader: {
    marginTop: 40,
  },

  // ── Cards ──
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  cardTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rowText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },

  // ── Stat grid ──
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.bgAlt,
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  statHighlight: {
    backgroundColor: `${colors.success}15`,
  },
  statWarn: {
    backgroundColor: `${colors.warning}15`,
  },
  statValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  profitValue: {
    color: colors.success,
  },
  warnValue: {
    color: colors.warning,
  },
  statLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
  },

  // ── Operations ──
  opsGrid: {
    gap: 6,
  },

  // ── Alerts ──
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  alertDotWarn: {
    backgroundColor: colors.warning,
  },
  alertDotOk: {
    backgroundColor: colors.success,
  },

  // ── Monthly overview ──
  monthRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  monthLabel: {
    flex: 1,
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  monthSales: {
    flex: 1,
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
  },
  monthPurchases: {
    flex: 1,
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
  },
  monthProfit: {
    flex: 1,
    fontFamily: typography.fontFamily.bold,
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
    textAlign: 'right',
  },
  monthLoss: {
    color: colors.danger,
  },

  // ── Recent orders ──
  orderRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 2,
  },
  orderClient: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  orderMeta: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },

  // ── Logout ──
  logoutButton: {
    backgroundColor: colors.danger,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutButtonText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textInverse,
  },
});
