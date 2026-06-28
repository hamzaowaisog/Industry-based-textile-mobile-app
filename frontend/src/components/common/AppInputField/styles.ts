import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  inputWrap: { gap: 6 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    height: 48,
    gap: 8,
  },
  inputRowFocused: { borderColor: colors.primary },
  inputRowError: { borderColor: colors.danger },
  inputRowDisabled: { backgroundColor: colors.bgAlt, opacity: 0.7 },
  inputRowMultiline: {
    height: undefined,
    minHeight: 80,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    color: colors.text,
    padding: 0,
  },
  inputMultiline: {
    minHeight: 56,
    textAlignVertical: 'top',
  },
  inputError: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    fontWeight: '500',
    color: colors.danger,
  },
  inputHelper: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
});
