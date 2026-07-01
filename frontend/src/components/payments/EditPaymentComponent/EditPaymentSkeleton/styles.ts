import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';

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
  },
  headerSpacer: { width: 40, height: 40 },
  headerCenter: { flex: 1, alignItems: 'center' },
  skelLine: { backgroundColor: colors.bgAlt },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  fieldGroup: {
    gap: 8,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeBtn: {
    flex: 1,
    height: 64,
    borderRadius: 12,
    backgroundColor: colors.bgAlt,
  },
  bottomBar: {
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.bgAlt,
    marginHorizontal: 24,
    marginBottom: 8,
  },
});
