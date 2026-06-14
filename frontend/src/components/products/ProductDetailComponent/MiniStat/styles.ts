import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 8,
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  iconTile: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 11.5,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: -4,
  },
});
