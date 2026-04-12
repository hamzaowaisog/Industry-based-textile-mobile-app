# Purchases — data model and database impact

## Core tables

### `purchases`

[`Purchase`](../../../backend/HamzaTex.Api/Entities/Purchase.cs): `SupplierId`, `PaymentTypeId`, `PurchaseDate`, `Notes`, `CreatedAt`.

**Planned (see [09](./09-purchase-status-workflow.md)):** `StatusId` → `purchase_statuses` (mirror `orders.status_id` → `order_statuses`). **No `UserId`** — scope via **`clients.user_id`** on the supplier.

Indexes include `supplier_id`, `purchase_date`, `(supplier_id, purchase_date)`; add **`status_id`** index when the column exists.

### `purchase_lines`

[`PurchaseLine`](../../../backend/HamzaTex.Api/Entities/PurchaseLine.cs): `PurchaseId`, `ProductId`, `Qty`, `UnitCost`. Line total: `Qty * UnitCost`.

### `purchase_statuses` (planned)

Same pattern as [`OrderStatus`](../../../backend/HamzaTex.Api/Entities/OrderStatus.cs): `Id`, `Name`, `CreatedAt`; seeded ids **1–4** (Pending, InProgressed, Delivered, Cancelled). See [09](./09-purchase-status-workflow.md).

## Validation rules (domain)

- **`SupplierId`** → **`Client`** with **`ClientTypeId = 2` (Supplier)**.
- Lines: positive qty and unit cost.
- **Status:** valid `StatusId` FK when column exists; **Delivered** triggers stock + ledger.

## Related entities

### Stock movements

**`MovementSource = Purchase (1)`** → **In**; all math in `StockMovementsService.CreateAsync`.

**Traceability:** optional future **`purchase_id`** on `stock_movements` (not the same as **`Transaction.PurchaseId`**).

### Transactions (ledger)

[`Transaction`](../../../backend/HamzaTex.Api/Entities/Transaction.cs) includes:

- **`PurchaseId`** (nullable FK → `purchases`) — **set on every purchase-generated ledger row** for audit, idempotency, and joins.
- **`OrderId`** — used for sales; keep mutually exclusive for automated postings (purchase vs sale).

Use **`TransCategoryId`** = **Purchases** (seed id **2**) for P&L. Rules: [04](./04-ledger-posting-rules.md).

### Shared lookups

[`PaymentType`](../../../backend/HamzaTex.Api/Entities/PaymentType.cs) shared with **Orders**.

## Application transaction boundaries

On **Delivered** transition: **status update + stock movements + `transactions` with `PurchaseId`** in **one** EF Core database transaction.

## Migrations (summary)

| Change | Purpose |
|--------|---------|
| `purchase_statuses` + seed | Lookup table |
| `purchases.status_id` FK | Lifecycle |
| `transactions.purchase_id` FK | Already in entity when migration applied — links ledger to document |
| Optional `stock_movements.purchase_id` | Stronger inventory audit |

## Related

- [09-purchase-status-workflow.md](./09-purchase-status-workflow.md)
- [08-seed-correction-and-greenfield-deployment.md](./08-seed-correction-and-greenfield-deployment.md)
