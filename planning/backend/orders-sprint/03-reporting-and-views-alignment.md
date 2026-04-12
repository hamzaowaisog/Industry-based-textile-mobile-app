# Orders — reporting and database views

Financial reporting in HamzaTex uses **SQL views** over **`transactions`**, not over `orders` directly. Implementing orders therefore requires **aligning posting** with how those views are written.

## Views involved

### `v_monthly_profit_loss`

Defined in migrations (e.g. [`UpdateMonthlyProfitLossView`](../../../backend/HamzaTex.Api/Migrations/20260204131656_UpdateMonthlyProfitLossView.cs)).

- Groups by **month** from `transactions.trans_date`.
- Classifies amounts using **`trans_categories`**:
  - **Total sales:** rows where category name equals **`Sale`** (as written in the view SQL).
  - **Purchases / expenses:** other category name patterns in the same view.

**Inconsistency to fix in implementation:** seeded [`TransCategory`](../../../backend/HamzaTex.Api/Data/SeedData.cs) name for sales is **`Sales`**, not `Sale`. Until the view, seed names, and posting code agree, **sales from the ledger will not roll into P&L correctly**.

**Recommended fix (pick one and document in changelog):**

1. **Change the view** to match seed data, e.g. `tt.name = 'Sales'` or `tt.id = 1`, or  
2. **Rename the seeded category** to `Sale` (data migration if production already has `Sales`), or  
3. **Stop using name matching** in the view—filter by `trans_category_id = 1` for sales.

After the fix, re-test the view against sample `transactions` rows posted from orders.

### `v_monthly_credit_debit`

Uses `trans_types` (Debit/Credit) with different naming rules than P&L. Order-related postings must use **`TransTypeId`** values consistent with how this view sums credit vs debit (verify against seed: Debit = 1, Credit = 2 in [`SeedData`](../../../backend/HamzaTex.Api/Data/SeedData.cs)).

### `v_client_balance`

From [`AddViews`](../../../backend/HamzaTex.Api/Migrations/20251215131335_AddViews.cs):

- Starts from **`clients`**.
- Adds **`SUM(transactions.amount)`** per client (plus opening balance).

So any **sale or receivable movement** that should change a customer’s balance must appear as **`transactions`** rows with the correct **`client_id`** and **`amount`** sign convention. Document that convention in [04-ledger-posting-rules.md](./04-ledger-posting-rules.md) and keep it consistent everywhere.

## Date alignment

- **`orders.order_date`:** business date of the order.
- **`transactions.trans_date`:** should match the **posting policy** (e.g. the date revenue is recognized—often the same as delivery date when posting on Delivered).

If `OrderDate` and posting date differ, reports by month may diverge from “order list by month”—that is acceptable if the policy is explicit.

## Line-level vs header-level posting

**Header-level:** one `Transaction` per order (total = sum of lines). Simpler; matches order-level reporting.

**Line-level:** one `Transaction` per `OrderLine`. Better traceability to product in `transactions.product_id`; more rows.

Choose one approach for MVP and stick to it for reversal logic.

## Verification checklist (after implementation)

- [ ] Posting uses category/type/mode IDs that match **seed data** and **view SQL**.
- [ ] `Sale` vs `Sales` mismatch resolved.
- [ ] Sample Delivered order produces expected rows in `v_monthly_profit_loss` and `v_client_balance`.
- [ ] Cancelled order after posting reverses or compensates so views net to zero for that sale.
