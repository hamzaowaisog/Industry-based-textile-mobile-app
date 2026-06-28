import { StyleSheet } from 'react-native';

import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  label: {
    fontFamily: typography.fontFamily.bold,
    fontWeight: '700',
  },
});
