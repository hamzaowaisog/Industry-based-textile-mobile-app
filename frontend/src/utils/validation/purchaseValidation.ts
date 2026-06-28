import * as Yup from 'yup';

export const createPurchaseStep1Schema = Yup.object({
  supplierId: Yup.number().nullable().required('purchases.create.selectSupplierError'),
  paymentTypeId: Yup.number().required(),
  notes: Yup.string(),
});

export const createPurchaseStep2Schema = Yup.object({
  lines: Yup.array()
    .of(
      Yup.object({
        productId: Yup.number().required(),
        qty: Yup.string().required(),
        unitCost: Yup.string().required(),
      }),
    )
    .min(1, 'purchases.create.noLinesError'),
});

export const editPurchaseStep1Schema = Yup.object({
  paymentTypeId: Yup.number().required(),
  notes: Yup.string(),
});

export const editPurchaseStep2Schema = Yup.object({
  lines: Yup.array()
    .of(
      Yup.object({
        productId: Yup.number().required(),
        qty: Yup.string().required(),
        unitCost: Yup.string().required(),
      }),
    )
    .min(1, 'purchases.edit.noLinesError'),
});
