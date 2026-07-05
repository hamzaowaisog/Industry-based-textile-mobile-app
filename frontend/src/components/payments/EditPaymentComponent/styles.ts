import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadowBlack,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  headerSpacer: { width: 40, height: 40 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 24, gap: 18 },

  fieldGroup: { gap: 8 },
  fieldError: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    color: colors.danger,
  },
  modeRow: { flexDirection: 'row', gap: 8 },
  modeBtn: {
    flex: 1,
    height: 64,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  modeBtnActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  modeTxt: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  modeTxtActive: { color: colors.primary },

  bottomBarRow: { flexDirection: 'row', gap: 10, width: '100%' },
  flexBtn: { flex: 1 },
});
