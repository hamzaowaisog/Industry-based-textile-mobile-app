import { FormikProps } from 'formik';

export type LoginFormValues = {
  userName: string;
  password: string;
};

export type LoginData = {
  token: string;
  refreshToken: string;
  userId: number;
  roleId: number;
  userName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  expiresAt: string;
  refreshTokenExpiresAt: string;
};

export type LoginResponse = {
  success?: boolean;
  message?: string | null;
  data?: LoginData;
  errors?: string[] | null;
};

export type LoginOptions = {
  credentials: LoginFormValues;
  rememberMe: boolean;
};

export type LoginComponentProps = {
  formik: FormikProps<LoginFormValues>;
  showPassword: boolean;
  rememberMe: boolean;
  onTogglePassword: () => void;
  onToggleRemember: () => void;
  onForgotPassword: () => void;
  onBiometric: () => void;
  onRequestAccess: () => void;
};
