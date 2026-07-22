import type {
  ClientDetailViewModel,
  ClientOrderSummary,
  ClientPaymentSummary,
  ClientPurchaseSummary,
  ClientTransactionSummary,
} from '@api/models';

export type ApiClientItem = {
  id: number;
  name: string;
  phone: string | null;
  clientTypeId: number;
  outstandingBalance: number | null;
  openingBalance: number | null;
};

export type ClientBalanceDirection = 'receivable' | 'payable' | 'settled';

export type ClientFilter = 'all' | 'customers' | 'suppliers';

export type ClientFilterOption = { value: ClientFilter; labelKey: string };

export type ClientRowCardProps = {
  item: ClientRow;
  onPress: (id: number) => void;
};

export type ClientListEmptyStateProps = {
  onAddFirstClient: () => void;
};
export type ClientTab = 'orders' | 'purchases' | 'payments' | 'invoices' | 'transactions';

export type ClientInvoiceSummary = {
  invoiceId: number;
  invoiceNumber: string;
  issueDate: string | null;
  issueDateHijriDisplay: string | null;
  dueDate: string | null;
  dueDateHijriDisplay: string | null;
  invoiceStatusId: number;
  statusName: string;
  totalAmount: number;
};

export type TabConfig = { id: ClientTab; labelKey: string };

export type ClientRow = {
  id: number;
  name: string;
  phone: string | null;
  clientTypeId: number;
  initials: string;
  balance: number;
  balanceDirection: ClientBalanceDirection;
};

export type ClientDetail = {
  clientId: number;
  clientName: string;
  clientTypeName: string;
  clientTypeId: number;
  balance: number;
  outstanding: number;
  totalOrderCount: number;
  totalOrderAmount: number;
  totalPurchaseCount: number;
  totalPurchaseAmount: number;
  totalPaymentsIn: number;
  totalPaymentsOut: number;
  phone: string | null;
  address: string | null;
  creditLimit: number | null;
  openingBalance: number | null;
  notes: string | null;
  isActive: boolean;
  orders: ClientOrderSummary[];
  purchases: ClientPurchaseSummary[];
  payments: ClientPaymentSummary[];
  invoices: ClientInvoiceSummary[];
  recentTransactions: ClientTransactionSummary[];
};

export type ClientFormValues = {
  name: string;
  clientTypeId: number;
  phone: string;
  address: string;
  creditLimit: string;
  openingBalance: string;
  notes: string;
};

export type ClientStore = {
  currentClient: ClientDetail | null;
  detailLoading: boolean;
  submitting: boolean;
  error: string | null;
  fetchClientDetail: (serverId: number) => Promise<void>;
  createClient: (data: ClientFormValues) => Promise<{ success: boolean; error?: string }>;
  updateClient: (
    serverId: number,
    data: ClientFormValues,
  ) => Promise<{ success: boolean; error?: string }>;
  deleteClient: (serverId: number) => Promise<{ success: boolean; error?: string }>;
  setClientActive: (
    serverId: number,
    isActive: boolean,
  ) => Promise<{ success: boolean; error?: string }>;
  clearCurrentClient: () => void;
  prepareDetailLoad: () => void;
};

export type ClientListComponentProps = {
  clients: ClientRow[];
  totalCount: number;
  filter: ClientFilter;
  search: string;
  loading: boolean;
  refreshing: boolean;
  isFetchingNextPage: boolean;
  onFilterChange: (f: ClientFilter) => void;
  onSearchChange: (s: string) => void;
  onRowPress: (id: number) => void;
  onRefresh: () => void;
  onEndReached: () => void;
  onFab: () => void;
  onMenuPress: () => void;
  onAddFirstClient: () => void;
  onListPdfPress: () => void;
  isPdfDownloading: boolean;
};

export type ClientDetailComponentProps = {
  client: ClientDetail | null;
  loading: boolean;
  refreshing: boolean;
  tab: ClientTab;
  onTabChange: (t: ClientTab) => void;
  onRefresh: () => void;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
  submitting?: boolean;
  onDossierPdfPress: () => void;
  isDossierPdfDownloading: boolean;
  onToggleActive: (isActive: boolean) => void;
};

export type ClientFormComponentProps = {
  isEdit: boolean;
  submitting: boolean;
  clientTypes: { id: number; name: string }[];
  values: ClientFormValues;
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean | undefined>;
  setFieldValue: (field: string, value: string | number) => void;
  setFieldTouched: (field: string, isTouched?: boolean) => void;
  handleSubmit: () => void;
  onCancel: () => void;
};

export type StatusStyle = { bg: string; fg: string };

export type ClientTabContentProps = {
  tab: ClientTab;
  client: ClientDetail;
};

export type { ClientDetailViewModel };
