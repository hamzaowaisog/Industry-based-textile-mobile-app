# Purchases — API and service outline

**Status: ✅ Implemented** — All 8 endpoints live. See [`todo/03-purchases.md`](../../../todo/03-purchases.md) for full checklist.

Follow the same layering as **Orders** and existing features: DTOs, ViewModels, FluentValidation, `Response<T>`, `BaseController`, [`PagedList`](../../../backend/HamzaTex.Api/Helpers/PagedList.cs).

## Service responsibilities ✅

### `IPurchaseService` / `PurchaseService`

- **Inject:** `ApplicationDbContext`, `IStockMovementsService` — no separate transaction service; ledger posted inline (same pattern as `OrderService`)
- **Create:** validates Supplier (`ClientTypeId = 2`), bulk product ID existence check (single query, returns `"Product with ID {x} does not exist."`), inserts `Purchase + lines` with `StatusId = Pending`. No stock or ledger.
- **Update:** `StatusId → Delivered` runs stock In + `Transaction` with `PurchaseId`; idempotent guard. `StatusId → Cancelled` runs reversal per [04](./04-ledger-posting-rules.md). Header edits (PaymentType, date, notes) only if not Delivered.
- **Delete:** blocked if Delivered — error response. Hard delete for Pending/Cancelled.
- **Query:** paginated (admin only), filtered by supplierId/statusId/dateFrom/dateTo; staff scoped via `Supplier.UserId` (mirror orders `/me` pattern).

## Controller — implemented endpoints ✅

| Method | Route | Auth | Notes |
|--------|-------|------|-------|
| POST | `/api/Purchase` | AdminOrStaff | Create + lines (Pending); no stock/ledger |
| GET | `/api/Purchase` | AdminOnly | Paginated |
| GET | `/api/Purchase/me` | Authenticated | Scoped to suppliers owned by user |
| GET | `/api/Purchase/{id}` | Authenticated | Includes lines |
| GET | `/api/Purchase/filtered` | Authenticated | supplierId, statusId, dateFrom, dateTo + user scope |
| PUT | `/api/Purchase/{id}` | AdminOrStaff | Header + status transitions (Delivered → stock+ledger, Cancelled → reversal) |
| DELETE | `/api/Purchase/{id}` | AdminOnly | Blocked if Delivered |
| GET | `/api/Purchase/pdf` | AdminOrStaff | `EntityPdfConfigs.Purchase` |

## DTOs and ViewModels ✅

**Response:** `PurchaseDto` (Id, SupplierId, SupplierName, StatusId, StatusName, PaymentTypeId, PaymentTypeName, PurchaseDate, Notes, CreatedAt, Total, PurchaseLines)

**Line response:** `PurchaseLineDto` (Id, PurchaseId, ProductId, ProductName, Qty `decimal`, UnitCost `decimal`)

**Create input:** `PurchaseCreateViewModel` / `CreatePurchaseDto` — SupplierId, PaymentTypeId, PurchaseDate, Notes, Lines[]

**Update input:** `PurchaseUpdateViewModel` / `UpdatePurchaseDto` — StatusId, PaymentTypeId, PurchaseDate, Notes

## Validation ✅

`PurchaseCreateViewModelValidation`:
- `SupplierId > 0`
- `PurchaseDate` required
- `Lines` not empty (at least 1)
- Each line: `ProductId > 0`, `Qty > 0`, `UnitCost > 0`

`PurchaseUpdateViewModelValidation`:
- `StatusId > 0`
- `PaymentTypeId > 0`
- `PurchaseDate` required

## Precision fixes (applied during this sprint) ✅

- `PurchaseLine.Qty` → `decimal(14,2)` (was `int`)
- `PurchaseLine.UnitCost` → `decimal(14,4)` (matches `stock_movements` precision)
- Same fixes applied to `OrderLine.Qty` and `OrderLine.UnitPrice`

## Related

- Tracker: [`todo/03-purchases.md`](../../../todo/03-purchases.md).
- Orders reference: [`../orders-sprint/05-api-and-service-outline.md`](../orders-sprint/05-api-and-service-outline.md).
