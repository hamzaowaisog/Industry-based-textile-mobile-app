import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';

export const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 24 },
  row: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.bgAlt },
  body: { flex: 1, gap: 8 },
  line: { height: 12, borderRadius: 6, backgroundColor: colors.bgAlt },
  lineWide: { width: '60%' },
  lineNarrow: { width: '40%' },
  right: { width: 60, height: 30, borderRadius: 8, backgroundColor: colors.bgAlt },
});
