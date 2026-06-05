export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
};

export type PaginatedResponse<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type SelectOption = {
  label: string;
  value: number;
};

export type AppBottomSheetProps = {
  children: import('react').ReactNode;
  snapPoints: readonly string[];
  enablePanDownToClose?: boolean;
};
