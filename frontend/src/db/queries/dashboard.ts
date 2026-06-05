import { sqlite } from '../index';

// ── Types (mirrors backend DashboardDto) ──

export type LocalDashboardFinancials = {
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  thisMonthPurchases: number;
  thisMonthExpenses: number;
  thisMonthNetProfit: number;
  totalOutstanding: number;
};

export type LocalDashboardOperations = {
  todayOrdersCount: number;
  todayOrdersTotal: number;
  pendingOrdersCount: number;
  unallocatedPaymentsCount: number;
};

export type LocalDashboardAlerts = {
  lowStockCount: number;
  overdueInvoicesCount: number;
};

export type LocalRecentOrder = {
  orderId: number;
  clientName: string;
  total: number;
  statusName: string;
  orderDate: string;
};

export type LocalRecentPurchase = {
  purchaseId: number;
  supplierName: string;
  total: number;
  statusName: string;
  purchaseDate: string;
};

export type LocalDashboardSummary = {
  asOf: string;
  financials: LocalDashboardFinancials;
  operations: LocalDashboardOperations;
  alerts: LocalDashboardAlerts;
  recentOrders: LocalRecentOrder[];
  recentPurchases: LocalRecentPurchase[];
};

export type LocalMonthlyOverviewItem = {
  month: string;
  totalSales: number;
  totalPurchases: number;
  totalExpenses: number;
  netProfit: number;
};

// ── Helpers ──

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getToday = (): string => new Date().toISOString().slice(0, 10);

const getCurrentMonthStart = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
};

const getNextMonthStart = (): string => {
  const now = new Date();
  now.setMonth(now.getMonth() + 1);
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
};

const getLastMonthStart = (): string => {
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
};

const formatMonth = (isoMonth: string): string => {
  // "2026-04" → "Apr 2026"
  const [year, mon] = isoMonth.split('-');
  return `${MONTH_NAMES[parseInt(mon, 10) - 1]} ${year}`;
};

// ── Computed Queries ──

export const computeDashboardSummary = (limit = 5): LocalDashboardSummary => {
  const today = getToday();
  const curStart = getCurrentMonthStart();
  const curEnd = getNextMonthStart();
  const prevStart = getLastMonthStart();

  // ── Financials: current month ──
  // Backend: WHERE transDate >= currentMonthStart AND transDate < nextMonthStart
  const curFin = sqlite.getAllSync<{ sales: number | null; purchases: number | null; expenses: number | null }>(
    `SELECT SUM(CASE WHEN trans_category_id = 1 THEN amount ELSE 0 END) AS sales,
            SUM(CASE WHEN trans_category_id = 2 THEN amount ELSE 0 END) AS purchases,
            SUM(CASE WHEN trans_category_id IN (3, 4) THEN amount ELSE 0 END) AS expenses
     FROM transactions
     WHERE trans_date IS NOT NULL
       AND trans_date >= ? AND trans_date < ?`,
    [curStart, curEnd],
  )[0];

  const thisMonthRevenue = curFin?.sales ?? 0;
  const thisMonthPurchases = curFin?.purchases ?? 0;
  const thisMonthExpenses = curFin?.expenses ?? 0;

  // ── Financials: last month revenue ──
  const prevFin = sqlite.getAllSync<{ sales: number | null }>(
    `SELECT SUM(CASE WHEN trans_category_id = 1 THEN amount ELSE 0 END) AS sales
     FROM transactions
     WHERE trans_date IS NOT NULL
       AND trans_date >= ? AND trans_date < ?
       AND trans_category_id = 1`,
    [prevStart, curStart],
  )[0];
  const lastMonthRevenue = prevFin?.sales ?? 0;

  // ── Total outstanding = sum of positive client balances ──
  // Mirrors backend: VClientBalances.Where(b => b.Balance > 0).Sum()
  const outstanding = sqlite.getAllSync<{ total: number | null }>(
    `SELECT COALESCE(SUM(CASE WHEN bal > 0 THEN bal ELSE 0 END), 0) AS total FROM (
       SELECT COALESCE(t.doc_total, 0) - COALESCE(p.paid_total, 0) AS bal
       FROM clients c
       LEFT JOIN (
         SELECT client_id, SUM(amount) AS doc_total
         FROM transactions WHERE trans_category_id = 1 GROUP BY client_id
       ) t ON t.client_id = c.server_id
       LEFT JOIN (
         SELECT party_client_server_id, SUM(amount) AS paid_total
         FROM payments
         WHERE payment_direction_id = 1 AND is_reversed = 0 AND original_payment_server_id IS NULL
         GROUP BY party_client_server_id
       ) p ON p.party_client_server_id = c.server_id
       WHERE c.client_type_id = 1

       UNION ALL

       SELECT COALESCE(t.doc_total, 0) - COALESCE(p.paid_total, 0)
       FROM clients c
       LEFT JOIN (
         SELECT client_id, SUM(amount) AS doc_total
         FROM transactions WHERE trans_category_id = 2 GROUP BY client_id
       ) t ON t.client_id = c.server_id
       LEFT JOIN (
         SELECT party_client_server_id, SUM(amount) AS paid_total
         FROM payments
         WHERE payment_direction_id = 2 AND is_reversed = 0 AND original_payment_server_id IS NULL
         GROUP BY party_client_server_id
       ) p ON p.party_client_server_id = c.server_id
       WHERE c.client_type_id = 2
    )`,
  );
  const totalOutstanding = outstanding[0]?.total ?? 0;

  // ── Operations ──
  // Backend: today's orders with total = sum(ol.Qty * ol.UnitPrice)
  // LEFT JOIN so orders with no lines are still counted; COUNT(DISTINCT) avoids
  // inflating count when an order has multiple lines.
  const todayOrders = sqlite.getAllSync<{ count: number; total: number }>(
    `SELECT COUNT(DISTINCT o.id) AS count,
            COALESCE(SUM(ol.qty * ol.unit_price), 0) AS total
     FROM orders o
     LEFT JOIN order_lines ol ON ol.order_id = o.id
     WHERE o.order_date = ?`,
    [today],
  );

  // Backend: pending orders = status_id IN (1, 2)
  const pendingOrders = sqlite.getAllSync<{ count: number }>(
    `SELECT COUNT(*) AS count FROM orders WHERE status_id IN (1, 2)`,
  );

  // Backend: unallocated = not reversed AND !Allocations.Any()
  const unallocatedPayments = sqlite.getAllSync<{ count: number }>(
    `SELECT COUNT(*) AS count FROM payments p
     WHERE p.is_reversed = 0
       AND NOT EXISTS (
         SELECT 1 FROM payment_allocations pa
         WHERE pa.payment_server_id = p.server_id
       )`,
  );

  // ── Alerts ──
  // Backend: quantity <= reorder_level
  const lowStock = sqlite.getAllSync<{ count: number }>(
    `SELECT COUNT(*) AS count FROM products WHERE quantity <= reorder_level AND is_active = 1`,
  );

  // Backend: dueDate < today AND invoiceStatusId = 2
  const overdueInvoices = sqlite.getAllSync<{ count: number }>(
    `SELECT COUNT(*) AS count FROM invoices
     WHERE status_id = 2 AND due_date IS NOT NULL AND due_date < ?`,
    [today],
  );

  // ── Recent Orders ──
  const orderStatusRows = sqlite.getAllSync<{ server_id: number; name: string }>(
    `SELECT server_id, name FROM lookups WHERE type = 'orderStatus'`,
  );
  const orderStatusNames: Record<number, string> = {};
  for (const s of orderStatusRows) orderStatusNames[s.server_id] = s.name;

  const recentOrders = sqlite.getAllSync<{
    order_id: number;
    client_name: string | null;
    total: number;
    status_id: number;
    order_date: string;
  }>(
    `SELECT o.server_id AS order_id,
            c.name AS client_name,
            COALESCE(SUM(ol.qty * ol.unit_price), 0) AS total,
            o.status_id,
            o.order_date
     FROM orders o
     LEFT JOIN clients c ON c.server_id = o.client_server_id
     LEFT JOIN order_lines ol ON ol.order_id = o.id
     GROUP BY o.server_id
     ORDER BY o.order_date DESC, o.server_id DESC
     LIMIT ?`,
    [limit],
  );

  // ── Recent Purchases ──
  const purchaseStatusRows = sqlite.getAllSync<{ server_id: number; name: string }>(
    `SELECT server_id, name FROM lookups WHERE type = 'purchaseStatus'`,
  );
  const purchaseStatusNames: Record<number, string> = {};
  for (const s of purchaseStatusRows) purchaseStatusNames[s.server_id] = s.name;

  const recentPurchasesRaw = sqlite.getAllSync<{
    purchase_id: number;
    supplier_name: string | null;
    total: number;
    status_id: number;
    purchase_date: string;
  }>(
    `SELECT p.server_id AS purchase_id,
            c.name AS supplier_name,
            COALESCE(SUM(pl.qty * pl.unit_cost), 0) AS total,
            p.status_id,
            p.purchase_date
     FROM purchases p
     LEFT JOIN clients c ON c.server_id = p.supplier_server_id
     LEFT JOIN purchase_lines pl ON pl.purchase_id = p.id
     GROUP BY p.server_id
     ORDER BY p.purchase_date DESC, p.server_id DESC
     LIMIT ?`,
    [limit],
  );

  return {
    asOf: today,
    financials: {
      thisMonthRevenue,
      lastMonthRevenue,
      thisMonthPurchases,
      thisMonthExpenses,
      thisMonthNetProfit: thisMonthRevenue - thisMonthPurchases - thisMonthExpenses,
      totalOutstanding,
    },
    operations: {
      todayOrdersCount: todayOrders[0]?.count ?? 0,
      todayOrdersTotal: todayOrders[0]?.total ?? 0,
      pendingOrdersCount: pendingOrders[0]?.count ?? 0,
      unallocatedPaymentsCount: unallocatedPayments[0]?.count ?? 0,
    },
    alerts: {
      lowStockCount: lowStock[0]?.count ?? 0,
      overdueInvoicesCount: overdueInvoices[0]?.count ?? 0,
    },
    recentOrders: recentOrders.map((r) => ({
      orderId: r.order_id,
      clientName: r.client_name ?? '',
      total: r.total,
      statusName: orderStatusNames[r.status_id] ?? 'Unknown',
      orderDate: r.order_date,
    })),
    recentPurchases: recentPurchasesRaw.map((p) => ({
      purchaseId: p.purchase_id,
      supplierName: p.supplier_name ?? '',
      total: p.total,
      statusName: purchaseStatusNames[p.status_id] ?? 'Unknown',
      purchaseDate: p.purchase_date,
    })),
  };
};

export const computeMonthlyOverview = (months = 6): LocalMonthlyOverviewItem[] => {
  // Backend: groups by year/month from transactions, format "MMM yyyy"
  const rows = sqlite.getAllSync<{
    month: string;
    total_sales: number | null;
    total_purchases: number | null;
    total_expenses: number | null;
  }>(
    `SELECT strftime('%Y-%m', substr(trans_date, 1, 10)) AS month,
            COALESCE(SUM(CASE WHEN trans_category_id = 1 THEN amount ELSE 0 END), 0) AS total_sales,
            COALESCE(SUM(CASE WHEN trans_category_id = 2 THEN amount ELSE 0 END), 0) AS total_purchases,
            COALESCE(SUM(CASE WHEN trans_category_id IN (3, 4) THEN amount ELSE 0 END), 0) AS total_expenses
     FROM transactions
     WHERE trans_date IS NOT NULL
     GROUP BY month
     ORDER BY month ASC`,
  );

  // Take last N months
  const sliced = rows.slice(-months);

  return sliced.map((r) => ({
    month: formatMonth(r.month),
    totalSales: r.total_sales ?? 0,
    totalPurchases: r.total_purchases ?? 0,
    totalExpenses: r.total_expenses ?? 0,
    netProfit: (r.total_sales ?? 0) - (r.total_purchases ?? 0) - (r.total_expenses ?? 0),
  }));
};
