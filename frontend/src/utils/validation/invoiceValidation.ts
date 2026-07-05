import * as Yup from 'yup';

import { isInvoiceLineValid } from '@utils/helpers/invoiceContent';

import type { InvoiceLineFormValues } from '../../types/invoices.types';

export const createInvoiceValidationSchema = Yup.object({
  clientId: Yup.number()
    .nullable()
    .required('invoices.validation.clientRequired')
    .min(1, 'invoices.validation.clientRequired'),
  dueDate: Yup.string(),
  notes: Yup.string(),
  lines: Yup.array()
    .min(1, 'invoices.validation.linesRequired')
    .test('lines-valid', 'invoices.validation.lineInvalid', (lines) =>
      (lines ?? ([] as InvoiceLineFormValues[])).every(isInvoiceLineValid),
    ),
});

export const editInvoiceValidationSchema = Yup.object({
  invoiceStatusId: Yup.number().required().min(1),
  dueDate: Yup.string(),
  notes: Yup.string(),
  lines: Yup.array().test('lines-valid', 'invoices.validation.lineInvalid', (lines) =>
    (lines ?? ([] as InvoiceLineFormValues[])).every(isInvoiceLineValid),
  ),
});
