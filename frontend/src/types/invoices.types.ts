import type { InvoiceLineDto, InvoiceTransactionSummary } from '@api/models';

export type InvoiceStatusTab = 'all' | 'draft' | 'issued' | 'paid';

export type InvoiceLine = InvoiceLineDto;
export type InvoiceLinkedTransaction = InvoiceTransactionSummary;

export type InvoiceRow = {
  id: number;
  invoiceNumber: string;
  billNo: string | null;
  clientId: number;
  clientName: string;
  clientTypeName: string;
  direction: string;
  type: string;
  invoiceStatusId: number;
  statusName: string;
  issueDate: string | null;
  issueDateHijriDisplay: string | null;
  dueDate: string | null;
  dueDateHijriDisplay: string | null;
  totalAmount: number;
  amountPaid: number;
  outstanding: number;
  isOverdue: boolean;
  createdAt: string | null;
};

export type InvoiceSummary = {
  totalReceivable: number;
  totalPayable: number;
  totalCount: number;
};

export type InvoiceDetail = {
  id: number;
  invoiceNumber: string;
  billNo: string | null;
  orderId: number | null;
  purchaseId: number | null;
  clientId: number;
  clientName: string;
  clientTypeName: string;
  direction: string;
  type: string;
  invoiceStatusId: number;
  statusName: string;
  issueDate: string | null;
  issueDateHijriDisplay: string | null;
  dueDate: string | null;
  dueDateHijriDisplay: string | null;
  totalAmount: number;
  amountPaid: number;
  outstanding: number;
  notes: string | null;
  createdAt: string | null;
  lines: InvoiceLine[];
  linkedTransactions: InvoiceLinkedTransaction[];
};

export type InvoiceLineFormValues = {
  productName: string;
  qty: string;
  unitPrice: string;
};

export type CreateInvoiceFormValues = {
  clientId: number | null;
  clientName: string;
  dueDate: string;
  notes: string;
  lines: InvoiceLineFormValues[];
};

export type EditInvoiceFormValues = {
  invoiceStatusId: number;
  dueDate: string;
  notes: string;
  lines: InvoiceLineFormValues[];
};

export type InvoiceStore = {
  currentInvoice: InvoiceDetail | null;
  detailLoading: boolean;
  submitting: boolean;
  error: string | null;

  fetchInvoiceDetail: (invoiceId: number) => Promise<void>;
  createInvoice: (
    values: CreateInvoiceFormValues,
  ) => Promise<{ success: boolean; error?: string; invoiceId?: number }>;
  updateInvoice: (
    invoiceId: number,
    values: EditInvoiceFormValues,
  ) => Promise<{ success: boolean; error?: string }>;
  changeInvoiceStatus: (
    invoiceId: number,
    statusId: number,
  ) => Promise<{ success: boolean; error?: string }>;
  deleteInvoice: (invoiceId: number) => Promise<{ success: boolean; error?: string }>;
  clearCurrentInvoice: () => void;
  prepareDetailLoad: () => void;
};

export type InvoicePdfAction = 'view' | 'share';

export type InvoiceListComponentProps = {
  invoices: InvoiceRow[];
  totalCount: number;
  totalReceivable: number;
  totalPayable: number;
  loading: boolean;
  refreshing: boolean;
  isFetchingNextPage: boolean;
  activeTab: InvoiceStatusTab;
  search: string;
  onTabChange: (tab: InvoiceStatusTab) => void;
  onPress: (id: number) => void;
  onRefresh: () => void;
  onEndReached: () => void;
  onSearchChange: (text: string) => void;
  onCreateInvoice: () => void;
  onMenuPress: () => void;
  onListPdfPress: () => void;
  isPdfDownloading: boolean;
  onViewPdf: (invoice: InvoiceRow) => void;
  onSharePdf: (invoice: InvoiceRow) => void;
  activePdfId: number | null;
  activeAction: InvoicePdfAction | null;
};

export type InvoiceCardProps = {
  invoice: InvoiceRow;
  onPress: (id: number) => void;
  onViewPdf: (invoice: InvoiceRow) => void;
  onSharePdf: (invoice: InvoiceRow) => void;
  isViewing: boolean;
  isSharing: boolean;
};

export type InvoiceDetailComponentProps = {
  invoice: InvoiceDetail | null;
  loading: boolean;
  submitting: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  onBack: () => void;
  onClientPress: (clientId: number) => void;
  onEdit: (invoiceId: number) => void;
  onDelete: () => void;
  onIssue: () => void;
  onCancel: () => void;
  onDossierPdfPress: () => void;
  isDossierPdfDownloading: boolean;
};

export type InvoiceLineFormCardLabels = {
  product: string;
  productPlaceholder: string;
  qty: string;
  unitPrice: string;
  lineTotal: string;
};

export type InvoiceLineFormCardProps = {
  line: InvoiceLineFormValues;
  index: number;
  labels: InvoiceLineFormCardLabels;
  onRemove: (index: number) => void;
  onChange: (index: number, field: keyof InvoiceLineFormValues, value: string) => void;
};

export type CreateInvoiceComponentProps = {
  submitting: boolean;
  values: CreateInvoiceFormValues;
  errors: Partial<Record<keyof CreateInvoiceFormValues, string>>;
  touched: Partial<Record<keyof CreateInvoiceFormValues, boolean>>;
  clientItems: { id: number; name: string; subtitle?: string }[];
  clientPickerVisible: boolean;
  totalAmount: number;
  onBack: () => void;
  onSubmit: () => void;
  onFieldChange: (field: keyof CreateInvoiceFormValues, value: unknown) => void;
  onFieldBlur: (field: keyof CreateInvoiceFormValues) => void;
  onSelectClient: () => void;
  onClientPicked: (id: number, name: string) => void;
  onClientPickerClose: () => void;
  onAddLine: () => void;
  onRemoveLine: (index: number) => void;
  onLineChange: (index: number, field: keyof InvoiceLineFormValues, value: string) => void;
};

export type EditInvoiceComponentProps = {
  submitting: boolean;
  loading: boolean;
  invoice: InvoiceDetail | null;
  values: EditInvoiceFormValues;
  errors: Partial<Record<keyof EditInvoiceFormValues, string>>;
  touched: Partial<Record<keyof EditInvoiceFormValues, boolean>>;
  statusItems: { id: number; name: string }[];
  totalAmount: number;
  onBack: () => void;
  onSubmit: () => void;
  onFieldChange: (field: keyof EditInvoiceFormValues, value: unknown) => void;
  onFieldBlur: (field: keyof EditInvoiceFormValues) => void;
  onAddLine: () => void;
  onRemoveLine: (index: number) => void;
  onLineChange: (index: number, field: keyof InvoiceLineFormValues, value: string) => void;
};
