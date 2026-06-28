import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';

export const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
  },
  elevated: {
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tone_surface: { backgroundColor: colors.surface },
  tone_primaryLight: { backgroundColor: colors.primaryLight },
  tone_successLight: { backgroundColor: colors.successLight },
  tone_warningLight: { backgroundColor: colors.warningLight },
  tone_dangerLight: { backgroundColor: colors.dangerLight },
});
