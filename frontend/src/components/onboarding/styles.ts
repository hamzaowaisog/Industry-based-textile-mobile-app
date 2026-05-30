import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoMini: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    color: colors.text,
    letterSpacing: -0.3,
    fontWeight: '600',
  },
  skipButton: {
    backgroundColor: colors.bgAlt,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  skipText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 16,
  },
  illustrationBlock: {
    margin: 20,
    height: 280,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  textBlock: {
    paddingHorizontal: 28,
  },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 36,
    color: colors.text,
    lineHeight: 42,
    letterSpacing: -0.5,
    fontWeight: '600',
  },
  body: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 10,
    lineHeight: 22,
    fontWeight: '500',
  },
  pointsList: {
    paddingHorizontal: 28,
    paddingTop: 20,
    gap: 10,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.success + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    color: colors.text,
    flex: 1,
    fontWeight: '500',
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: colors.background,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 28,
    backgroundColor: colors.primary,
  },
  dotInactive: {
    width: 8,
    backgroundColor: colors.border,
  },
  counter: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 12,
    color: colors.textSecondary,
    letterSpacing: 0.4,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    color: '#fff',
  },
});
