import { useMemo, useState } from 'react';

import {
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@theme/colors';

import { SearchIcon } from '@constants/svgAssets';

import type { AppSelectModalProps, SelectItem } from '../../../types/common.types';
import { styles } from './styles';

const SHEET_MAX_HEIGHT = Dimensions.get('window').height * 0.75;

export const AppSelectModal = ({
  visible,
  title,
  items,
  selectedId,
  onSelect,
  onClose,
  searchPlaceholder = 'Search…',
}: AppSelectModalProps) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, query]);

  const handleSelect = (item: SelectItem) => {
    onSelect(item.id, item.name);
    setQuery('');
  };

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  const renderItem = ({ item, index }: { item: SelectItem; index: number }) => {
    const isSelected = item.id === selectedId;
    return (
      <TouchableOpacity
        style={[
          styles.item,
          index < filtered.length - 1 && styles.itemBorder,
          isSelected && styles.itemSelected,
        ]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.75}
      >
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, isSelected && styles.itemNameSelected]}>{item.name}</Text>
          {item.subtitle ? (
            <Text style={[styles.itemSub, isSelected && styles.itemSubSelected]}>
              {item.subtitle}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? insets.bottom : 0}
        >
          <View
            style={[styles.sheet, { height: SHEET_MAX_HEIGHT, paddingBottom: insets.bottom + 8 }]}
          >
            {/* Handle */}
            <View style={styles.handle} />

            {/* Title */}
            <View style={styles.titleRow}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity
                onPress={handleClose}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchRow}>
              <SearchIcon size={18} color={colors.textTertiary} />
              <TextInput
                style={styles.searchInput}
                placeholder={searchPlaceholder}
                placeholderTextColor={colors.textTertiary}
                value={query}
                onChangeText={setQuery}
                autoFocus
                returnKeyType="search"
              />
            </View>

            {/* List */}
            <FlatList
              data={filtered}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderItem}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              style={styles.list}
              ListEmptyComponent={
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyText}>{t('common.noResultsSub', { query })}</Text>
                </View>
              }
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
