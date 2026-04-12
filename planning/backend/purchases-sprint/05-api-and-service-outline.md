# Purchases — API and service outline

Follow the same layering as **Orders** and existing features: DTOs, ViewModels, FluentValidation, `Response<T>`, `BaseController`, [`PagedList`](../../../backend/HamzaTex.Api/Helpers/PagedList.cs).

## Service responsibilities

### `IPurchaseService` / `PurchaseService`

- **Inject:** `ApplicationDbContext`, `IStockMovementsService`, plus internal **ledger helper** (same pattern as orders until full `ITransactionService` exists).
- **Create:** validate **Supplier** (`ClientTypeId = 2`), insert **`Purchase` + lines** with **`StatusId = Pending`** (or allowed initial state). **No** stock or ledger until **Delivered** ([09](./09-purchase-status-workflow.md)).
- **Update:** when **`StatusId`** moves to **Delivered**, run stock + **`Transaction`** rows with **`PurchaseId`** set; idempotent. **Cancelled** → reversal per [04](./04-ledger-posting-rules.md). Header-only edits allowed only when policy permits (e.g. before Delivered).
- **Delete:** align with [04](./04-ledger-posting-rules.md) — avoid orphaning stock/ledger.
- **Query:** paginated list, filtered by supplier/date; **scope staff** via **`Client.UserId`** on supplier (mirror orders: admin sees all, staff sees own suppliers’ purchases). Add **`GetAllByUserIdAsync`** or equivalent filtering if not already in [`todo/03-purchases.md`](../../../todo/03-purchases.md) — treat as parity with **Orders `/me`** pattern.

## Controller outline (`PurchaseController`)

| Method | Route | Auth | Notes |
|--------|-------|------|--------|
| POST | `/api/Purchase` | AdminOrStaff | Create + lines (**Pending**); no stock/ledger until **Delivered** |
| GET | `/api/Purchase` | AdminOnly | Paginated |
| GET | `/api/Purchase/me` | Authenticated | Optional parity: purchases for suppliers owned by user |
| GET | `/api/Purchase/{id}` | Authenticated | Include lines |
| GET | `/api/Purchase/filtered` | Authenticated | supplierId, dateFrom, dateTo + user scope |
| PUT | `/api/Purchase/{id}` | AdminOrStaff | Header + **status** (triggers posting on **Delivered**) |
| DELETE | `/api/Purchase/{id}` | AdminOnly | Policy per 04 |
| GET | `/api/Purchase/pdf` | AdminOrStaff | `EntityPdfConfigs.Purchase` |

## DTOs and validation

- Include **`StatusId`** (and status name in responses) per [09](./09-purchase-status-workflow.md).
- **Create:** at least one line; supplier valid; initial status typically **Pending (1)**.
- **Update:** validate transitions (e.g. no **Cancelled** → **Delivered** without explicit rule).

## Cross-cutting

- **Views:** fix **`Purchase` vs `Purchases`** for P&L ([03](./03-reporting-and-views-alignment.md)).
- **Tests:** create purchase → stock In + transaction → spot-check views.

## Related

- Tracker: [`todo/03-purchases.md`](../../../todo/03-purchases.md).
- Orders reference implementation patterns: [`../orders-sprint/05-api-and-service-outline.md`](../orders-sprint/05-api-and-service-outline.md).
