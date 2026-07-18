import type {
  ClientBalanceViewModel,
  ClientDetailViewModel,
  ClientOrderSummary,
  ClientPaymentSummary,
  ClientPurchaseSummary,
  CreditDebitViewModel,
  ProfitLossViewModel,
  SummaryTotalsViewModel,
} from '@api/models';

import type { SelectItem } from '../../types/common.types';
import type {
  ClientBalanceRow,
  ClientDetailReportData,
  ClientOrderRow,
  ClientPaymentRow,
  ClientPurchaseRow,
  CreditDebitRow,
  CreditDebitTotals,
  ProfitLossRow,
  ProfitLossTotals,
  SummaryTotals,
} from '../../types/reports.types';

export const mapApiProfitLossRow = (v: ProfitLossViewModel): ProfitLossRow => ({
  month: v.month ?? '',
  totalSales: v.totalSales ?? 0,
  totalPurchases: v.totalPurchases ?? 0,
  totalExpenses: v.totalExpenses ?? 0,
  grossProfit: v.grossProfit ?? 0,
  netProfit: v.netProfit ?? 0,
});

export const computeProfitLossTotals = (rows: ProfitLossRow[]): ProfitLossTotals =>
  rows.reduce(
    (acc, r) => ({
      totalSales: acc.totalSales + r.totalSales,
      totalPurchases: acc.totalPurchases + r.totalPurchases,
      totalExpenses: acc.totalExpenses + r.totalExpenses,
      grossProfit: acc.grossProfit + r.grossProfit,
      netProfit: acc.netProfit + r.netProfit,
    }),
    { totalSales: 0, totalPurchases: 0, totalExpenses: 0, grossProfit: 0, netProfit: 0 },
  );

export const mapApiClientBalanceRow = (v: ClientBalanceViewModel): ClientBalanceRow => ({
  clientId: v.clientId ?? 0,
  name: v.name ?? '',
  clientTypeName: v.clientTypeName ?? '',
  balance: v.balance ?? 0,
});

export const mapApiCreditDebitRow = (v: CreditDebitViewModel): CreditDebitRow => ({
  month: v.month ?? '',
  totalCredit: v.totalCredit ?? 0,
  totalDebit: v.totalDebit ?? 0,
  balance: v.balance ?? 0,
});

export const computeCreditDebitTotals = (rows: CreditDebitRow[]): CreditDebitTotals => {
  const totalCredit = rows.reduce((s, r) => s + r.totalCredit, 0);
  const totalDebit = rows.reduce((s, r) => s + r.totalDebit, 0);
  return { totalCredit, totalDebit, netBalance: totalCredit - totalDebit };
};

export const mapApiSummaryTotals = (v: SummaryTotalsViewModel): SummaryTotals => ({
  totalSalesAmount: v.totalSalesAmount ?? 0,
  totalPurchasesAmount: v.totalPurchasesAmount ?? 0,
  totalExpensesAmount: v.totalExpensesAmount ?? 0,
  totalOrderCount: v.totalOrderCount ?? 0,
  totalPurchaseCount: v.totalPurchaseCount ?? 0,
  totalClientsCount: v.totalClientsCount ?? 0,
});

const mapApiClientOrderRow = (v: ClientOrderSummary): ClientOrderRow => ({
  orderId: v.orderId ?? 0,
  orderDate: v.orderDate ?? '',
  statusName: v.statusName ?? '',
  total: v.total ?? 0,
  amountPaid: v.amountPaid ?? 0,
  outstanding: v.outstanding ?? 0,
  paymentStatus: v.paymentStatus ?? '',
});

const mapApiClientPurchaseRow = (v: ClientPurchaseSummary): ClientPurchaseRow => ({
  purchaseId: v.purchaseId ?? 0,
  purchaseDate: v.purchaseDate ?? '',
  statusName: v.statusName ?? '',
  total: v.total ?? 0,
  amountPaid: v.amountPaid ?? 0,
  outstanding: v.outstanding ?? 0,
  paymentStatus: v.paymentStatus ?? '',
});

const mapApiClientPaymentRow = (v: ClientPaymentSummary): ClientPaymentRow => ({
  paymentId: v.paymentId ?? 0,
  paymentDate: v.paymentDate ?? '',
  directionName: v.directionName ?? '',
  modeName: v.modeName ?? '',
  amount: v.amount ?? 0,
  isReversed: v.isReversed ?? false,
});

export const mapApiClientDetail = (v: ClientDetailViewModel): ClientDetailReportData => ({
  clientId: v.clientId ?? 0,
  clientName: v.clientName ?? '',
  clientTypeName: v.clientTypeName ?? '',
  totalOrderCount: v.totalOrderCount ?? 0,
  totalOrderAmount: v.totalOrderAmount ?? 0,
  totalPurchaseCount: v.totalPurchaseCount ?? 0,
  totalPurchaseAmount: v.totalPurchaseAmount ?? 0,
  totalPaymentsIn: v.totalPaymentsIn ?? 0,
  totalPaymentsOut: v.totalPaymentsOut ?? 0,
  outstanding: v.outstanding ?? 0,
  balance: v.balance ?? 0,
  orders: (v.orders ?? []).map(mapApiClientOrderRow),
  purchases: (v.purchases ?? []).map(mapApiClientPurchaseRow),
  payments: (v.payments ?? []).map(mapApiClientPaymentRow),
});

export const mapClientDetailListToSelectItems = (list: ClientDetailViewModel[]): SelectItem[] =>
  list.map((v) => ({
    id: v.clientId ?? 0,
    name: v.clientName ?? '',
    subtitle: v.clientTypeName ?? '',
  }));
