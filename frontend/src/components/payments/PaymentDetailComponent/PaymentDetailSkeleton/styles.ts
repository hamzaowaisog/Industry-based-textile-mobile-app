import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgAlt,
  },

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
  heroNavActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 32,
  },

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

  section: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  skelLine: {
    backgroundColor: colors.bgAlt,
  },

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

  allocCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  allocRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

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
  primaryBtnSkel: {
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.bgAlt,
  },
});
