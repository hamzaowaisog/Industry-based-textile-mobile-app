import type { PaymentAllocationDto } from '@api/models';

export type PaymentDirectionTab = 'all' | 'received' | 'paid';

export type PaymentRow = {
  id: number;
  partyClientId: number;
  partyClientName: string;
  paymentDirectionId: number;
  paymentDirectionName: string;
  transModeId: number;
  transModeName: string;
  amount: number;
  paymentDate: string;
  paymentDateHijriDisplay: string | null;
  isReversed: boolean;
  allocatedBillNos: string;
  billNos: string[];
  unallocatedAmount: number;
};

export type PaymentAllocation = PaymentAllocationDto;

export type PaymentSummary = {
  totalReceived: number;
  totalPaid: number;
  totalCount: number;
};

export type PaymentDetail = {
  id: number;
  partyClientId: number;
  partyClientName: string;
  paymentDirectionId: number;
  paymentDirectionName: string;
  transModeId: number;
  transModeName: string;
  amount: number;
  paymentDate: string;
  paymentDateHijriDisplay: string | null;
  notes: string | null;
  createdAt: string | null;
  recordedByName: string | null;
  isReversed: boolean;
  reversedByPaymentId: number | null;
  originalPaymentId: number | null;
  isCashSettled: boolean;
  allocations: PaymentAllocation[];
  billNos: string[];
  unallocatedAmount: number;
};

export type AllocationFormValues = {
  orderId: number | null;
  purchaseId: number | null;
  allocatedAmount: string;
  label: string;
};

export type RecordPaymentFormValues = {
  partyClientId: number | null;
  partyClientName: string;
  paymentDirectionId: number;
  transModeId: number;
  amount: string;
  paymentDate: string;
  notes: string;
  allocations: AllocationFormValues[];
};

export type EditPaymentFormValues = {
  transModeId: number;
  paymentDate: string;
  notes: string;
};

export type PaymentStore = {
  currentPayment: PaymentDetail | null;
  detailLoading: boolean;
  submitting: boolean;
  error: string | null;

  fetchPaymentDetail: (paymentId: number) => Promise<void>;
  createPayment: (values: RecordPaymentFormValues) => Promise<{ success: boolean; error?: string; paymentId?: number }>;
  updatePayment: (paymentId: number, values: EditPaymentFormValues) => Promise<{ success: boolean; error?: string }>;
  reversePayment: (paymentId: number, notes?: string) => Promise<{ success: boolean; error?: string }>;
  deletePayment: (paymentId: number) => Promise<{ success: boolean; error?: string }>;
  clearCurrentPayment: () => void;
  prepareDetailLoad: () => void;
};

export type PaymentListComponentProps = {
  payments: PaymentRow[];
  totalCount: number;
  totalReceived: number;
  totalPaid: number;
  loading: boolean;
  refreshing: boolean;
  isFetchingNextPage: boolean;
  activeTab: PaymentDirectionTab;
  search: string;
  onTabChange: (tab: PaymentDirectionTab) => void;
  onPress: (id: number) => void;
  onRefresh: () => void;
  onEndReached: () => void;
  onSearchChange: (text: string) => void;
  onRecordPayment: () => void;
  onMenuPress: () => void;
  onListPdfPress: () => void;
  isPdfDownloading: boolean;
};

export type PaymentCardProps = {
  payment: PaymentRow;
  onPress: (id: number) => void;
};

export type PaymentDetailComponentProps = {
  payment: PaymentDetail | null;
  loading: boolean;
  submitting: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canReverse: boolean;
  onBack: () => void;
  onClientPress: (clientId: number) => void;
  onEdit: (paymentId: number) => void;
  onReverse: () => void;
  onDelete: () => void;
  onDossierPdfPress: () => void;
  isDossierPdfDownloading: boolean;
};

export type RecordPaymentComponentProps = {
  submitting: boolean;
  isClientLocked: boolean;
  balanceHelper: string | null;
  overpayHelper: string | null;
  values: RecordPaymentFormValues;
  errors: Partial<Record<keyof RecordPaymentFormValues, string>>;
  touched: Partial<Record<keyof RecordPaymentFormValues, boolean>>;
  transModes: { id: number; name: string }[];
  clientItems: { id: number; name: string }[];
  clientPickerVisible: boolean;
  onBack: () => void;
  onSubmit: () => void;
  onFieldChange: (field: keyof RecordPaymentFormValues, value: unknown) => void;
  onFieldBlur: (field: keyof RecordPaymentFormValues) => void;
  onSelectClient: () => void;
  onClientPicked: (id: number, name: string) => void;
  onClientPickerClose: () => void;
};

export type EditPaymentComponentProps = {
  submitting: boolean;
  loading: boolean;
  payment: PaymentDetail | null;
  values: EditPaymentFormValues;
  errors: Partial<Record<keyof EditPaymentFormValues, string>>;
  touched: Partial<Record<keyof EditPaymentFormValues, boolean>>;
  transModes: { id: number; name: string }[];
  onBack: () => void;
  onSubmit: () => void;
  onFieldChange: (field: keyof EditPaymentFormValues, value: unknown) => void;
  onFieldBlur: (field: keyof EditPaymentFormValues) => void;
};
