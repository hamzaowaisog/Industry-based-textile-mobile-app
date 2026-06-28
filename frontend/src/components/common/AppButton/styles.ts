import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },

  size_sm: { height: 36, paddingHorizontal: 14 },
  size_md: { height: 44 },
  size_lg: { height: 52 },

  label: {
    fontFamily: typography.fontFamily.semibold,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  labelSize_sm: { fontSize: 13 },
  labelSize_md: { fontSize: 15 },
  labelSize_lg: { fontSize: 15 },

  container_primary: { backgroundColor: colors.primary },
  container_success: { backgroundColor: colors.success },
  container_danger: { backgroundColor: colors.danger },
  container_ghost: { backgroundColor: 'transparent', borderColor: colors.border },
  container_soft: { backgroundColor: colors.primaryLight },
  container_softDanger: { backgroundColor: colors.dangerLight },
  container_link: { backgroundColor: 'transparent' },
});

export const variantColors: Record<string, string> = {
  primary: colors.white,
  success: colors.white,
  danger: colors.white,
  ghost: colors.text,
  soft: colors.primary,
  softDanger: colors.danger,
  link: colors.primary,
};
