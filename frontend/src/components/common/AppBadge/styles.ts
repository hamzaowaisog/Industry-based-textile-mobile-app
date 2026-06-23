import { StyleSheet } from 'react-native';

import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  badge: {
    borderRadius: 8,
  },
  size_sm: { paddingHorizontal: 8, paddingVertical: 3 },
  size_md: { paddingHorizontal: 10, paddingVertical: 4 },
  label: {
    fontFamily: typography.fontFamily.semibold,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  labelSize_sm: { fontSize: 11 },
  labelSize_md: { fontSize: 11.5 },
});
