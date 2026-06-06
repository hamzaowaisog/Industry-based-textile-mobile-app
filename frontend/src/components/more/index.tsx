import React from 'react';

import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@theme/colors';

import { ArrowLeftIcon } from '@constants/svgAssets';

import type { MoreComponentProps, MoreItemConfig } from '../../types/notifications.types';
import { MoreTile } from './MoreTile';
import { styles } from './styles';

export const MoreComponent = ({
  items,
  profile,
  unreadCount,
  onBack,
  onTilePress,
}: MoreComponentProps) => {
  const { t } = useTranslation();

  const rows: MoreItemConfig[][] = [];
  for (let i = 0; i < items.length; i += 3) {
    rows.push(items.slice(i, i + 3));
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7} hitSlop={10}>
          <ArrowLeftIcon size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('more.title')}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile chip */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile.initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>
              {profile.name}
            </Text>
            <Text style={styles.profileEmail} numberOfLines={1}>
              {profile.email}
            </Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{profile.roleName}</Text>
            </View>
          </View>
        </View>

        {/* All tools section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>{t('more.allTools')}</Text>
        </View>

        {/* 3-column grid */}
        <View style={styles.grid}>
          {rows.map((row, rowIdx) => (
            <View key={rowIdx} style={styles.row}>
              {row.map((item) => (
                <MoreTile
                  key={item.key}
                  item={item}
                  onPress={onTilePress}
                  badge={item.key === 'notifications' ? unreadCount : undefined}
                />
              ))}
              {row.length === 1 && <View style={styles.phantom} />}
              {row.length === 1 && <View style={styles.phantom} />}
              {row.length === 2 && <View style={styles.phantom} />}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
