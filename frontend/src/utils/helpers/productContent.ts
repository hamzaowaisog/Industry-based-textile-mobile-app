import type { ComponentType } from 'react';

import { colors } from '@theme/colors';

import {
  AlertIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIcon,
  CoinsIcon,
  RefreshIcon,
  TagIcon,
} from '../../constants/svgAssets';
import type {
  MovementKind,
  ProductStatConfig,
  ProductStatKey,
  ProductStockTab,
  ProductStockTabConfig,
} from '../../types/products.types';

export const PRODUCT_STOCK_TABS: ProductStockTabConfig[] = [
  { id: 'all', labelKey: 'products.tabs.all' },
  { id: 'low', labelKey: 'products.tabs.low' },
  { id: 'out', labelKey: 'products.tabs.out' },
];

export const PRODUCT_STAT_CONFIG: Record<ProductStatKey, ProductStatConfig> = {
  stock: {
    Icon: BoxIcon,
    iconColor: colors.primary,
    iconBg: colors.primaryLight,
    labelKey: 'products.detail.currentStock',
  },
  defaultCost: {
    Icon: CoinsIcon,
    iconColor: colors.warning,
    iconBg: colors.warningLight,
    labelKey: 'products.detail.defaultCost',
  },
  defaultPrice: {
    Icon: TagIcon,
    iconColor: colors.success,
    iconBg: colors.successLight,
    labelKey: 'products.detail.defaultPrice',
  },
  averageCost: {
    Icon: CoinsIcon,
    iconColor: colors.textSecondary,
    iconBg: colors.bgAlt,
    labelKey: 'products.detail.avgCost',
  },
  averagePrice: {
    Icon: TagIcon,
    iconColor: colors.textSecondary,
    iconBg: colors.bgAlt,
    labelKey: 'products.detail.avgPrice',
  },
  reorderLevel: {
    Icon: AlertIcon,
    iconColor: colors.danger,
    iconBg: colors.dangerLight,
    labelKey: 'products.detail.reorderLevel',
  },
};

export const MOVEMENT_ICON_MAP: Record<
  MovementKind,
  ComponentType<{ size?: number; color: string }>
> = {
  in: ArrowDownIcon,
  out: ArrowUpIcon,
  adj: RefreshIcon,
};

// Fallback i18n key shown when a movement has no source name. Rendered by the
// component via t(), never hardcoded as English inside the mapper.
export const MOVEMENT_FALLBACK_LABEL_KEY: Record<MovementKind, string> = {
  in: 'products.movements.purchase',
  out: 'products.movements.sale',
  adj: 'products.movements.adjustment',
};

export const MOVEMENT_COLOR_MAP: Record<MovementKind, string> = {
  in: colors.success,
  out: colors.danger,
  adj: colors.primary,
};

export const MOVEMENT_BG_MAP: Record<MovementKind, string> = {
  in: colors.successLight,
  out: colors.dangerLight,
  adj: colors.primaryLight,
};

export const PRODUCT_UNIT_OPTIONS: string[] = ['m', 'kg', 'pcs', 'yard', 'roll', 'bale', 'cone'];
