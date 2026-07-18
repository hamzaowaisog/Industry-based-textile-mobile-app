export type UserFilter = 'all' | 'admin' | 'staff';

export type UserFilterOption = { value: UserFilter; labelKey: string };

export type UserRow = {
  id: number;
  name: string;
  email: string;
  userName: string;
  roleId: number;
  roleName: string;
  isActive: boolean;
  initials: string;
};

export type UserDetail = {
  id: number;
  name: string;
  email: string;
  userName: string;
  roleId: number;
  roleName: string;
  phoneNumber: string | null;
  isActive: boolean;
  createdAt: string | null;
};

export type RoleOption = {
  id: number;
  labelKey: string;
  descKey: string;
};

export type CreateUserFormValues = {
  name: string;
  email: string;
  userName: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  roleId: number;
};

export type UserRowCardProps = {
  item: UserRow;
  onPress: (id: number) => void;
};

export type UserListEmptyStateProps = {
  onAddFirstUser: () => void;
};

export type UserListComponentProps = {
  users: UserRow[];
  totalCount: number;
  filter: UserFilter;
  search: string;
  loading: boolean;
  refreshing: boolean;
  onFilterChange: (f: UserFilter) => void;
  onSearchChange: (s: string) => void;
  onRowPress: (id: number) => void;
  onRefresh: () => void;
  onFab: () => void;
  onMenuPress: () => void;
  onAddFirstUser: () => void;
  onListPdfPress: () => void;
  isPdfDownloading: boolean;
};

export type UserDetailComponentProps = {
  user: UserDetail | null;
  loading: boolean;
  submitting: boolean;
  onBack: () => void;
  onDelete: () => void;
};

export type CreateUserComponentProps = {
  values: CreateUserFormValues;
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean | undefined>;
  submitting: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  setFieldValue: (field: string, value: unknown) => void;
  setFieldTouched: (field: string, touched?: boolean) => void;
  handleSubmit: () => void;
  onCancel: () => void;
};
