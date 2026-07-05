export type ExpenseRow = {
  id: number;
  expenseTypeId: number;
  expenseTypeName: string;
  transModeId: number;
  transModeName: string;
  transCategoryName: string;
  amount: number;
  expenseDate: string;
  notes: string | null;
};

export type ExpenseDetail = {
  id: number;
  expenseTypeId: number;
  expenseTypeName: string;
  transModeId: number;
  transModeName: string;
  transCategoryId: number | null;
  transCategoryName: string;
  transactionId: number | null;
  amount: number;
  expenseDate: string;
  notes: string | null;
  recordedByName: string | null;
  createdAt: string | null;
};

export type ExpenseCategorySlice = {
  expenseTypeId: number;
  name: string;
  amount: number;
};

export type ExpenseMonthSummary = {
  total: number;
  entryCount: number;
  categories: ExpenseCategorySlice[];
};

export type AddExpenseFormValues = {
  expenseTypeId: number | null;
  amount: string;
  transModeId: number;
  expenseDate: string;
  notes: string;
};

export type EditExpenseFormValues = {
  amount: string;
  transModeId: number;
  expenseDate: string;
  notes: string;
};

export type ExpenseStore = {
  currentExpense: ExpenseDetail | null;
  detailLoading: boolean;
  submitting: boolean;
  error: string | null;

  fetchExpenseDetail: (expenseId: number) => Promise<void>;
  createExpense: (
    values: AddExpenseFormValues,
  ) => Promise<{ success: boolean; error?: string; expenseId?: number }>;
  updateExpense: (
    expenseId: number,
    values: EditExpenseFormValues,
  ) => Promise<{ success: boolean; error?: string }>;
  deleteExpense: (expenseId: number) => Promise<{ success: boolean; error?: string }>;
  clearCurrentExpense: () => void;
  prepareDetailLoad: () => void;
};

export type ExpenseDonutSlice = {
  value: number;
  color: string;
};

export type ExpenseDonutProps = {
  slices: ExpenseDonutSlice[];
  size: number;
};

export type ExpenseSummaryCardProps = {
  summary: ExpenseMonthSummary | null;
  loading: boolean;
};

export type ExpenseRowCardProps = {
  expense: ExpenseRow;
  onPress: (id: number) => void;
};

export type ExpenseCategoryFilter = 'all' | number;

export type ExpenseCategoryOption = {
  id: number;
  name: string;
};

export type ExpenseListComponentProps = {
  expenses: ExpenseRow[];
  totalCount: number;
  summary: ExpenseMonthSummary | null;
  summaryLoading: boolean;
  loading: boolean;
  refreshing: boolean;
  isFetchingNextPage: boolean;
  search: string;
  categories: ExpenseCategoryOption[];
  activeCategory: ExpenseCategoryFilter;
  onPress: (id: number) => void;
  onRefresh: () => void;
  onEndReached: () => void;
  onSearchChange: (text: string) => void;
  onCategoryChange: (category: ExpenseCategoryFilter) => void;
  onAddExpense: () => void;
  onMenuPress: () => void;
  onListPdfPress: () => void;
  isPdfDownloading: boolean;
};

export type ExpenseDetailComponentProps = {
  expense: ExpenseDetail | null;
  loading: boolean;
  submitting: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  onBack: () => void;
  onEdit: (expenseId: number) => void;
  onDelete: () => void;
  onDossierPdfPress: () => void;
  isDossierPdfDownloading: boolean;
};

export type AddExpenseComponentProps = {
  submitting: boolean;
  values: AddExpenseFormValues;
  errors: Partial<Record<keyof AddExpenseFormValues, string>>;
  touched: Partial<Record<keyof AddExpenseFormValues, boolean>>;
  expenseTypes: { id: number; name: string }[];
  transModes: { id: number; name: string }[];
  onBack: () => void;
  onSubmit: () => void;
  onFieldChange: (field: keyof AddExpenseFormValues, value: unknown) => void;
  onFieldBlur: (field: keyof AddExpenseFormValues) => void;
};

export type EditExpenseComponentProps = {
  submitting: boolean;
  loading: boolean;
  expense: ExpenseDetail | null;
  values: EditExpenseFormValues;
  errors: Partial<Record<keyof EditExpenseFormValues, string>>;
  touched: Partial<Record<keyof EditExpenseFormValues, boolean>>;
  transModes: { id: number; name: string }[];
  onBack: () => void;
  onSubmit: () => void;
  onFieldChange: (field: keyof EditExpenseFormValues, value: unknown) => void;
  onFieldBlur: (field: keyof EditExpenseFormValues) => void;
};
