import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppAvatar } from '@components/common/AppAvatar';
import { AppBadge } from '@components/common/AppBadge';
import { AppBottomSheet } from '@components/common/AppBottomSheet';

import { getInitials } from '@utils/helpers/textHelpers';

import { colors } from '@theme/colors';
import { typography } from '@theme/typography';

import { AddressBookIcon, CloseIcon, SearchIcon } from '@constants/svgAssets';

import type { ContactPickerSheetProps } from '../../../types/contacts.types';
import { styles } from './styles';

const SEARCH_DEBOUNCE_MS = 150;

export const ContactPickerSheet = ({
  visible,
  contacts,
  loading,
  onClose,
  onSelect,
}: ContactPickerSheetProps) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Drive the underlying BottomSheetModal from the `visible` prop.
  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.close();
      setQuery('');
      setDebouncedQuery('');
    }
  }, [visible]);

  // Debounce search input.
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(query.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [query]);

  const filtered = useMemo(() => {
    if (!debouncedQuery) return contacts;
    const q = debouncedQuery.toLowerCase();
    return contacts.filter(
      (c) => c.displayName.toLowerCase().includes(q) || c.phone.includes(q),
    );
  }, [contacts, debouncedQuery]);

  const renderItem = ({ item }: { item: (typeof filtered)[number] }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => {
        onSelect(item);
        onClose();
      }}
      activeOpacity={0.7}
    >
      <AppAvatar label={getInitials(item.displayName)} size={40} />
      <View style={styles.rowInfo}>
        <Text style={styles.rowName} numberOfLines={1}>
          {item.displayName}
        </Text>
        <View style={styles.rowPhoneWrap}>
          <Text style={styles.rowPhone} numberOfLines={1}>
            {item.phone}
          </Text>
          {item.phoneLabel ? (
            <AppBadge
              label={item.phoneLabel}
              bg={colors.bgAlt}
              fg={colors.textSecondary}
              size="sm"
            />
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      );
    }
    const noContactsAtAll = contacts.length === 0;
    return (
      <View style={styles.emptyWrap}>
        <AddressBookIcon size={40} color={colors.textTertiary} />
        <Text style={styles.emptyTitle}>
          {noContactsAtAll
            ? t('clients.contactPicker.emptyTitle')
            : t('clients.contactPicker.noMatchesTitle')}
        </Text>
        {noContactsAtAll ? (
          <Text style={styles.emptySubtitle}>
            {t('clients.contactPicker.emptySubtitle')}
          </Text>
        ) : null}
      </View>
    );
  };

  return (
    <AppBottomSheet ref={sheetRef} snapPoints={['70%']}>
      <BottomSheetView style={[styles.content, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('clients.contactPicker.title')}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <CloseIcon size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchWrap}>
          <SearchIcon size={16} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder={t('clients.contactPicker.searchPlaceholder')}
            placeholderTextColor={colors.textTertiary}
            returnKeyType="search"
            autoCorrect={false}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={renderEmpty}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={filtered.length === 0 ? styles.listEmpty : undefined}
        />
      </BottomSheetView>
    </AppBottomSheet>
  );
};
