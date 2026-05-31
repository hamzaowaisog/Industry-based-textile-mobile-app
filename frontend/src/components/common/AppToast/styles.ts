import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const toastStyles = {
  card: (borderColor: string) => ({
    borderLeftColor: borderColor,
    borderLeftWidth: 4,
    borderRadius: 14,
    height: undefined as number | undefined,
    paddingVertical: 12,
    paddingHorizontal: 12,
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    alignItems: 'flex-start' as const,
    width: 320 as number,
    alignSelf: 'flex-end' as const,
    marginRight: 16,
    backgroundColor: colors.surface,
  }),

  iconCircle: (bg: string) => ({
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: bg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 10,
    flexShrink: 0 as const,
  }),

  text1: StyleSheet.create({
    base: {
      fontFamily: typography.fontFamily.bold,
      fontSize: 14,
      fontWeight: '700' as const,
      color: colors.text,
    },
  }).base,

  text2: StyleSheet.create({
    base: {
      fontFamily: typography.fontFamily.medium,
      fontSize: 12.5,
      fontWeight: '500' as const,
      color: colors.textSecondary,
      marginTop: 2,
      lineHeight: 18,
    },
  }).base,
};

export const xIconStyles = StyleSheet.create({
  arm: {
    height: 2,
    backgroundColor: colors.textInverse,
    position: 'absolute',
  },
});
