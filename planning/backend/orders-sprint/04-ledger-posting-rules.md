# Orders — ledger posting rules (`transactions`)

This sprint’s architecture assumes **sales are reflected in `transactions`** so P&L and client balance views stay correct. [`Transaction`](../../../backend/HamzaTex.Api/Entities/Transaction.cs) has: `ClientId`, `ProductId`, `UserId`, `TransTypeId`, `TransModeId`, `TransCategoryId`, `Amount`, `TransDate`, `Notes`, `CreatedAt`.

## When to post

**Recommended default:** post **stock out** and **ledger** together when the order transitions to **`Delivered` (status id 3)**.

Rationale:

- Avoids recognizing revenue (and COGS-related patterns if added later) while goods are still in the warehouse.
- Keeps **inventory** and **revenue recognition** in sync.

**Pending / InProgressed:** no `StockMovement` (Sale) and no sales `Transaction` rows under this policy.

If the business instead requires reserving stock earlier, that would be a different policy (e.g. Pending creates a non-financial hold)—not the default here.

## Amounts

- **Order total (header):** sum over lines: `Σ (Qty × UnitPrice)`.
- Use **one posting granularity** consistently (see below).

## Category and modes

- **`TransCategoryId`:** use **`Sales`** seed id **`1`** ([`SeedData`](../../../backend/HamzaTex.Api/Data/SeedData.cs)) unless the category table is changed—**and** ensure [03-reporting-and-views-alignment.md](./03-reporting-and-views-alignment.md) view filters match.

**`TransTypeId` and signed `Amount`:** The schema uses Debit (1) vs Credit (2). Views such as `v_monthly_credit_debit` depend on type names. Define one convention, for example:

- **Revenue as positive business impact:** set `Amount` to the sale total and choose `TransTypeId` / sign so **`v_monthly_profit_loss`** “Sale” bucket and **`v_client_balance`** both behave as expected. **Do not guess**—verify with SQL against the current view definitions after fixing the `Sale`/`Sales` issue.

**`TransModeId`:** align with `PaymentType`:

- **Cash:** e.g. `TransModeId = Cash (1)`.
- **Credit:** e.g. `TransModeId = Credit (3)` so receivables are distinguishable from immediate cash.

**`UserId`:** set to the acting user (from JWT) for audit.

**`ProductId`:** optional per line if posting line-level transactions; null if header-level only.

## Cash vs credit (business meaning)

- **Cash sale:** customer pays at delivery; ledger still records revenue; cash receipt may be a separate transaction when the Payments epic records actual cash drawer / bank deposits.
- **Credit sale:** revenue posts; balance owed increases until **Payment** records reduce receivables—ensure `Amount` signs match how `v_client_balance` aggregates.

## Cancellation (status → **Cancelled**, id 4)

If **Delivered** already ran stock + ledger:

1. **Stock:** reverse with **Manual In** movements (same qty per line as original sale reversal policy in [`todo/02-orders.md`](../../../todo/02-orders.md)).
2. **Ledger:** post **reversing** `Transaction` rows (opposite sign and/or compensating category) **or** delete original rows only if no dependent reports and product policy allows—prefer **compensating** rows for audit.

If the order never reached **Delivered**, typically **no** sale stock or revenue postings exist—only delete or mark cancelled.

## Idempotency

- Transitioning to **Delivered** must not create **duplicate** `Transaction` rows if the update is retried.
- Options: store **“posted”** state on the order, or detect existing `transactions` linked by optional future `order_id`, or use a single idempotent upsert pattern.

## Order of operations (single DB transaction)

1. Validate client (customer type), products, and stock availability for the **Delivered** transition.
2. Persist status (and any header fields).
3. Create **Sale** `StockMovement` rows per line.
4. Insert **`Transaction`** row(s) per posting policy.
5. Commit; on failure, roll back all.

## References

- Stock rules: [`CLAUDE.md`](../../../CLAUDE.md) and `IStockMovementsService`.
- Views: [03-reporting-and-views-alignment.md](./03-reporting-and-views-alignment.md).
