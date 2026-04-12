# Purchases — data model and database impact

**Status: ✅ Implemented** — All migrations applied.

## Core tables

### `purchases`

[`Purchase`](../../../backend/HamzaTex.Api/Entities/Purchase.cs): `SupplierId`, `StatusId`, `PaymentTypeId`, `PurchaseDate`, `Notes`, `CreatedAt`.

- `StatusId` → `purchase_statuses` FK implemented (migration `AddPurchaseStatusAndStatusId`)
- Index `IX_purchases_status_id` added

### `purchase_lines`

[`PurchaseLine`](../../../backend/HamzaTex.Api/Entities/PurchaseLine.cs): `PurchaseId`, `ProductId`, `Qty`, `UnitCost`.

- `Qty` — `decimal(14,2)` (was `int` — fixed in migration `ChangeQtyToDecimalOnOrderAndPurchaseLines`)
- `UnitCost` — `decimal(14,4)` matching `stock_movements` precision (fixed in migration `ChangeUnitCostAndPriceToDecimal14x4OnLines`)

### `purchase_statuses` ✅ Created

Same pattern as [`OrderStatus`](../../../backend/HamzaTex.Api/Entities/OrderStatus.cs): `Id`, `Name`, `CreatedAt`; seeded ids **1–4** (Pending, InProgressed, Delivered, Cancelled). Migration: `AddPurchaseStatusAndStatusId`.

## Validation rules (implemented)

- **`SupplierId`** → `Client` with `ClientTypeId = 2 (Supplier)` — validated in `PurchaseService.CreateAsync`
- **ProductId existence** — all line product IDs validated in a single bulk DB query before saving
- Lines: positive qty and unit cost — FluentValidation in `PurchaseCreateViewModelValidation`
- **Delivered** transition guarded by idempotency check (existing transactions for `PurchaseId`)

## Related entities

### Stock movements

`MovementSource = Purchase (1)` → In; all math in `StockMovementsService.CreateAsync`. Called per line on Delivered transition.

### Transactions (ledger) ✅

[`Transaction`](../../../backend/HamzaTex.Api/Entities/Transaction.cs):

- `PurchaseId` (nullable FK → `purchases`) — **set on every purchase-generated ledger row**
- Navigation `Transaction → Purchase` wired in `ApplicationDbContext.OnModelCreating` (was missing, fixed)
- Navigation `Transaction → Order` also wired at the same time

### `OrderLine` fix (same migration)

`order_lines.qty` and `order_lines.unit_price` updated to `decimal(14,2)` / `decimal(14,4)` for consistency.

## Application transaction boundaries ✅

On **Delivered** transition: status update + stock movements + transaction with `PurchaseId` — all in one EF Core `BeginTransactionAsync` block with rollback on any failure.

## Migrations applied

| Migration | Change |
|---|---|
| `AddPurchaseStatusAndStatusId` | `purchase_statuses` table, `purchases.status_id` FK, rewired `Transaction→Order/Purchase` FKs |
| `ChangeQtyToDecimalOnOrderAndPurchaseLines` | `order_lines.qty` + `purchase_lines.qty` → `decimal(14,2)` |
| `ChangeUnitCostAndPriceToDecimal14x4OnLines` | `order_lines.unit_price` + `purchase_lines.unit_cost` → `decimal(14,4)` |
