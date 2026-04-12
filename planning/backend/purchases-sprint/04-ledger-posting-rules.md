# Purchases — ledger posting rules (`transactions`)

Aligned with **orders**: post **stock** and **`transactions`** when the purchase becomes **Delivered** (goods received), not on initial **Pending** save. See [09-purchase-status-workflow.md](./09-purchase-status-workflow.md).

## When to post

- **Transition to `StatusId = Delivered` (3):** In one DB transaction: per line **`StockMovementsService`** with **`MovementSource = Purchase (1)`**, then insert **`Transaction`** row(s) with **`PurchaseId`** set to this purchase’s id.
- **Pending / InProgressed:** no stock movement, no purchase-category ledger rows for this document.

## `PurchaseId` on every posting

[`Transaction.PurchaseId`](../../../backend/HamzaTex.Api/Entities/Transaction.cs) must be populated for automated purchase postings so:

- Idempotency checks can query “existing transaction for this purchase”.
- Reports and support can trace **ledger ↔ purchase** without guessing by date.

## Amounts

- Header total: **`Σ (Qty × UnitCost)`** (or sum of line postings if posting per line).

## Category and modes

- **`TransCategoryId`:** **Purchases** — seed id **2** ([`SeedData`](../../../backend/HamzaTex.Api/Data/SeedData.cs)).
- **`TransTypeId` / `Amount` sign:** Must match **`v_monthly_profit_loss`** and **`v_client_balance`** for suppliers—align with **orders** convention ([`../orders-sprint/04-ledger-posting-rules.md`](../orders-sprint/04-ledger-posting-rules.md)).
- **`TransModeId`:** From **`PaymentType`** (Cash vs Credit).
- **`ClientId`:** Supplier client id.
- **`UserId`:** Acting user.

## Idempotency

- Moving to **Delivered** must not duplicate **`transactions`** if the client retries—use **`PurchaseId`** + existence check or unique constraint strategy.

## Cancelled (status 4)

If **Delivered** was posted: reverse stock (policy: Manual **Out** or equivalent) and post **compensating** `Transaction` rows linked with same **`PurchaseId`** / notes. If never **Delivered**, typically no purchase stock or P&L rows to reverse.

## Delete / correction

Prefer **disallow delete** after **Delivered**, or **reversal** flow—not silent delete.

## Order of operations (Delivered transition)

1. Validate supplier, lines, stock eligibility.
2. Update **`Purchase.StatusId`** to **Delivered**.
3. Stock movements per line.
4. Insert **`Transaction`**(s) with **`PurchaseId`**.
5. Commit.

## References

- [`CLAUDE.md`](../../../CLAUDE.md), [`todo/03-purchases.md`](../../../todo/03-purchases.md).
