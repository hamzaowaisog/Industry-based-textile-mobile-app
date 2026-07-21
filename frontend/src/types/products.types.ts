import type { ComponentType } from 'react';

export type ProductPickerItem = {
  id: number;
  name: string;
  sku: string;
  defaultPrice: number;
  defaultCost: number;
  quantity: number;
  availableQuantity: number;
};

export type ProductStockTab = 'all' | 'low' | 'out';

export type ProductStockTabConfig = { id: ProductStockTab; labelKey: string };

export type ProductStatKey =
  | 'stock'
  | 'availableQuantity'
  | 'defaultCost'
  | 'defaultPrice'
  | 'averageCost'
  | 'averagePrice'
  | 'reorderLevel';

export type ProductStatConfig = {
  Icon: ComponentType<{ size?: number; color: string }>;
  iconColor: string;
  iconBg: string;
  labelKey: string;
};

export type MovementKind = 'in' | 'out' | 'adj';

export type ProductRow = {
  id: number;
  name: string;
  sku: string;
  unitName: string;
  stock: number;
  availableQuantity: number;
  reorderLevel: number;
  avgPrice: number;
  isLow: boolean;
  isOut: boolean;
};

export type ProductDetailData = {
  id: number;
  name: string;
  sku: string;
  unitId: number;
  unitName: string;
  stock: number;
  availableQuantity: number;
  averageCost: number;
  averagePrice: number;
  defaultCost: number;
  defaultPrice: number;
  reorderLevel: number;
  isActive: boolean;
};

export type ProductMovementRow = {
  id: number;
  kind: MovementKind;
  qty: number;
  note: string;
  date: string;
  rawDate: string;
};

export type ProductFormValues = {
  name: string;
  sku: string;
  unitId: number;
  defaultCost: string;
  defaultPrice: string;
  quantity: string;
  reorderLevel: string;
};

export type ProductListComponentProps = {
  products: ProductRow[];
  totalCount: number;
  loading: boolean;
  refreshing: boolean;
  isFetchingNextPage: boolean;
  activeTab: ProductStockTab;
  search: string;
  onTabChange: (tab: ProductStockTab) => void;
  onSearchChange: (s: string) => void;
  onRefresh: () => void;
  onEndReached: () => void;
  onPress: (id: number) => void;
  onNewProduct: () => void;
  onMenuPress: () => void;
  onListPdfPress: () => void;
  isPdfDownloading: boolean;
};

export type ProductDetailComponentProps = {
  product: ProductDetailData | null;
  movements: ProductMovementRow[];
  chartData: number[];
  trendPct: number | null;
  loading: boolean;
  isAdmin: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewAllMovements: () => void;
  onDossierPdfPress: () => void;
  isDossierPdfDownloading: boolean;
};

export type UnitItem = { id: number; name: string };

export type ProductFormComponentProps = {
  isEdit: boolean;
  submitting: boolean;
  loading: boolean;
  values: ProductFormValues;
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean | undefined>;
  unitPickerVisible: boolean;
  unitItems: UnitItem[];
  setFieldValue: (field: string, value: any) => void;
  setFieldTouched: (field: string, touched?: boolean) => void;
  handleSubmit: () => void;
  onCancel: () => void;
  onOpenUnitPicker: () => void;
  onCloseUnitPicker: () => void;
};

export type ProductCardProps = {
  product: ProductRow;
  onPress: (id: number) => void;
};

export type MiniStatProps = {
  Icon: ComponentType<{ size?: number; color: string }>;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
};

export type StockChartProps = {
  currentStock: number;
  unit: string;
  chartData: number[];
  trendPct: number | null;
};

export type EmptyStateProps = {
  onNewProduct: () => void;
};

export type FieldErrorProps = {
  msg?: string;
};
