# Orders — API and service outline

Maps the planning decisions to **ASP.NET Core** layers under [`backend/HamzaTex.Api`](../../../backend/HamzaTex.Api). Follow existing patterns: DTOs, ViewModels, FluentValidation, `Response<T>`, `BaseController`, [`PagedList`](../../../backend/HamzaTex.Api/Helpers/PagedList.cs).

## Service responsibilities

### `IOrderService` / `OrderService`

- **Inject:** `ApplicationDbContext`, `IStockMovementsService`, and a **posting helper** (either private methods on `OrderService` or `ITransactionPostingService` / `ILedgerPostingService` scoped to orders until [`todo/06-transactions.md`](../../../todo/06-transactions.md) exposes a full public API).
- **Create:** validate customer, lines, product access; insert `Order` + `OrderLines`. If create is **Pending-only** with no stock/ledger (per [04-ledger-posting-rules.md](./04-ledger-posting-rules.md)), no stock or `Transaction` rows yet.
- **Update (especially status):** when moving to **Delivered**, run stock + `Transaction` posting inside **one database transaction**; enforce **idempotency** for posting.
- **Cancel:** apply reversal rules from [04-ledger-posting-rules.md](./04-ledger-posting-rules.md) and stock reversal from [`todo/02-orders.md`](../../../todo/02-orders.md).
- **Query:** `GetAllPaginatedAsync`, filtered queries—join `Client` and filter by `Client.UserId` for staff; admin unrestricted per product conventions.

### Transaction posting helper (internal)

Until a full `TransactionService` exists, a small internal component can:

- Build `Transaction` entities from order + lines + [04](./04-ledger-posting-rules.md) rules.
- Remain **private to the order flow** or live in `Services/Internal/` with a narrow interface to keep `OrderService` testable.

## Controller outline (`OrderController`)

Aligned with [`todo/02-orders.md`](../../../todo/02-orders.md):

| Method | Route | Auth | Notes |
|--------|-------|------|--------|
| POST | `/api/Order` | AdminOrStaff | Create order + lines |
| GET | `/api/Order` | AdminOnly | Paginated all |
| GET | `/api/Order/me` | Authenticated | Scoped via client ownership |
| GET | `/api/Order/{id}` | Authenticated | Include lines |
| GET | `/api/Order/filtered` | Authenticated | clientId, statusId, date range |
| PUT | `/api/Order/{id}` | AdminOrStaff | Header + status transitions trigger posting |
| DELETE | `/api/Order/{id}` | AdminOnly | Policy: only if no posted activity or soft-delete—define with finance |
| GET | `/api/Order/pdf` | AdminOrStaff | `EntityPdfConfigs.Order` |

Use the same **`GetUserId()`** pattern as other controllers.

## DTOs and validation

- **Create:** at least one line; `ClientId` required; valid `StatusId` / `PaymentTypeId` FKs.
- **Update:** validate status transitions (e.g. cannot go from Cancelled to Delivered without explicit business approval).

## Cross-cutting work for this sprint

1. **Views:** fix `Sale` vs `Sales` (or use category id) per [03](./03-reporting-and-views-alignment.md).
2. **Posting:** implement [04](./04-ledger-posting-rules.md) in code.
3. **Tests:** integration tests for Delivered (stock + transactions) and Cancelled (reversals).

## Related trackers

- Implementation checklist: [`todo/02-orders.md`](../../../todo/02-orders.md).
- **Start coding order:** [07-implementation-kickoff.md](./07-implementation-kickoff.md).
- Full transactions API (future): [`todo/06-transactions.md`](../../../todo/06-transactions.md).
