import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';

export const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.bgAlt,
  },
  body: { flex: 1, gap: 8 },
  line: {
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.bgAlt,
  },
  linePrimary: { width: '70%' },
  lineSecondary: { width: '45%' },
  amount: {
    width: 64,
    height: 16,
    borderRadius: 6,
    backgroundColor: colors.bgAlt,
  },
});
