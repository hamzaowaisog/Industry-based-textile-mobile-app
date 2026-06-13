import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    paddingTop: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  closeBtn: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 16,
    color: colors.textTertiary,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    height: 44,
    gap: 10,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 0,
  },
  list: {
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 8,
  },
  item: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 2,
  },
  itemBorder: {
    borderBottomWidth: 0,
  },
  itemSelected: {
    backgroundColor: colors.primary,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  itemNameSelected: {
    color: colors.white,
  },
  itemSub: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemSubSelected: {
    color: colors.white,
    opacity: 0.8,
  },
  emptyWrap: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
