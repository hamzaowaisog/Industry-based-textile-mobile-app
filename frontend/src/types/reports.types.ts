import type { ExpenseCategorySlice } from './expenses.types';
import type { SelectItem } from './common.types';

// ── Domain rows ──────────────────────────────────────────────────────────────

export type ProfitLossRow = {
  month: string;
  totalSales: number;
  totalPurchases: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
};

export type ProfitLossTotals = {
  totalSales: number;
  totalPurchases: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
};

export type ClientBalanceRow = {
  clientId: number;
  name: string;
  clientTypeName: string;
  balance: number;
};

export type CreditDebitRow = {
  month: string;
  totalCredit: number;
  totalDebit: number;
  balance: number;
};

export type CreditDebitTotals = {
  totalCredit: number;
  totalDebit: number;
  netBalance: number;
};

export type SummaryTotals = {
  totalSalesAmount: number;
  totalPurchasesAmount: number;
  totalExpensesAmount: number;
  totalOrderCount: number;
  totalPurchaseCount: number;
  totalClientsCount: number;
  salesGrowthPercent: number | null;
  avgOrderValue: number;
  activeClientsCount: number;
  activeClientsChange: number;
  overdueInvoicesCount: number;
};

export type SummaryTrendRow = {
  key: string;
  labelKey: string;
  value: string;
  positive: boolean;
};

export type BalanceHistoryPoint = {
  month: string;
  balance: number;
};

export type ClientOrderRow = {
  orderId: number;
  orderDate: string;
  statusName: string;
  total: number;
  amountPaid: number;
  outstanding: number;
  paymentStatus: string;
};

export type ClientPurchaseRow = {
  purchaseId: number;
  purchaseDate: string;
  statusName: string;
  total: number;
  amountPaid: number;
  outstanding: number;
  paymentStatus: string;
};

export type ClientPaymentRow = {
  paymentId: number;
  paymentDate: string;
  directionName: string;
  modeName: string;
  amount: number;
  isReversed: boolean;
};

export type ClientDetailReportData = {
  clientId: number;
  clientName: string;
  clientTypeName: string;
  totalOrderCount: number;
  totalOrderAmount: number;
  totalPurchaseCount: number;
  totalPurchaseAmount: number;
  totalPaymentsIn: number;
  totalPaymentsOut: number;
  outstanding: number;
  balance: number;
  orders: ClientOrderRow[];
  purchases: ClientPurchaseRow[];
  payments: ClientPaymentRow[];
  balanceHistory: BalanceHistoryPoint[];
};

// ── UI state ─────────────────────────────────────────────────────────────────

export type ReportPeriodFilter = {
  year?: number;
  month?: number;
};

export type ClientBalanceTab = 'customers' | 'suppliers';
export type ClientDetailTab = 'orders' | 'purchases' | 'payments';

export type ReportScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  right?: import('react').ReactNode;
};

export type ReportPeriodFilterProps = {
  filter: ReportPeriodFilter;
  years: number[];
  onYearChange: (year?: number) => void;
  onMonthChange: (month?: number) => void;
};

export type ReportKey =
  | 'profitLoss'
  | 'clientBalance'
  | 'creditDebit'
  | 'summary'
  | 'clientDetail';

// ── Component props ─────────────────────────────────────────────────────────

export type ReportsHubComponentProps = {
  onSelectReport: (report: ReportKey) => void;
  onMenuPress: () => void;
  onReportPdfPress: (report: ReportKey) => void;
  pdfDownloadingReport: ReportKey | null;
};

export type ProfitLossComponentProps = {
  rows: ProfitLossRow[];
  totals: ProfitLossTotals;
  loading: boolean;
  filter: ReportPeriodFilter;
  years: number[];
  onYearChange: (year?: number) => void;
  onMonthChange: (month?: number) => void;
  onBack: () => void;
  onPdfPress: () => void;
  isPdfDownloading: boolean;
};

export type ClientBalanceComponentProps = {
  rows: ClientBalanceRow[];
  totalCustomerBalance: number;
  totalSupplierBalance: number;
  customerCount: number;
  supplierCount: number;
  loading: boolean;
  tab: ClientBalanceTab;
  onTabChange: (tab: ClientBalanceTab) => void;
  search: string;
  onSearchChange: (value: string) => void;
  onRowPress: (clientId: number) => void;
  onBack: () => void;
  onPdfPress: () => void;
  isPdfDownloading: boolean;
};

export type CreditDebitChartProps = {
  rows: CreditDebitRow[];
};

export type CreditDebitComponentProps = {
  rows: CreditDebitRow[];
  totals: CreditDebitTotals;
  loading: boolean;
  filter: ReportPeriodFilter;
  years: number[];
  onYearChange: (year?: number) => void;
  onMonthChange: (month?: number) => void;
  onBack: () => void;
  onPdfPress: () => void;
  isPdfDownloading: boolean;
};

export type SummaryReportComponentProps = {
  totals: SummaryTotals | null;
  expenseCategories: ExpenseCategorySlice[];
  trends: SummaryTrendRow[];
  loading: boolean;
  onBack: () => void;
  onPdfPress: () => void;
  isPdfDownloading: boolean;
};

export type ExpenseBreakdownCardProps = {
  categories: ExpenseCategorySlice[];
};

export type TrendsListProps = {
  trends: SummaryTrendRow[];
};

export type TopBalanceBarsProps = {
  rows: ClientBalanceRow[];
  color: string;
};

export type ClientBalanceRowCardProps = {
  row: ClientBalanceRow;
  onPress: (clientId: number) => void;
};

export type ClientDetailTabContentProps = {
  tab: ClientDetailTab;
  detail: ClientDetailReportData;
};

export type BalanceTrendChartProps = {
  points: BalanceHistoryPoint[];
};

export type ClientDetailReportComponentProps = {
  detail: ClientDetailReportData | null;
  loading: boolean;
  clientItems: SelectItem[];
  pickerVisible: boolean;
  tab: ClientDetailTab;
  onOpenPicker: () => void;
  onClosePicker: () => void;
  onClientPicked: (id: number) => void;
  onTabChange: (tab: ClientDetailTab) => void;
  onBack: () => void;
  onPdfPress: () => void;
  isPdfDownloading: boolean;
};
