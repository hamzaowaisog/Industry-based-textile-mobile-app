import type {
  ClientDetailViewModel,
  ClientOrderSummary,
  ClientPaymentSummary,
  ClientPurchaseSummary,
  ClientTransactionSummary,
} from '@api/models';
import type { LocalClient } from './db.types';

export type ClientFilter = 'all' | 'customers' | 'suppliers';
export type ClientTab = 'orders' | 'purchases' | 'payments' | 'invoices' | 'transactions';

export type TabConfig = { id: ClientTab; labelKey: string };

export type InputFieldProps = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  onBlur: () => void;
  placeholder: string;
  error?: string;
  helper?: string;
  leading?: React.ReactNode;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  returnKeyType?: 'next' | 'done';
  onSubmitEditing?: () => void;
  editable?: boolean;
};

export type ClientRow = {
  localId: string;
  serverId: number | null;
  name: string;
  phone: string | null;
  clientTypeId: number;
  initials: string;
  balance: number;
  owesYou: boolean | null;
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
  orders: ClientOrderSummary[];
  purchases: ClientPurchaseSummary[];
  payments: ClientPaymentSummary[];
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
  clients: LocalClient[];
  currentClient: ClientDetail | null;
  loading: boolean;
  detailLoading: boolean;
  submitting: boolean;
  error: string | null;
  fetchClients: () => Promise<void>;
  fetchClientDetail: (serverId: number) => Promise<void>;
  createClient: (data: ClientFormValues) => Promise<{ success: boolean; error?: string }>;
  updateClient: (serverId: number, localId: string, data: ClientFormValues) => Promise<{ success: boolean; error?: string }>;
  deleteClient: (serverId: number | null, localId: string) => Promise<{ success: boolean; error?: string }>;
  clearCurrentClient: () => void;
  refreshFromDb: () => void;
};

export type ClientListComponentProps = {
  clients: ClientRow[];
  filter: ClientFilter;
  search: string;
  loading: boolean;
  onFilterChange: (f: ClientFilter) => void;
  onSearchChange: (s: string) => void;
  onRowPress: (serverId: number | null, localId: string) => void;
  onDelete: (serverId: number | null, localId: string, name: string) => void;
  onFab: () => void;
  onMenuPress: () => void;
  onAddFirstClient: () => void;
};

export type ClientDetailComponentProps = {
  client: ClientDetail | null;
  loading: boolean;
  tab: ClientTab;
  onTabChange: (t: ClientTab) => void;
  onBack: () => void;
  onEdit: () => void;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
};

export type ClientFormComponentProps = {
  isEdit: boolean;
  submitting: boolean;
  values: ClientFormValues;
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean | undefined>;
  setFieldValue: (field: string, value: string | number) => void;
  setFieldTouched: (field: string, isTouched?: boolean) => void;
  handleSubmit: () => void;
  onCancel: () => void;
};

export type { ClientDetailViewModel };
