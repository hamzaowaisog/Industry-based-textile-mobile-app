import * as Yup from 'yup';

import { positiveDecimalString } from './validators';

export const addExpenseValidationSchema = Yup.object({
  expenseTypeId: Yup.number()
    .nullable()
    .required('expenses.validation.typeRequired')
    .min(1, 'expenses.validation.typeRequired'),
  transModeId: Yup.number()
    .required('expenses.validation.modeRequired')
    .min(1, 'expenses.validation.modeRequired'),
  amount: positiveDecimalString(
    'expenses.validation.amountRequired',
    'expenses.validation.amountPositive',
  ),
  notes: Yup.string(),
});

export const editExpenseValidationSchema = Yup.object({
  transModeId: Yup.number()
    .required('expenses.validation.modeRequired')
    .min(1, 'expenses.validation.modeRequired'),
  amount: positiveDecimalString(
    'expenses.validation.amountRequired',
    'expenses.validation.amountPositive',
  ),
  notes: Yup.string(),
});
