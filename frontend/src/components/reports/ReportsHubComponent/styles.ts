import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -7,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.6,
    lineHeight: 34,
    marginTop: 8,
  },
  headerSub: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 4,
  },

  grid: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  cardWrap: {
    width: '47%',
  },
  cardBody: {
    minHeight: 172,
    gap: 14,
  },
  cardTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  cardDesc: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 'auto',
  },
  viewBtn: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 12,
    fontWeight: '700',
  },
  pdfBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.bgAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
