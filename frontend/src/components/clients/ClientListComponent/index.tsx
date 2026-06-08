import { useEffect, useRef } from 'react';

import {
  Animated,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@theme/colors';
import { MenuIcon, SearchIcon, PlusIcon, UsersIcon, TrashIcon } from '@constants/svgAssets';

import type { ClientFilter, ClientListComponentProps, ClientRow } from '../../../types/clients.types';
import { formatPKR } from '@utils/helpers/clientMappers';
import { styles } from './styles';

const FILTER_OPTIONS: { value: ClientFilter; labelKey: string }[] = [
  { value: 'all', labelKey: 'clients.filterAll' },
  { value: 'customers', labelKey: 'clients.filterCustomers' },
  { value: 'suppliers', labelKey: 'clients.filterSuppliers' },
];

const ClientRowCard = ({
  item,
  onPress,
  onDelete,
}: {
  item: ClientRow;
  onPress: (serverId: number | null, localId: string) => void;
  onDelete: (serverId: number | null, localId: string, name: string) => void;
}) => {
  const { t } = useTranslation();
  const avatarBg = item.clientTypeId === 1 ? colors.primary : colors.warning;
  const balanceColor =
    item.owesYou === true
      ? colors.danger
      : item.owesYou === false
        ? colors.success
        : colors.textTertiary;
  const balanceLabel =
    item.owesYou === true
      ? t('clients.owesYou')
      : item.owesYou === false
        ? t('clients.youOwe')
        : null;

  return (
    <View style={styles.rowCard}>
      <TouchableOpacity
        style={styles.rowContent}
        onPress={() => onPress(item.serverId, item.localId)}
        activeOpacity={0.7}
      >
        <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
          <Text style={styles.avatarText}>{item.initials}</Text>
        </View>

        <View style={styles.rowInfo}>
          <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
          {item.phone ? (
            <Text style={styles.rowSub} numberOfLines={1}>{item.phone}</Text>
          ) : null}
        </View>

        <View style={styles.rowRight}>
          {item.owesYou !== null ? (
            <>
              <Text style={[styles.balanceAmount, { color: balanceColor }]}>
                {formatPKR(item.balance)}
              </Text>
              {balanceLabel ? (
                <Text style={styles.balanceLabel}>{balanceLabel}</Text>
              ) : null}
            </>
          ) : (
            <Text style={styles.settledText}>{t('clients.settled')}</Text>
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => onDelete(item.serverId, item.localId, item.name)}
        activeOpacity={0.7}
      >
        <TrashIcon size={18} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );
};

const SkeletonRow = () => (
  <View style={[styles.skeletonCard, { marginBottom: 10 }]}>
    <View style={styles.skeletonAvatar} />
    <View style={{ flex: 1, gap: 8 }}>
      <View style={[styles.skeletonLine, { width: '60%' }]} />
      <View style={[styles.skeletonLine, { width: '40%' }]} />
    </View>
    <View style={styles.skeletonRight} />
  </View>
);

const ClientListSkeleton = () => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View style={{ opacity, paddingHorizontal: 24, flex: 1 }}>
      {[1, 2, 3, 4, 5].map((k) => <SkeletonRow key={k} />)}
    </Animated.View>
  );
};

const EmptyState = ({ onAddFirstClient, t }: { onAddFirstClient: () => void; t: (k: string) => string }) => (
  <View style={styles.emptyWrap}>
    <View style={[styles.emptyIconBubble, { backgroundColor: `${colors.success}18` }]}>
      <UsersIcon size={58} color={colors.success} />
      <View style={styles.emptyBadge}>
        <PlusIcon size={20} color={colors.surface} />
      </View>
    </View>

    <View style={styles.emptyTextWrap}>
      <Text style={styles.emptyTitle}>{t('clients.emptyTitle')}</Text>
      <Text style={styles.emptySub}>{t('clients.emptySubtext')}</Text>
    </View>

    <TouchableOpacity style={styles.emptyCta} onPress={onAddFirstClient} activeOpacity={0.8}>
      <PlusIcon size={18} color={colors.surface} />
      <Text style={styles.emptyCtaText}>{t('clients.emptyCtaLabel')}</Text>
    </TouchableOpacity>

    <Text style={styles.emptySecondary}>{t('clients.emptySecondary')}</Text>
  </View>
);

export const ClientListComponent = ({
  clients,
  filter,
  search,
  loading,
  onFilterChange,
  onSearchChange,
  onRowPress,
  onDelete,
  onFab,
  onMenuPress,
  onAddFirstClient,
}: ClientListComponentProps) => {
  const { t } = useTranslation();

  const renderItem = ({ item }: { item: ClientRow }) => (
    <ClientRowCard item={item} onPress={onRowPress} onDelete={onDelete} />
  );

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={onMenuPress} activeOpacity={0.7}>
            <MenuIcon size={23} color={colors.text} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>{t('clients.title')}</Text>
        <Text style={styles.headerSub}>
          {clients.length > 0 ? t('clients.activeCount', { count: clients.length }) : t('clients.noActive')}
        </Text>
      </View>

      {/* Filter area */}
      <View style={styles.filterArea}>
        {/* Search bar */}
        <View style={styles.searchRow}>
          <SearchIcon size={18} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('clients.searchPlaceholder')}
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={onSearchChange}
            returnKeyType="search"
          />
        </View>

        {/* Segmented control */}
        <View style={styles.segmented}>
          {FILTER_OPTIONS.map((opt) => {
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

      {/* Content */}
      {loading ? (
        <ClientListSkeleton />
      ) : clients.length === 0 && !search ? (
        <EmptyState onAddFirstClient={onAddFirstClient} t={t} />
      ) : (
        <FlatList
          data={clients}
          keyExtractor={(item) => item.localId}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.gap} />}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={onFab} activeOpacity={0.85}>
        <PlusIcon size={24} color={colors.surface} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};
