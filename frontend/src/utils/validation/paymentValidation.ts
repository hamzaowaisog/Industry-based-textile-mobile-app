import * as Yup from 'yup';

import { AppConstants } from '@constants/appConstants';

import { positiveDecimalString } from './validators';

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
  amount: positiveDecimalString(
    'payments.validation.amountRequired',
    'payments.validation.amountPositive',
  ),
  notes: Yup.string(),
});

export const editPaymentValidationSchema = Yup.object({
  transModeId: Yup.number()
    .required('payments.validation.modeRequired')
    .min(1, 'payments.validation.modeRequired'),
  notes: Yup.string(),
});
