import { useCallback } from 'react';

import { FlatList, RefreshControl, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PdfButton } from '@components/common/PdfButton';

import { USER_FILTER_OPTIONS } from '@utils/helpers/userContent';

import { colors } from '@theme/colors';

import { MenuIcon, PlusIcon, SearchIcon } from '@constants/svgAssets';

import type { UserListComponentProps, UserRow } from '../../../types/users.types';
import { EmptyState } from './EmptyState';
import { styles } from './styles';
import { UserListSkeleton } from './UserListSkeleton';
import { UserRowCard } from './UserRowCard';

export const UserListComponent = ({
  users,
  totalCount,
  filter,
  search,
  loading,
  refreshing,
  onFilterChange,
  onSearchChange,
  onRowPress,
  onRefresh,
  onFab,
  onMenuPress,
  onAddFirstUser,
  onListPdfPress,
  isPdfDownloading,
}: UserListComponentProps) => {
  const { t } = useTranslation();

  const renderItem = useCallback(
    ({ item }: { item: UserRow }) => <UserRowCard item={item} onPress={onRowPress} />,
    [onRowPress],
  );

  const renderSeparator = useCallback(() => <View style={styles.gap} />, []);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={onMenuPress} activeOpacity={0.7}>
            <MenuIcon size={23} color={colors.text} />
          </TouchableOpacity>
          <PdfButton
            onPress={onListPdfPress}
            isLoading={isPdfDownloading}
            size={20}
            color={colors.textSecondary}
          />
        </View>
        <Text style={styles.headerTitle}>{t('users.title')}</Text>
        <Text style={styles.headerSub}>
          {filter !== 'all' || search.trim().length > 0
            ? t('users.matchCount', { count: users.length })
            : t('users.totalCount', { count: totalCount })}
        </Text>
      </View>

      <View style={styles.filterArea}>
        <View style={styles.searchRow}>
          <SearchIcon size={18} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('users.searchPlaceholder')}
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={onSearchChange}
            returnKeyType="search"
          />
        </View>

        <View style={styles.segmented}>
          {USER_FILTER_OPTIONS.map((opt) => {
            const active = filter === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.segBtn, active && styles.segBtnActive]}
                onPress={() => onFilterChange(opt.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.segText, active && styles.segTextActive]}>
                  {t(opt.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {loading ? (
        <UserListSkeleton />
      ) : users.length === 0 && !search ? (
        <EmptyState onAddFirstUser={onAddFirstUser} />
      ) : users.length === 0 && search ? (
        <View style={styles.noResultsWrap}>
          <Text style={styles.noResultsTitle}>{t('common.noResults')}</Text>
          <Text style={styles.noResultsSub}>{t('common.noResultsSub', { query: search })}</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={renderSeparator}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={onFab} activeOpacity={0.85}>
        <PlusIcon size={24} color={colors.surface} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};
