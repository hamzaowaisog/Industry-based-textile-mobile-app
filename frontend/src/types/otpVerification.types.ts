import { RefObject } from 'react';
import { TextInput } from 'react-native';
import { FormikProps } from 'formik';

export type OtpVerificationFormValues = {
  code: string;
};

export type OtpVerificationComponentProps = {
  formik: FormikProps<OtpVerificationFormValues>;
  isPending: boolean;
  email: string;
  digits: string[];
  focusedIndex: number | null;
  inputRefs: RefObject<Array<TextInput | null>>;
  secondsLeft: number;
  canResend: boolean;
  isResending: boolean;
  onDigitChange: (text: string, index: number) => void;
  onKeyPress: (key: string, index: number) => void;
  onFocus: (index: number) => void;
  onBlur: () => void;
  onResend: () => void;
  onBack: () => void;
};
