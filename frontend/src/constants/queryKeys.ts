/**
 * Centralized React Query key factory.
 *
 * Every query definition and every cache invalidation references these helpers
 * instead of an inline string array. This keeps the two in sync: a rename is a
 * one-spot, compiler-checked change, and an invalidation can never silently
 * drift away from the query it targets.
 *
 * Keys are hierarchical. Each namespace exposes:
 *   - `all`        the invalidation root — invalidating it cascades (prefix
 *                  match) to every list, detail and sub-query in the namespace
 *   - `list()`     the paginated infinite list
 *   - `detail(id)` a single record
 * plus namespace-specific sub-queries where needed (e.g. product movements,
 * and `clients.options()` for the non-paginated picker lookup, which must stay
 * distinct from the paginated `list()` to avoid a cache-shape collision).
 *
 * Arrays are intentionally mutable `string[]` (no `as const`) so they satisfy
 * the `string[]` query-key generics already declared on the infinite queries.
 */
export const queryKeys = {
  clients: {
    all: ['clients'],
    list: () => [...queryKeys.clients.all, 'list'],
    options: () => [...queryKeys.clients.all, 'options'],
    detail: (id: number) => [...queryKeys.clients.all, 'detail', id],
  },
  orders: {
    all: ['orders'],
    list: () => [...queryKeys.orders.all, 'list'],
    detail: (id: number) => [...queryKeys.orders.all, 'detail', id],
  },
  products: {
    all: ['products'],
    list: () => [...queryKeys.products.all, 'list'],
    detail: (id: number) => [...queryKeys.products.all, 'detail', id],
    movements: (id: number) => [...queryKeys.products.detail(id), 'movements'],
  },
  purchases: {
    all: ['purchases'],
    list: () => [...queryKeys.purchases.all, 'list'],
    detail: (id: number) => [...queryKeys.purchases.all, 'detail', id],
  },
  payments: {
    all: ['payments'],
    list: () => [...queryKeys.payments.all, 'list'],
    detail: (id: number) => [...queryKeys.payments.all, 'detail', id],
    summary: () => [...queryKeys.payments.all, 'summary'],
  },
  invoices: {
    all: ['invoices'],
    list: () => [...queryKeys.invoices.all, 'list'],
    detail: (id: number) => [...queryKeys.invoices.all, 'detail', id],
    summary: () => [...queryKeys.invoices.all, 'summary'],
  },
  expenses: {
    all: ['expenses'],
    list: () => [...queryKeys.expenses.all, 'list'],
    detail: (id: number) => [...queryKeys.expenses.all, 'detail', id],
    monthSummary: () => [...queryKeys.expenses.all, 'monthSummary'],
  },
  stockMovements: {
    all: ['stockMovements'],
    list: () => [...queryKeys.stockMovements.all, 'list'],
    detail: (id: number) => [...queryKeys.stockMovements.all, 'detail', id],
    summary: () => [...queryKeys.stockMovements.all, 'summary'],
  },
  transactions: {
    all: ['transactions'],
    list: () => [...queryKeys.transactions.all, 'list'],
    detail: (id: number) => [...queryKeys.transactions.all, 'detail', id],
    summary: () => [...queryKeys.transactions.all, 'summary'],
  },
  reports: {
    all: ['reports'],
    profitLoss: (year?: number, month?: number) => [
      ...queryKeys.reports.all,
      'profitLoss',
      year ?? null,
      month ?? null,
    ],
    clientBalances: () => [...queryKeys.reports.all, 'clientBalances'],
    creditDebit: (year?: number, month?: number) => [
      ...queryKeys.reports.all,
      'creditDebit',
      year ?? null,
      month ?? null,
    ],
    summary: () => [...queryKeys.reports.all, 'summary'],
    clientDetails: () => [...queryKeys.reports.all, 'clientDetails'],
    clientDetail: (id: number) => [...queryKeys.reports.all, 'clientDetail', id],
  },
};
