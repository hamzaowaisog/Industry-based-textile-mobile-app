import type { ComponentType } from 'react';

import type { IconProps } from './icon.types';

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

export type AppBannerProps = {
  visible: boolean;
  title: string;
  body: string;
  Icon: ComponentType<IconProps>;
  iconColor: string;
  onPress: () => void;
  onDismiss: () => void;
  autoDismissMs?: number;
};

export type SelectItem = {
  id: number;
  name: string;
  subtitle?: string;
};

export type AppSelectModalProps = {
  visible: boolean;
  title: string;
  items: SelectItem[];
  selectedId?: number;
  onSelect: (id: number, name: string) => void;
  onClose: () => void;
  searchPlaceholder?: string;
};

export type AppPermissionModalProps = {
  visible: boolean;
  Icon: ComponentType<IconProps>;
  iconColor?: string;
  title: string;
  body: string;
  primaryLabel: string;
  secondaryLabel: string;
  onPrimary: () => void;
  onSecondary: () => void;
};

export type FieldLabelProps = {
  label: string;
  required?: boolean;
};

export type InputFieldProps = {
  label: string;
  required?: boolean;
  value: string;
  onChangeText: (v: string) => void;
  onBlur: () => void;
  placeholder: string;
  error?: string;
  helper?: string;
  leading?: import('react').ReactNode;
  keyboardType?: 'default' | 'numeric' | 'phone-pad' | 'decimal-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  returnKeyType?: 'next' | 'done' | 'default';
  submitBehavior?: 'submit' | 'blurAndSubmit' | 'newline';
  multiline?: boolean;
  numberOfLines?: number;
  onSubmitEditing?: () => void;
  editable?: boolean;
};
