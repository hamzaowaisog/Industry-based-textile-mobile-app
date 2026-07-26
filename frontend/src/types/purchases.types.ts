import type { PurchaseLineDto } from '@api/models';

export type PurchaseStatusTab = 'all' | 'pending' | 'inprogress' | 'delivered' | 'cancelled';

export type PurchaseStatusConfig = {
  bg: string;
  fg: string;
};

export type PurchaseRow = {
  id: number;
  supplierName: string;
  statusId: number;
  statusName: string;
  purchaseDate: string;
  purchaseDateHijriDisplay: string | null;
  total: number;
  amountPaid: number;
  paymentStatus: string | null;
  billNo: string | null;
};

export type PurchaseDetail = {
  id: number;
  supplierId: number;
  supplierName: string;
  statusId: number;
  statusName: string;
  paymentTypeId: number;
  paymentTypeName: string;
  purchaseDate: string;
  purchaseDateHijriDisplay: string | null;
  notes: string | null;
  billNo: string | null;
  createdAt: string | null;
  total: number;
  amountPaid: number;
  payable: number;
  paymentStatus: string | null;
  purchaseLines: PurchaseLineDto[];
};

export type PurchaseLineFormValues = {
  productId: number;
  productName: string;
  sku: string;
  qty: string;
  unitCost: string;
};

export type CreatePurchaseFormValues = {
  supplierId: number | null;
  supplierName: string;
  paymentTypeId: number;
  notes: string;
  billNo: string;
  lines: PurchaseLineFormValues[];
};

export type EditPurchaseFormValues = {
  paymentTypeId: number;
  notes: string;
  billNo: string;
  lines: PurchaseLineFormValues[];
};

export type PurchaseStore = {
  currentPurchase: PurchaseDetail | null;
  detailLoading: boolean;
  submitting: boolean;
  error: string | null;

  fetchPurchaseDetail: (purchaseId: number) => Promise<void>;
  createPurchase: (values: CreatePurchaseFormValues) => Promise<{ success: boolean; error?: string }>;
  updatePurchase: (
    id: number,
    statusId: number,
    paymentTypeId: number,
    notes?: string | null,
  ) => Promise<{ success: boolean; error?: string }>;
  deletePurchase: (id: number) => Promise<{ success: boolean; error?: string }>;
  clearCurrentPurchase: () => void;
  prepareDetailLoad: () => void;
};

export type PurchaseListComponentProps = {
  purchases: PurchaseRow[];
  totalCount: number;
  loading: boolean;
  refreshing: boolean;
  isFetchingNextPage: boolean;
  activeTab: PurchaseStatusTab;
  search: string;
  onTabChange: (tab: PurchaseStatusTab) => void;
  onPress: (id: number) => void;
  onRefresh: () => void;
  onEndReached: () => void;
  onSearchChange: (text: string) => void;
  onNewPurchase: () => void;
  onMenuPress: () => void;
  onListPdfPress: () => void;
  isPdfDownloading: boolean;
};

export type PurchaseCardProps = {
  purchase: PurchaseRow;
  onPress: (id: number) => void;
};

export type PurchaseDetailComponentProps = {
  purchase: PurchaseDetail | null;
  loading: boolean;
  submitting: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  onBack: () => void;
  onSupplierPress: (supplierId: number) => void;
  onMarkInProgress: () => void;
  onMarkReceived: () => void;
  onCancelPurchase: () => void;
  onRecordPayment: (purchaseId: number) => void;
  onEditPurchase: (purchaseId: number) => void;
  onDelete: () => void;
  onDossierPdfPress: () => void;
  isDossierPdfDownloading: boolean;
};

export type EditPurchaseComponentProps = {
  step: number;
  submitting: boolean;
  loading: boolean;
  purchaseId: number;
  supplierName: string;
  values: EditPurchaseFormValues;
  errors: Partial<Record<keyof EditPurchaseFormValues, string>>;
  touched: Partial<Record<keyof EditPurchaseFormValues, boolean>>;
  lineErrors: { qty?: string }[];
  paymentTypes: { id: number; name: string }[];
  productItems: { id: number; name: string; subtitle?: string }[];
  productPickerVisible: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onFieldChange: (field: keyof EditPurchaseFormValues, value: any) => void;
  onFieldBlur: (field: keyof EditPurchaseFormValues) => void;
  onAddLine: () => void;
  onRemoveLine: (index: number) => void;
  onLineChange: (
    index: number,
    field: keyof PurchaseLineFormValues,
    value: string,
    productId?: number,
  ) => void;
  onSelectProduct: (index: number) => void;
  onProductPicked: (id: number, name: string) => void;
  onProductPickerClose: () => void;
};

export type CreatePurchaseComponentProps = {
  step: number;
  isSupplierLocked: boolean;
  submitting: boolean;
  values: CreatePurchaseFormValues;
  errors: Partial<Record<keyof CreatePurchaseFormValues, string>>;
  touched: Partial<Record<keyof CreatePurchaseFormValues, boolean>>;
  lineErrors: { qty?: string }[];
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onFieldChange: (field: keyof CreatePurchaseFormValues, value: any) => void;
  onFieldBlur: (field: keyof CreatePurchaseFormValues) => void;
  onAddLine: () => void;
  onRemoveLine: (index: number) => void;
  onLineChange: (
    index: number,
    field: keyof PurchaseLineFormValues,
    value: string,
  ) => void;
  onSelectSupplier: () => void;
  onSupplierPicked: (id: number, name: string) => void;
  onSupplierPickerClose: () => void;
  onSelectProduct: (index: number) => void;
  onProductPicked: (id: number, name: string) => void;
  onProductPickerClose: () => void;
  paymentTypes: { id: number; name: string }[];
  supplierItems: { id: number; name: string }[];
  supplierPickerVisible: boolean;
  productItems: { id: number; name: string; subtitle?: string }[];
  productPickerVisible: boolean;
  runningTotal: number;
};

export type PurchaseLineItemFormCardProps = {
  line: PurchaseLineFormValues;
  index: number;
  qtyError?: string;
  onRemove: (index: number) => void;
  onChange: (
    index: number,
    field: keyof PurchaseLineFormValues,
    value: string,
    productId?: number,
  ) => void;
  onSelectProduct: (index: number) => void;
};

export type PurchaseStatusBannerProps = {
  statusId: number;
  statusName: string;
};

export type PurchaseFinancialSummaryProps = {
  subtotal: number;
  amountPaid: number;
  payable: number;
};

export type PurchaseLineItemProps = {
  line: PurchaseLineDto;
  index: number;
  isLast: boolean;
};
