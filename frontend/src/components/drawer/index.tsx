import React from 'react';

import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getInitials } from '@utils/helpers/textHelpers';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';
import { DRAWER_NAV } from '@constants/drawerConfig';
import {
  BarChartIcon,
  BoxIcon,
  CoinsIcon,
  CreditCardIcon,
  FileTextIcon,
  HomeIcon,
  LogOutIcon,
  LogoIcon,
  ReceiptIcon,
  SettingsIcon,
  ShoppingBagIcon,
  TagIcon,
  TruckIcon,
  UserIcon,
  UsersIcon,
} from '@constants/svgAssets';

import type {
  DrawerComponentProps,
  DrawerIconName,
  DrawerNavItem,
  NavItemRowProps,
} from '../../types/drawer.types';
import { styles } from './styles';

const ICON_MAP: Record<
  DrawerIconName,
  React.FC<{ size: number; color: string; strokeWidth: number }>
> = {
  home: HomeIcon,
  users: UsersIcon,
  'shopping-bag': ShoppingBagIcon,
  box: BoxIcon,
  truck: TruckIcon,
  'credit-card': CreditCardIcon,
  'file-text': FileTextIcon,
  receipt: ReceiptIcon,
  tag: TagIcon,
  coins: CoinsIcon,
  'bar-chart': BarChartIcon,
  user: UserIcon,
  settings: SettingsIcon,
  'log-out': LogOutIcon,
};

const NavItemRow = ({ item, isActive, onPress }: NavItemRowProps) => {
  const { t } = useTranslation();
  const IconComponent = ICON_MAP[item.icon];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.navItem, isActive && styles.navItemActive]}
    >
      {isActive && <View style={styles.activeBar} />}
      <IconComponent
        size={21}
        color={isActive ? colors.primary : colors.textSecondary}
        strokeWidth={isActive ? 2 : 1.8}
      />
      <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{t(item.labelKey)}</Text>
    </TouchableOpacity>
  );
};

export const DrawerComponent = ({
  activeRoute,
  userName,
  roleId,
  onNavigate,
  onSettings,
  onSignOut,
}: DrawerComponentProps) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const isAdmin = roleId === AppConstants.ROLES.ADMIN;
  const initials = getInitials(userName ?? '?');
  const roleLabel = isAdmin ? t('drawer.roleAdmin') : t('drawer.roleStaff');

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.brandRow}>
          <View style={styles.logoTile}>
            <LogoIcon size={26} color={colors.white} />
          </View>
          <View style={styles.brandText}>
            <Text style={styles.brandName}>{AppConstants.APP.NAME}</Text>
            <Text style={styles.brandTag}>{t('drawer.companyTagline')}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={onSettings} activeOpacity={0.8} style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userRole}>{roleLabel}</Text>
          </View>
          <SettingsIcon size={18} color="rgba(255,255,255,0.85)" strokeWidth={1.8} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.navList}
        contentContainerStyle={styles.navListContent}
        showsVerticalScrollIndicator={false}
      >
        {DRAWER_NAV.map((section) => {
          const visibleItems = section.items.filter(
            (item: DrawerNavItem) => !item.adminOnly || isAdmin,
          );
          if (visibleItems.length === 0) return null;

          return (
            <View key={section.sectionKey} style={styles.section}>
              <Text style={styles.sectionLabel}>{t(`drawer.sections.${section.sectionKey}`)}</Text>
              <View style={styles.sectionItems}>
                {visibleItems.map((item: DrawerNavItem) => (
                  <NavItemRow
                    key={item.id}
                    item={item}
                    isActive={activeRoute === item.id}
                    onPress={() => onNavigate(item.id)}
                  />
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          onPress={onSettings}
          activeOpacity={0.7}
          style={[
            styles.navItem,
            activeRoute === AppConstants.SCREENS.MAIN.SETTINGS_STACK && styles.navItemActive,
          ]}
        >
          {activeRoute === AppConstants.SCREENS.MAIN.SETTINGS_STACK && <View style={styles.activeBar} />}
          <SettingsIcon
            size={21}
            color={
              activeRoute === AppConstants.SCREENS.MAIN.SETTINGS_STACK
                ? colors.primary
                : colors.textSecondary
            }
            strokeWidth={activeRoute === AppConstants.SCREENS.MAIN.SETTINGS_STACK ? 2 : 1.8}
          />
          <Text
            style={[
              styles.navLabel,
              activeRoute === AppConstants.SCREENS.MAIN.SETTINGS_STACK && styles.navLabelActive,
            ]}
          >
            {t('drawer.footer.settings')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onSignOut} activeOpacity={0.7} style={styles.navItem}>
          <LogOutIcon size={21} color={colors.danger} strokeWidth={1.8} />
          <Text style={styles.signOutLabel}>{t('drawer.footer.signOut')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
