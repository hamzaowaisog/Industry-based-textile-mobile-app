import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 2,
  },
  option: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  optionActive: {
    backgroundColor: colors.primary,
  },
  optionText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  optionTextActive: {
    color: colors.surface,
  },
});
