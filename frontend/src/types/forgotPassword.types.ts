import { FormikProps } from 'formik';

export type ForgotPasswordFormValues = {
  email: string;
};

export type ForgotPasswordComponentProps = {
  formik: FormikProps<ForgotPasswordFormValues>;
  isPending: boolean;
  onBack: () => void;
  onSignIn: () => void;
};
