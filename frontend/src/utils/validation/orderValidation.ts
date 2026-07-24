import * as Yup from 'yup';

import { positiveDecimalString } from './validators';

export const createOrderStep1Schema = Yup.object({
  clientId: Yup.number().nullable().required('orders.create.selectCustomerError'),
  paymentTypeId: Yup.number().required(),
  notes: Yup.string(),
  billNo: Yup.string().max(50, 'orders.validation.billNoMaxLength'),
});

const lineSchema = Yup.object({
  productId: Yup.number().required(),
  qty: positiveDecimalString('orders.validation.qtyRequired', 'orders.validation.qtyPositive'),
  unitPrice: positiveDecimalString(
    'orders.validation.unitPriceRequired',
    'orders.validation.unitPricePositive',
  ),
});

export const createOrderStep2Schema = Yup.object({
  lines: Yup.array().of(lineSchema).min(1, 'orders.create.noLinesError'),
});

export const editOrderStep1Schema = Yup.object({
  paymentTypeId: Yup.number().required(),
  notes: Yup.string(),
  billNo: Yup.string().max(50, 'orders.validation.billNoMaxLength'),
});

export const editOrderStep2Schema = Yup.object({
  lines: Yup.array().of(lineSchema).min(1, 'orders.edit.noLinesError'),
});
