import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  nodesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  node: {
    alignItems: 'center',
    width: 72,
    gap: 8,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.divider,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  circleCurrent: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  circleText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  circleTextCurrent: {
    color: colors.white,
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: colors.divider,
    marginTop: 13,
    alignSelf: 'flex-start',
  },
  lineFilled: {
    backgroundColor: colors.success,
  },
  label: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  labelDone: {
    color: colors.success,
    fontFamily: typography.fontFamily.semibold,
    fontWeight: '600',
  },
  labelCurrent: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semibold,
    fontWeight: '600',
  },
});
