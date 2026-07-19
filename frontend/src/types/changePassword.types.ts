export type ChangePasswordFormValues = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type ChangePasswordComponentProps = {
  values: ChangePasswordFormValues;
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean | undefined>;
  submitting: boolean;
  showOldPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  onToggleOldPassword: () => void;
  onToggleNewPassword: () => void;
  onToggleConfirmPassword: () => void;
  setFieldValue: (field: string, value: string) => void;
  setFieldTouched: (field: string, touched?: boolean) => void;
  handleSubmit: () => void;
  onCancel: () => void;
};
