import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  line: { borderRadius: 6, backgroundColor: colors.bgAlt },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },

  content: { paddingHorizontal: 24, paddingBottom: 32 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  sectionPad: { paddingTop: 24 },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    paddingHorizontal: 16,
  },
  infoDivider: { height: 1, backgroundColor: colors.divider, marginHorizontal: 16 },
});
