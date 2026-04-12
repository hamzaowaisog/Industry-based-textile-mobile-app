# Purchases — ledger posting rules (`transactions`)

**Status: ✅ Implemented** — Ledger posting correct and verified against all three reporting views.

Aligned with **orders**: post **stock** and **`transactions`** when the purchase becomes **Delivered** (goods received), not on initial **Pending** save. See [09-purchase-status-workflow.md](./09-purchase-status-workflow.md).

## When to post

- **Transition to `StatusId = Delivered` (3):** In one DB transaction: per line **`StockMovementsService`** with **`MovementSource = Purchase (1)`**, then insert **`Transaction`** row with **`PurchaseId`** set to this purchase's id.
- **Pending / InProgressed:** no stock movement, no purchase-category ledger rows for this document.

## `PurchaseId` on every posting ✅

[`Transaction.PurchaseId`](../../../backend/HamzaTex.Api/Entities/Transaction.cs) is populated on every purchase-related posting:

- FK wired in `ApplicationDbContext.OnModelCreating` (`FK_transactions_purchases_PurchaseId`)
- Navigation `Transaction → Purchase` and `Purchase → Transactions` both configured
- Index `IX_transactions_purchase_id` enables fast idempotency lookups

## Amounts ✅

Header total: **`Σ (Qty × UnitCost)`** across all lines — calculated in service, posted as one `Transaction` per purchase.

## Category and modes ✅ (confirmed correct)

| Field | Value | Reason |
|-------|-------|--------|
| `TransCategoryId` | **2** (Purchases) | id-based — no `Purchase` vs `Purchases` name drift |
| `TransTypeId` | **1** (Debit) | money **out** — we pay the supplier |
| `Amount` | **+total** (positive) | raw sum in `v_client_balance`; positive = we owe supplier more |
| `TransModeId` | From `PaymentType` (Cash=1, Credit=3) | |
| `ClientId` | Supplier `Client.Id` | |
| `UserId` | Acting user | |

**Critical fix applied:** `TransTypeId` was **backwards** in original implementation (Credit for purchases). Corrected to **Debit (1)** for purchases so `v_monthly_credit_debit` balance = `total_credit − total_debit` = Sales − Purchases is positive for profitable months.

## Idempotency ✅

Guard: `AnyAsync(t => t.PurchaseId == id)` in `PurchaseService.TransitionToDelivered`. If transactions already exist for this `PurchaseId`, skip re-posting. Entire Delivered transition (status + stock In + ledger) wrapped in `BeginTransactionAsync` with rollback.

## Cancelled reversal ✅

If **Delivered** was posted: per-line Manual Out (`MovementSource=3, MovementType=2`) to reverse stock + one compensating `Transaction`:
- `TransTypeId = Credit (2)` (opposite of Debit used on Delivered)
- `Amount = -total` (negative)
- `PurchaseId` set (same purchase — linked for audit)

If **never Delivered**: no stock or ledger to reverse; status update only.

## Delete policy ✅

`DeleteByIdAsync` rejects delete with error if `StatusId == Delivered (3)`. Use Cancelled reversal flow instead.

## Order of operations (Delivered transition) ✅

1. Idempotency check — existing transactions for `PurchaseId`?
2. Update `Purchase.StatusId` to Delivered.
3. Stock In per line via `StockMovementsService(MovementSource=1)`.
4. Insert single `Transaction` with `PurchaseId`, `TransTypeId=1`, `TransCategoryId=2`, `Amount=+total`.
5. Commit (or rollback all on any failure).

## References

- [`CLAUDE.md`](../../../CLAUDE.md), [`todo/03-purchases.md`](../../../todo/03-purchases.md).
