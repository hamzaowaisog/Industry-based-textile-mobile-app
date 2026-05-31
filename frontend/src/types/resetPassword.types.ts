import { FormikProps } from 'formik';

export type PasswordRule = {
  labelKey: string;
  met: (pw: string) => boolean;
};

export type ResetPasswordFormValues = {
  newPassword: string;
  confirmPassword: string;
};

export type ResetPasswordComponentProps = {
  formik: FormikProps<ResetPasswordFormValues>;
  isPending: boolean;
  showNew: boolean;
  showConfirm: boolean;
  onToggleNew: () => void;
  onToggleConfirm: () => void;
  onBack: () => void;
};
