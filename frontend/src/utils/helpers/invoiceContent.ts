import { colors } from '@theme/colors';

import { AppConstants } from '../../constants/appConstants';
import type {
  InvoiceLineFormValues,
  InvoiceStatusTab,
} from '../../types/invoices.types';

export type InvoiceStatusConfig = {
  bg: string;
  fg: string;
};

export const INVOICE_STATUS_CONFIG: Record<number, InvoiceStatusConfig> = {
  [AppConstants.INVOICE_STATUS.DRAFT]: { bg: colors.violetLight, fg: colors.violet },
  [AppConstants.INVOICE_STATUS.ISSUED]: { bg: colors.primaryLight, fg: colors.primary },
  [AppConstants.INVOICE_STATUS.PAID]: { bg: colors.successLight, fg: colors.success },
  [AppConstants.INVOICE_STATUS.CANCELLED]: { bg: colors.dangerLight, fg: colors.danger },
};

export const getInvoiceStatusConfig = (statusId: number): InvoiceStatusConfig =>
  INVOICE_STATUS_CONFIG[statusId] ?? { bg: colors.bgAlt, fg: colors.textSecondary };

export const INVOICE_STATUS_TAB_ID_MAP: Record<InvoiceStatusTab, number | null> = {
  all: null,
  draft: AppConstants.INVOICE_STATUS.DRAFT,
  issued: AppConstants.INVOICE_STATUS.ISSUED,
  paid: AppConstants.INVOICE_STATUS.PAID,
};

export const INVOICE_STATUS_TABS: { id: InvoiceStatusTab; labelKey: string }[] = [
  { id: 'all', labelKey: 'invoices.tabs.all' },
  { id: 'draft', labelKey: 'invoices.tabs.draft' },
  { id: 'issued', labelKey: 'invoices.tabs.issued' },
  { id: 'paid', labelKey: 'invoices.tabs.paid' },
];

export const isInvoiceReceivable = (direction: string): boolean =>
  direction === 'Receivable';

/**
 * An invoice is overdue when it is Issued, still has an outstanding balance,
 * and its due date (formatted "dd MMM, yyyy" by the backend) is in the past.
 */
export const isInvoiceOverdue = (
  statusId: number,
  dueDate: string | null,
  outstanding: number,
): boolean => {
  if (statusId !== AppConstants.INVOICE_STATUS.ISSUED) return false;
  if (!dueDate || outstanding <= 0) return false;

  const d = new Date(dueDate.replace(',', ''));
  if (Number.isNaN(d.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
};

export const isInvoiceLineValid = (line: InvoiceLineFormValues): boolean => {
  const qty = parseFloat(line.qty);
  const price = parseFloat(line.unitPrice);
  return (
    line.productName.trim().length > 0 &&
    !Number.isNaN(qty) &&
    qty > 0 &&
    !Number.isNaN(price) &&
    price > 0
  );
};

export const sumInvoiceLines = (lines: InvoiceLineFormValues[]): number =>
  lines.reduce((sum, l) => sum + (parseFloat(l.qty) || 0) * (parseFloat(l.unitPrice) || 0), 0);
