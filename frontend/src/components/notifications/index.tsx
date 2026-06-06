import React from 'react';

import { FlatList, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@theme/colors';

import { ArrowLeftIcon, BellIcon } from '@constants/svgAssets';

import type {
  NotificationCenterComponentProps,
  NotificationItem,
} from '../../types/notifications.types';
import { NotificationRow } from './NotificationRow';
import { styles } from './styles';

export const NotificationsComponent = ({
  items,
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

      {items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <BellIcon size={56} color={colors.divider} />
          <Text style={styles.emptyTitle}>{t('notifications.emptyTitle')}</Text>
          <Text style={styles.emptySub}>{t('notifications.emptySubtext')}</Text>
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
