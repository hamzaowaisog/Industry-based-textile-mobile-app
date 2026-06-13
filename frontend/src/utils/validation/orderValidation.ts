import * as Yup from 'yup';

export const createOrderStep1Schema = Yup.object({
  clientId: Yup.number().nullable().required('orders.create.selectCustomerError'),
  paymentTypeId: Yup.number().required(),
  orderDate: Yup.string().required(),
  notes: Yup.string(),
});

export const createOrderStep2Schema = Yup.object({
  lines: Yup.array()
    .of(
      Yup.object({
        productId: Yup.number().required(),
        qty: Yup.string().required(),
        unitPrice: Yup.string().required(),
      }),
    )
    .min(1, 'orders.create.noLinesError'),
});

export const editOrderStep1Schema = Yup.object({
  paymentTypeId: Yup.number().required(),
  notes: Yup.string(),
});

export const editOrderStep2Schema = Yup.object({
  lines: Yup.array()
    .of(
      Yup.object({
        productId: Yup.number().required(),
        qty: Yup.string().required(),
        unitPrice: Yup.string().required(),
      }),
    )
    .min(1, 'orders.edit.noLinesError'),
});
