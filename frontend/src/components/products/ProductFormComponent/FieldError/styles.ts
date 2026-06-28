import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  fieldError: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 11.5,
    color: colors.danger,
    marginTop: -2,
  },
});
