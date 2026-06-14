import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';

export const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 24, gap: 10 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.bgAlt },
  body: { flex: 1, gap: 8 },
  line: { height: 12, borderRadius: 6, backgroundColor: colors.bgAlt },
  right: { width: 56, height: 36, borderRadius: 8, backgroundColor: colors.bgAlt },
});
