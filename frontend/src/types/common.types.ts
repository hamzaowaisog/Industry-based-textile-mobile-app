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

export type AppButtonVariant =
  | 'primary'
  | 'success'
  | 'danger'
  | 'ghost'
  | 'soft'
  | 'softDanger'
  | 'link';

export type AppButtonSize = 'sm' | 'md' | 'lg';

export type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  fullWidth?: boolean;
  Icon?: ComponentType<IconProps>;
  disabled?: boolean;
  loading?: boolean;
};

export type AppCardTone =
  | 'surface'
  | 'primaryLight'
  | 'successLight'
  | 'warningLight'
  | 'dangerLight';

export type AppCardProps = {
  children: import('react').ReactNode;
  padding?: number;
  tone?: AppCardTone;
  elevated?: boolean;
  onPress?: () => void;
};

export type AppBadgeProps = {
  label: string;
  bg: string;
  fg: string;
  size?: 'sm' | 'md';
};

export type AppAmountTone = 'credit' | 'debit' | 'neutral' | 'primary';

export type AppAmountProps = {
  value: number;
  tone?: AppAmountTone;
  size?: number;
  prefix?: string;
};

export type AppRowProps = {
  leading?: import('react').ReactNode;
  primary: string;
  secondary?: string;
  right?: import('react').ReactNode;
  rightSub?: string;
  onPress?: () => void;
  chevron?: boolean;
};

export type AppAvatarProps = {
  label: string;
  color?: string;
  size?: number;
};

export type AppIconTileProps = {
  Icon: ComponentType<IconProps>;
  color?: string;
  size?: number;
  soft?: boolean;
};

export type AppStatCardProps = {
  tint?: string;
  Icon: ComponentType<IconProps>;
  label: string;
  value: string;
  sub?: string;
  trend?: number;
};

export type AppBottomBarProps = {
  children: import('react').ReactNode;
};

export type AppStepIndicatorProps = {
  steps: string[];
  current: number;
};

export type AppSectionProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export type PdfButtonProps = {
  onPress: () => void;
  isLoading: boolean;
  size?: number;
  color?: string;
};

export type InputFieldProps = {
  label: string;
  required?: boolean;
  value: string;
  onChangeText: (v: string) => void;
  onBlur: () => void;
  placeholder?: string;
  error?: string;
  helper?: string;
  leading?: import('react').ReactNode;
  trailing?: import('react').ReactNode;
  keyboardType?:
    | 'default'
    | 'numeric'
    | 'phone-pad'
    | 'decimal-pad'
    | 'email-address'
    | 'numbers-and-punctuation';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  secureTextEntry?: boolean;
  returnKeyType?: 'next' | 'done' | 'default';
  submitBehavior?: 'submit' | 'blurAndSubmit' | 'newline';
  multiline?: boolean;
  numberOfLines?: number;
  onSubmitEditing?: () => void;
  editable?: boolean;
  onFocus?: () => void;
};

export type AppDatePickerProps = {
  label?: string;
  required?: boolean;
  value: string;
  onChange: (isoDate: string) => void;
  placeholder?: string;
  error?: string;
  helper?: string;
  maximumDate?: Date;
  minimumDate?: Date;
};
