import type { OrderLineDto } from '@api/models';

export type OrderStatusTab = 'all' | 'pending' | 'inprogress' | 'delivered' | 'cancelled';

export type OrderStatusConfig = {
  bg: string;
  fg: string;
};

export type OrderRow = {
  id: number;
  clientName: string;
  statusId: number;
  statusName: string;
  orderDate: string;
  total: number;
  amountPaid: number;
  paymentStatus: string | null;
};

export type OrderDetail = {
  id: number;
  clientId: number;
  clientName: string;
  statusId: number;
  statusName: string;
  paymentTypeId: number;
  paymentTypeName: string;
  orderDate: string;
  notes: string | null;
  createdAt: string | null;
  total: number;
  amountPaid: number;
  outstanding: number;
  paymentStatus: string | null;
  orderLines: OrderLineDto[];
};

export type OrderLineFormValues = {
  productId: number;
  productName: string;
  sku: string;
  qty: string;
  unitPrice: string;
};

export type CreateOrderFormValues = {
  clientId: number | null;
  clientName: string;
  paymentTypeId: number;
  orderDate: string;
  notes: string;
  lines: OrderLineFormValues[];
};

export type EditOrderFormValues = {
  paymentTypeId: number;
  notes: string;
  lines: OrderLineFormValues[];
};

export type OrderStore = {
  currentOrder: OrderDetail | null;
  detailLoading: boolean;
  submitting: boolean;
  error: string | null;

  fetchOrderDetail: (orderId: number) => Promise<void>;
  createOrder: (values: CreateOrderFormValues) => Promise<{ success: boolean; error?: string }>;
  updateOrder: (
    id: number,
    statusId: number,
    notes?: string | null,
  ) => Promise<{ success: boolean; error?: string }>;
  deleteOrder: (id: number) => Promise<{ success: boolean; error?: string }>;
  clearCurrentOrder: () => void;
  prepareDetailLoad: () => void;
};

export type OrderListComponentProps = {
  orders: OrderRow[];
  totalCount: number;
  loading: boolean;
  refreshing: boolean;
  activeTab: OrderStatusTab;
  search: string;
  onTabChange: (tab: OrderStatusTab) => void;
  onPress: (id: number) => void;
  onRefresh: () => void;
  onSearchChange: (text: string) => void;
  onNewOrder: () => void;
  onMenuPress: () => void;
};

export type OrderCardProps = {
  order: OrderRow;
  onPress: (id: number) => void;
};

export type OrderDetailComponentProps = {
  order: OrderDetail | null;
  loading: boolean;
  submitting: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  onBack: () => void;
  onClientPress: (clientId: number) => void;
  onMarkDelivered: () => void;
  onMarkInProgress: () => void;
  onCancelOrder: () => void;
  onRecordPayment: (orderId: number) => void;
  onDelete: () => void;
  onEditOrder: (orderId: number) => void;
};

export type EditOrderComponentProps = {
  step: number;
  submitting: boolean;
  loading: boolean;
  orderId: number;
  clientName: string;
  values: EditOrderFormValues;
  errors: Partial<Record<keyof EditOrderFormValues, string>>;
  touched: Partial<Record<keyof EditOrderFormValues, boolean>>;
  lineErrors: { qty?: string }[];
  lineAvailability: (string | undefined)[];
  paymentTypes: { id: number; name: string }[];
  productItems: { id: number; name: string; subtitle?: string }[];
  productPickerVisible: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onFieldChange: (field: keyof EditOrderFormValues, value: any) => void;
  onFieldBlur: (field: keyof EditOrderFormValues) => void;
  onAddLine: () => void;
  onRemoveLine: (index: number) => void;
  onLineChange: (
    index: number,
    field: keyof OrderLineFormValues,
    value: string,
    productId?: number,
  ) => void;
  onSelectProduct: (index: number) => void;
  onProductPicked: (id: number, name: string) => void;
  onProductPickerClose: () => void;
};

export type LineItemFormCardLabels = {
  qty: string;
  unitPrice: string;
  addProduct: string;
  lineTotal: string;
};

export type LineItemFormCardProps = {
  line: OrderLineFormValues;
  index: number;
  qtyError?: string;
  availableLabel?: string;
  labels: LineItemFormCardLabels;
  onRemove: (index: number) => void;
  onChange: (
    index: number,
    field: keyof OrderLineFormValues,
    value: string,
    productId?: number,
  ) => void;
  onSelectProduct: (index: number) => void;
};

export type OrderStatusBannerProps = {
  statusId: number;
  statusName: string;
};

export type OrderFinancialSummaryProps = {
  subtotal: number;
  amountPaid: number;
  outstanding: number;
};

export type OrderLineItemProps = {
  line: OrderLineDto;
  index: number;
  isLast: boolean;
};

export type CreateOrderComponentProps = {
  step: number;
  submitting: boolean;
  values: CreateOrderFormValues;
  errors: Partial<Record<keyof CreateOrderFormValues, string>>;
  touched: Partial<Record<keyof CreateOrderFormValues, boolean>>;
  lineErrors: { qty?: string }[];
  lineAvailability: (string | undefined)[];
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onFieldChange: (field: keyof CreateOrderFormValues, value: any) => void;
  onFieldBlur: (field: keyof CreateOrderFormValues) => void;
  onAddLine: () => void;
  onRemoveLine: (index: number) => void;
  onLineChange: (
    index: number,
    field: keyof OrderLineFormValues,
    value: string,
    productId?: number,
  ) => void;
  onSelectClient: () => void;
  onClientPicked: (id: number, name: string) => void;
  onClientPickerClose: () => void;
  onSelectProduct: (index: number) => void;
  paymentTypes: { id: number; name: string }[];
  clientItems: { id: number; name: string }[];
  clientPickerVisible: boolean;
  productItems: { id: number; name: string; subtitle?: string }[];
  productPickerVisible: boolean;
  onProductPicked: (id: number, name: string) => void;
  onProductPickerClose: () => void;
};
