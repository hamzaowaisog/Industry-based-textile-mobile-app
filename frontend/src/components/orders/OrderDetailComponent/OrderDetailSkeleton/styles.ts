import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 4,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: colors.bgAlt,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  skelLine: {
    borderRadius: 6,
    backgroundColor: colors.bgAlt,
  },
  // Status banner
  bannerCard: {
    height: 52,
    borderRadius: 14,
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
    justifyContent: 'space-between',
    padding: 14,
    gap: 12,
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
  // Financial summary
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
