import { sqlite } from '../index';

export type ClientBalanceRow = {
  clientId: number;
  name: string;
  balance: number;
};

export type MonthlyProfitLossRow = {
  month: string;
  totalSales: number;
  totalPurchases: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
};

export type MonthlyCreditDebitRow = {
  month: string;
  totalCredit: number;
  totalDebit: number;
  balance: number;
};

export const computeClientBalances = (): ClientBalanceRow[] => {
  // Customers: order_total - received_payments (excluding reversed)
  // Suppliers: purchase_total - paid_payments (excluding reversed)
  // Mirrors backend v_client_balance exactly
  const rows = sqlite.getAllSync<{
    client_id: number;
    name: string;
    balance: number;
  }>(
    `SELECT c.server_id AS client_id, c.name,
            COALESCE(t.doc_total, 0) - COALESCE(p.paid_total, 0) AS balance
     FROM clients c
     LEFT JOIN (
       SELECT client_id, SUM(amount) AS doc_total
       FROM transactions
       WHERE trans_category_id = 1
       GROUP BY client_id
     ) t ON t.client_id = c.server_id
     LEFT JOIN (
       SELECT party_client_server_id, SUM(amount) AS paid_total
       FROM payments
       WHERE payment_direction_id = 1
         AND is_reversed = 0
         AND original_payment_server_id IS NULL
       GROUP BY party_client_server_id
     ) p ON p.party_client_server_id = c.server_id
     WHERE c.client_type_id = 1

     UNION ALL

     SELECT c.server_id, c.name,
            COALESCE(t.doc_total, 0) - COALESCE(p.paid_total, 0) AS balance
     FROM clients c
     LEFT JOIN (
       SELECT client_id, SUM(amount) AS doc_total
       FROM transactions
       WHERE trans_category_id = 2
       GROUP BY client_id
     ) t ON t.client_id = c.server_id
     LEFT JOIN (
       SELECT party_client_server_id, SUM(amount) AS paid_total
       FROM payments
       WHERE payment_direction_id = 2
         AND is_reversed = 0
         AND original_payment_server_id IS NULL
       GROUP BY party_client_server_id
     ) p ON p.party_client_server_id = c.server_id
     WHERE c.client_type_id = 2`,
  );

  return rows.map((r) => ({
    clientId: r.client_id,
    name: r.name,
    balance: r.balance,
  }));
};

export const computeMonthlyProfitLoss = (): MonthlyProfitLossRow[] => {
  const rows = sqlite.getAllSync<{
    month: string;
    total_sales: number;
    total_purchases: number;
    total_expenses: number;
  }>(
    `SELECT strftime('%Y-%m', substr(t.trans_date, 1, 10)) AS month,
            SUM(CASE WHEN t.trans_category_id = 1 THEN t.amount ELSE 0 END) AS total_sales,
            SUM(CASE WHEN t.trans_category_id = 2 THEN t.amount ELSE 0 END) AS total_purchases,
            SUM(CASE WHEN t.trans_category_id IN (3, 4) THEN t.amount ELSE 0 END) AS total_expenses
     FROM transactions t
     WHERE t.trans_date IS NOT NULL
     GROUP BY strftime('%Y-%m', substr(t.trans_date, 1, 10))
     ORDER BY month ASC`,
  );

  return rows.map((r) => ({
    month: r.month,
    totalSales: r.total_sales,
    totalPurchases: r.total_purchases,
    totalExpenses: r.total_expenses,
    grossProfit: r.total_sales - r.total_purchases,
    netProfit: r.total_sales - r.total_purchases - r.total_expenses,
  }));
};

export const computeMonthlyCreditDebit = (): MonthlyCreditDebitRow[] => {
  const rows = sqlite.getAllSync<{
    month: string;
    total_credit: number;
    total_debit: number;
  }>(
    `SELECT strftime('%Y-%m', substr(t.trans_date, 1, 10)) AS month,
            SUM(CASE WHEN t.trans_type_id = 2 THEN t.amount ELSE 0 END) AS total_credit,
            SUM(CASE WHEN t.trans_type_id = 1 THEN t.amount ELSE 0 END) AS total_debit
     FROM transactions t
     WHERE t.trans_date IS NOT NULL
     GROUP BY strftime('%Y-%m', substr(t.trans_date, 1, 10))
     ORDER BY month ASC`,
  );

  return rows.map((r) => ({
    month: r.month,
    totalCredit: r.total_credit,
    totalDebit: r.total_debit,
    balance: r.total_credit - r.total_debit,
  }));
};
