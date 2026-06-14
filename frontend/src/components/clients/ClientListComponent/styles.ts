import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 36,
    marginLeft: -7,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  headerSub: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 4,
  },

  filterArea: { paddingHorizontal: 24, paddingBottom: 12, gap: 10 },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    height: 44,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },

  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.bgAlt,
    borderRadius: 10,
    padding: 3,
  },
  segBtn: {
    flex: 1,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  segBtnActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  segText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segTextActive: { color: colors.text },

  list: { paddingHorizontal: 24, paddingBottom: 100 },
  gap: { height: 10 },

  fab: {
    position: 'absolute',
    bottom: 80,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },

  noResultsWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 32,
  },
  noResultsTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  noResultsSub: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
