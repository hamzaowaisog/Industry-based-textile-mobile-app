import { ComponentType } from 'react';

import { FormikProps } from 'formik';

export type ForgotPasswordFormValues = {
  email: string;
};

export type ForgotPasswordStep = {
  Icon: ComponentType<{ size?: number; color?: string }>;
  bg: string;
  color: string;
  labelKey: string;
};

export type ForgotPasswordComponentProps = {
  formik: FormikProps<ForgotPasswordFormValues>;
  isPending: boolean;
  onBack: () => void;
  onSignIn: () => void;
};
