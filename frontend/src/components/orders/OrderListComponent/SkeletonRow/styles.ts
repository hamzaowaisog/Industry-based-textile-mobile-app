import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  left: { flex: 1, gap: 8 },
  line: { height: 11, borderRadius: 6, backgroundColor: colors.bgAlt },
  lineOrder: { width: '40%' },
  lineClient: { width: '65%', height: 14 },
  lineDate: { width: '50%' },
  right: { width: 70, height: 44, borderRadius: 10, backgroundColor: colors.bgAlt },
});
