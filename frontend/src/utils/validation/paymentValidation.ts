import * as Yup from 'yup';

import { AppConstants } from '@constants/appConstants';

export const recordPaymentValidationSchema = Yup.object({
  partyClientId: Yup.number()
    .nullable()
    .required('payments.validation.clientRequired')
    .min(1, 'payments.validation.clientRequired'),
  paymentDirectionId: Yup.number()
    .required('payments.validation.directionRequired')
    .oneOf(
      [AppConstants.PAYMENT_DIRECTION.RECEIVED, AppConstants.PAYMENT_DIRECTION.PAID],
      'payments.validation.directionRequired',
    ),
  transModeId: Yup.number()
    .required('payments.validation.modeRequired')
    .min(1, 'payments.validation.modeRequired'),
  amount: Yup.string()
    .required('payments.validation.amountRequired')
    .test('positive', 'payments.validation.amountPositive', (v) => {
      const n = parseFloat(v ?? '');
      return !Number.isNaN(n) && n > 0;
    }),
  notes: Yup.string(),
});

export const editPaymentValidationSchema = Yup.object({
  transModeId: Yup.number()
    .required('payments.validation.modeRequired')
    .min(1, 'payments.validation.modeRequired'),
  notes: Yup.string(),
});
