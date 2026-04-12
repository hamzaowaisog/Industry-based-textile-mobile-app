# Purchases epic — implementation kickoff

**Status: ✅ Complete** — All phases delivered. See [`todo/03-purchases.md`](../../../todo/03-purchases.md) for full checklist.

## What was built (in order)

| Phase | Work | Status |
|-------|------|--------|
| 1 | `PurchaseStatus` entity + `purchase_statuses` table + `Purchase.StatusId` FK + `Transaction → Order/Purchase` nav wiring | ✅ |
| 2 | Seed `purchase_statuses` (ids 1–4) + views aligned (id-based P&L) | ✅ |
| 3 | Ledger convention fixed: Sales=Credit(2), Purchases=Debit(1) | ✅ |
| 4 | `PurchaseService`: Create (Pending), Delivered (stock In + ledger, idempotent), Cancelled (reversal) | ✅ |
| 5 | Controller (8 endpoints) + `EntityPdfConfigs.Purchase` + DI + LookupService extension | ✅ |

## Bugs fixed during implementation

- `OrderLine.Qty` and `PurchaseLine.Qty` changed `int` → `decimal(14,2)`
- `unit_price` / `unit_cost` bumped to `decimal(14,4)` to match `stock_movements` precision
- Product existence validation added to both `OrderService.CreateAsync` and `PurchaseService.CreateAsync`
- `TransTypeId` was backwards in `OrderService` — corrected alongside `PurchaseService`
- `Transaction → Order` and `Transaction → Purchase` navigation configs were missing from `ApplicationDbContext.OnModelCreating`

## Migrations applied

| Migration name | Change |
|----------------|--------|
| `AddPurchaseStatusAndStatusId` | `purchase_statuses` table, `purchases.status_id` FK, `Transaction → Order/Purchase` FKs wired |
| `ChangeQtyToDecimalOnOrderAndPurchaseLines` | Both `qty` columns → `decimal(14,2)` |
| `ChangeUnitCostAndPriceToDecimal14x4OnLines` | `unit_price` / `unit_cost` → `decimal(14,4)` |

## Preconditions (satisfied)

- Orders patterns mirrored: `Response<T>`, Delivered-style posting, `Transaction.OrderId` → now `Transaction.PurchaseId`
- Two dedicated screens confirmed: Orders vs Purchases are separate UI flows

## Out of scope (deferred)

- Full Payments to suppliers
- Full Transactions CRUD
- `stock_movements.purchase_id` optional FK
- Line-level ledger posting (currently header-level)
- Sync

## Related

- [`01`](./01-business-context-procurement.md)–[`06`](./06-cross-cutting-risks-and-business-fit.md), [`08`](./08-seed-correction-and-greenfield-deployment.md), [`09`](./09-purchase-status-workflow.md).
- Orders kickoff: [`../orders-sprint/07-implementation-kickoff.md`](../orders-sprint/07-implementation-kickoff.md).
