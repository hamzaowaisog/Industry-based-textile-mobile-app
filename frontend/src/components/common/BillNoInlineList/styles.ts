import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  text: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  more: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    color: colors.primary,
    marginLeft: 4,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sheetTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 15,
    color: colors.text,
    marginBottom: 12,
  },
  sheetItem: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    color: colors.textSecondary,
    paddingVertical: 6,
  },
});
