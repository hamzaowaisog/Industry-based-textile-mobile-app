import React from 'react';

import { FlatList, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@theme/colors';

import { ArrowLeftIcon, BellIcon, CheckIcon } from '@constants/svgAssets';

import type {
  NotificationCenterComponentProps,
  NotificationItem,
} from '../../types/notifications.types';
import { NotificationRow } from './NotificationRow';
import { NotificationSkeleton } from './NotificationSkeleton';
import { styles } from './styles';

export const NotificationsComponent = ({
  items,
  isLoading,
  unreadCount,
  onBack,
  onMarkAllRead,
  onRowPress,
  onRowDelete,
}: NotificationCenterComponentProps) => {
  const { t } = useTranslation();

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <NotificationRow item={item} onPress={onRowPress} onDelete={onRowDelete} />
  );

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeftIcon size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('notifications.title')}</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={onMarkAllRead} activeOpacity={0.7}>
            <Text style={styles.markAll}>{t('notifications.markAllRead')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80 }} />
        )}
      </View>

      {isLoading ? (
        <NotificationSkeleton />
      ) : items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIconBubble}>
            <BellIcon size={58} color={colors.success} />
            <View style={styles.emptyCheckBadge}>
              <CheckIcon size={20} color={colors.surface} />
            </View>
          </View>
          <View style={styles.emptyTextWrap}>
            <Text style={styles.emptyTitle}>{t('notifications.emptyTitle')}</Text>
            <Text style={styles.emptySub}>{t('notifications.emptySubtext')}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.emptySettings}>{t('notifications.emptySettings')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};
