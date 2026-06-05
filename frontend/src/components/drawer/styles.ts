import { StyleSheet } from 'react-native';

import { colors } from '@theme/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    paddingHorizontal: 22,
    paddingBottom: 20,
    flexShrink: 0,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  logoTile: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  brandText: {
    flex: 1,
  },
  brandName: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.4,
  },
  brandTag: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.70)',
    marginTop: 1,
  },
  userCard: {
    marginTop: 18,
    padding: 13,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.14)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.90)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  userRole: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 11.5,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.72)',
    marginTop: 1,
  },
  navList: {
    flex: 1,
  },
  navListContent: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
  },
  section: {
    marginBottom: 6,
  },
  sectionLabel: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textTertiary,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  sectionItems: {
    gap: 2,
  },
  navItem: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 11,
    paddingLeft: 20,
    paddingRight: 16,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  navItemActive: {
    backgroundColor: colors.primaryLight,
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: 9,
    bottom: 9,
    width: 4,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  navLabel: {
    flex: 1,
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.1,
  },
  navLabelActive: {
    fontFamily: 'Quicksand-Bold',
    fontWeight: '700',
    color: colors.primary,
  },
  footer: {
    flexShrink: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: 2,
  },
  signOutLabel: {
    flex: 1,
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 15,
    fontWeight: '600',
    color: colors.danger,
    letterSpacing: -0.1,
  },
  navItemDisabled: {
    opacity: 0.38,
  },
  signOutLabelDisabled: {
    color: colors.textTertiary,
  },
});
