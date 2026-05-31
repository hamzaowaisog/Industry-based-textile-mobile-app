import { FormikProps } from 'formik';

export type RegisterFormValues = {
  name: string;
  email: string;
  userName: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
};

export type RegisterComponentProps = {
  formik: FormikProps<RegisterFormValues>;
  isPending: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  onBack: () => void;
  onSignIn: () => void;
};
