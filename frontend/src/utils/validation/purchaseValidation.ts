import * as Yup from 'yup';

import { positiveDecimalString } from './validators';

export const createPurchaseStep1Schema = Yup.object({
  supplierId: Yup.number().nullable().required('purchases.create.selectSupplierError'),
  paymentTypeId: Yup.number().required(),
  notes: Yup.string(),
  billNo: Yup.string().max(50, 'purchases.validation.billNoMaxLength'),
});

const lineSchema = Yup.object({
  productId: Yup.number().required(),
  qty: positiveDecimalString(
    'purchases.validation.qtyRequired',
    'purchases.validation.qtyPositive',
  ),
  unitCost: positiveDecimalString(
    'purchases.validation.unitCostRequired',
    'purchases.validation.unitCostPositive',
  ),
});

export const createPurchaseStep2Schema = Yup.object({
  lines: Yup.array().of(lineSchema).min(1, 'purchases.create.noLinesError'),
});

export const editPurchaseStep1Schema = Yup.object({
  paymentTypeId: Yup.number().required(),
  notes: Yup.string(),
  billNo: Yup.string().max(50, 'purchases.validation.billNoMaxLength'),
});

export const editPurchaseStep2Schema = Yup.object({
  lines: Yup.array().of(lineSchema).min(1, 'purchases.edit.noLinesError'),
});
