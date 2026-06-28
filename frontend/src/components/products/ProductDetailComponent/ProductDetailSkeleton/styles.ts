import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';

export const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 24, paddingTop: 8, gap: 16 },
  header: { gap: 8 },
  chart: {
    height: 180,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: { width: '47.5%', gap: 6 },
  block: { backgroundColor: colors.bgAlt },
});
