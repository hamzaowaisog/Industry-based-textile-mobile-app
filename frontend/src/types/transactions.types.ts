export type TransactionRow = {
  id: number;
  clientName: string;
  transTypeId: number;
  transTypeName: string;
  transCategoryId: number;
  transCategoryName: string;
  transModeName: string;
  amount: number;
  transDate: string;
  source: string;
};

export type TransactionSummary = {
  totalCredit: number;
  totalDebit: number;
};

export type TransactionDetail = {
  id: number;
  clientName: string;
  userName: string;
  orderId: number | null;
  purchaseId: number | null;
  transTypeId: number;
  transTypeName: string;
  transModeId: number;
  transModeName: string;
  transCategoryId: number;
  transCategoryName: string;
  amount: number;
  transDate: string;
  notes: string;
  source: string;
  isManual: boolean;
};

export type TransactionListFilter = 'all' | 'credit' | 'debit';

export type TransactionRowCardProps = {
  transaction: TransactionRow;
  onPress: (id: number) => void;
};

export type TransactionListComponentProps = {
  transactions: TransactionRow[];
  totalCount: number;
  totalCredit: number;
  totalDebit: number;
  loading: boolean;
  refreshing: boolean;
  isFetchingNextPage: boolean;
  activeFilter: TransactionListFilter;
  activeCategoryId: number | null;
  search: string;
  onSearchChange: (search: string) => void;
  onFilterChange: (filter: TransactionListFilter) => void;
  onCategoryChange: (categoryId: number | null) => void;
  onPress: (id: number) => void;
  onRefresh: () => void;
  onEndReached: () => void;
  onMenuPress: () => void;
  onListPdfPress: () => void;
  isPdfDownloading: boolean;
};

export type TransactionDetailComponentProps = {
  transaction: TransactionDetail | null;
  loading: boolean;
  onBack: () => void;
  onDossierPdfPress: () => void;
  isDossierPdfDownloading: boolean;
};
