import React from 'react';

import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PdfButton } from '@components/common/PdfButton';

import {
  MOVEMENT_BG_MAP,
  MOVEMENT_COLOR_MAP,
  MOVEMENT_FALLBACK_LABEL_KEY,
  MOVEMENT_ICON_MAP,
  PRODUCT_STAT_CONFIG,
} from '@utils/helpers/productContent';

import { colors } from '@theme/colors';

import { AppConstants } from '@constants/appConstants';
import { ArrowLeftIcon, EditIcon, TrashIcon } from '@constants/svgAssets';

import type { ProductDetailComponentProps } from '../../../types/products.types';
import { MiniStat } from './MiniStat';
import { ProductDetailSkeleton } from './ProductDetailSkeleton';
import { StockChart } from './StockChart';
import { styles } from './styles';

export const ProductDetailComponent = ({
  product,
  movements,
  chartData,
  trendPct,
  loading,
  submitting,
  onBack,
  onEdit,
  onDelete,
  onViewAllMovements,
  onDossierPdfPress,
  isDossierPdfDownloading,
}: ProductDetailComponentProps & { submitting?: boolean }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.iconBtn} onPress={onBack} activeOpacity={0.7}>
            <ArrowLeftIcon size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
        <ProductDetailSkeleton />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.iconBtn} onPress={onBack} activeOpacity={0.7}>
            <ArrowLeftIcon size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.iconBtn} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeftIcon size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.toolbarActions}>
          <PdfButton
            onPress={onDossierPdfPress}
            isLoading={isDossierPdfDownloading}
            size={20}
            color={colors.textSecondary}
          />
          <TouchableOpacity style={styles.iconBtn} onPress={onEdit} activeOpacity={0.7}>
            <EditIcon size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, submitting && styles.iconBtnDisabled]}
            onPress={onDelete}
            activeOpacity={0.7}
            disabled={submitting}
          >
            <TrashIcon size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Identity block */}
        <View style={styles.identityBlock}>
          <View style={styles.nameRow}>
            <Text style={styles.productName} numberOfLines={2}>
              {product.name}
            </Text>
            <View
              style={[
                styles.statusBadge,
                product.isActive ? styles.statusActive : styles.statusInactive,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  product.isActive ? styles.statusTextActive : styles.statusTextInactive,
                ]}
              >
                {product.isActive ? t('common.active') : t('common.inactive')}
              </Text>
            </View>
          </View>
          <Text style={styles.skuText}>
            {t('products.fields.sku')}: {product.sku}
          </Text>
        </View>

        {/* Chart card */}
        <StockChart
          currentStock={product.stock}
          unit={product.unitName}
          chartData={chartData}
          trendPct={trendPct}
        />

        {/* 2×2 stat grid */}
        <View style={styles.statGrid}>
          {(Object.keys(PRODUCT_STAT_CONFIG) as (keyof typeof PRODUCT_STAT_CONFIG)[]).map((key) => {
            const cfg = PRODUCT_STAT_CONFIG[key];
            const raw = product[key as keyof typeof product] as number;
            const formatted =
              key === 'stock' || key === 'reorderLevel' || key === 'availableQuantity'
                ? String(raw)
                : `${AppConstants.CURRENCY.PREFIX}${Number(raw).toLocaleString()}`;
            return (
              <View key={key} style={styles.statCell}>
                <MiniStat
                  Icon={cfg.Icon}
                  iconColor={cfg.iconColor}
                  iconBg={cfg.iconBg}
                  label={t(cfg.labelKey)}
                  value={formatted}
                />
              </View>
            );
          })}
        </View>

        {/* Recent movements */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('products.movements.recentTitle')}</Text>
          <TouchableOpacity onPress={onViewAllMovements} activeOpacity={0.7}>
            <Text style={styles.sectionLink}>{t('products.movements.viewAll')}</Text>
          </TouchableOpacity>
        </View>

        {movements.length === 0 ? (
          <View style={styles.noMovementsWrap}>
            <Text style={styles.noMovementsText}>{t('products.movements.empty')}</Text>
          </View>
        ) : (
          movements.map((m) => {
            const Icon = MOVEMENT_ICON_MAP[m.kind];
            const fg = MOVEMENT_COLOR_MAP[m.kind];
            const bg = MOVEMENT_BG_MAP[m.kind];
            const sign = m.kind === 'in' ? '+' : m.kind === 'out' ? '-' : '';
            return (
              <View key={m.id} style={styles.movementRow}>
                <View style={[styles.movementIcon, { backgroundColor: bg }]}>
                  <Icon size={16} color={fg} />
                </View>
                <View style={styles.movementBody}>
                  <Text style={styles.movementNote} numberOfLines={1}>
                    {m.note || t(MOVEMENT_FALLBACK_LABEL_KEY[m.kind])}
                  </Text>
                  <Text style={styles.movementDate}>{m.date}</Text>
                </View>
                <Text style={[styles.movementQty, { color: fg }]}>{`${sign}${m.qty}`}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
