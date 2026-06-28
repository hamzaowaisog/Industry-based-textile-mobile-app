import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  text: {
    flex: 1,
  },
  status: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    fontWeight: '700',
  },
  sub: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12.5,
    fontWeight: '500',
    color: colors.text,
    marginTop: 2,
  },
});
