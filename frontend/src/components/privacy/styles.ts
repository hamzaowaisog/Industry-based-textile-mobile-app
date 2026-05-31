import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 18,
    color: colors.text,
    marginLeft: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 48,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  body: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
