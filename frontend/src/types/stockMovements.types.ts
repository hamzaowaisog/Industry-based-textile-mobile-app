export type StockMoveRow = {
  id: number;
  productId: number;
  productName: string;
  unitName: string;
  movementSourceId: number;
  movementSourceName: string;
  movementTypeId: number;
  movementTypeName: string;
  qty: number;
  unitCost: number | null;
  unitPrice: number | null;
  movementDate: string;
};

export type StockMoveDetail = {
  id: number;
  productId: number;
  productName: string;
  unitName: string;
  movementSourceId: number;
  movementSourceName: string;
  movementTypeId: number;
  movementTypeName: string;
  qty: number;
  unitCost: number | null;
  unitPrice: number | null;
  averageCostAtMovement: number | null;
  averagePriceAtMovement: number | null;
  currentAverageCost: number | null;
  currentAveragePrice: number | null;
  movementDate: string;
};

export type AddStockMoveFormValues = {
  productId: number | null;
  productName: string;
  movementSource: number;
  movementType: number | null;
  qty: string;
  unitCost: string;
  unitPrice: string;
  movementDate: string;
};

export type EditStockMoveFormValues = {
  productId: number | null;
  productName: string;
  movementSource: number;
  movementType: number | null;
  qty: string;
  unitCost: string;
  unitPrice: string;
  movementDate: string;
};

export type StockMovementStore = {
  currentMovement: StockMoveDetail | null;
  detailLoading: boolean;
  submitting: boolean;
  error: string | null;

  fetchMovementDetail: (movementId: number) => Promise<void>;
  createMovement: (
    values: AddStockMoveFormValues,
  ) => Promise<{ success: boolean; error?: string; movementId?: number }>;
  updateMovement: (
    movementId: number,
    values: EditStockMoveFormValues,
  ) => Promise<{ success: boolean; error?: string }>;
  deleteMovement: (movementId: number) => Promise<{ success: boolean; error?: string }>;
  clearCurrentMovement: () => void;
  prepareDetailLoad: () => void;
};

export type StockMoveListFilter = 'all' | 'in' | 'out' | 'adj';

export type StockMoveRowCardProps = {
  movement: StockMoveRow;
  onPress: (id: number) => void;
};

export type StockMoveListComponentProps = {
  movements: StockMoveRow[];
  totalIn: number;
  totalOut: number;
  totalInUnitLabel: string;
  totalOutUnitLabel: string;
  loading: boolean;
  refreshing: boolean;
  isFetchingNextPage: boolean;
  activeFilter: StockMoveListFilter;
  search: string;
  onSearchChange: (search: string) => void;
  onPress: (id: number) => void;
  onRefresh: () => void;
  onEndReached: () => void;
  onFilterChange: (filter: StockMoveListFilter) => void;
  onAddStockMove: () => void;
  onMenuPress: () => void;
  onListPdfPress: () => void;
  isPdfDownloading: boolean;
};

export type StockMoveDetailComponentProps = {
  movement: StockMoveDetail | null;
  loading: boolean;
  submitting: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  onBack: () => void;
  onEdit: (movementId: number) => void;
  onDelete: () => void;
  onDossierPdfPress: () => void;
  isDossierPdfDownloading: boolean;
};

export type AddStockMoveComponentProps = {
  submitting: boolean;
  values: AddStockMoveFormValues;
  errors: Partial<Record<keyof AddStockMoveFormValues, string>>;
  touched: Partial<Record<keyof AddStockMoveFormValues, boolean>>;
  movementSources: { id: number; name: string }[];
  movementTypes: { id: number; name: string }[];
  productItems: { id: number; name: string; subtitle?: string }[];
  selectedProductStock: number | null;
  productPickerVisible: boolean;
  onOpenProductPicker: () => void;
  onProductPicked: (id: number, name: string) => void;
  onProductPickerClose: () => void;
  onBack: () => void;
  onSubmit: () => void;
  onFieldChange: (field: keyof AddStockMoveFormValues, value: unknown) => void;
  onFieldBlur: (field: keyof AddStockMoveFormValues) => void;
};

export type EditStockMoveComponentProps = {
  submitting: boolean;
  loading: boolean;
  movement: StockMoveDetail | null;
  values: EditStockMoveFormValues;
  errors: Partial<Record<keyof EditStockMoveFormValues, string>>;
  touched: Partial<Record<keyof EditStockMoveFormValues, boolean>>;
  movementSources: { id: number; name: string }[];
  movementTypes: { id: number; name: string }[];
  productItems: { id: number; name: string; subtitle?: string }[];
  selectedProductStock: number | null;
  productPickerVisible: boolean;
  onOpenProductPicker: () => void;
  onProductPicked: (id: number, name: string) => void;
  onProductPickerClose: () => void;
  onBack: () => void;
  onSubmit: () => void;
  onFieldChange: (field: keyof EditStockMoveFormValues, value: unknown) => void;
  onFieldBlur: (field: keyof EditStockMoveFormValues) => void;
};
