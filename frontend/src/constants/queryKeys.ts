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
  },
};
