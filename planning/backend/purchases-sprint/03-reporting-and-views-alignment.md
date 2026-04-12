# Purchases — reporting and database views

**Status: ✅ Resolved** — All view alignment issues fixed.

## Views involved

### `v_monthly_profit_loss` ✅ Fixed

Latest migration [`FixProfitLossViewCategoryMatching`](../../../backend/HamzaTex.Api/Migrations/20260412100000_FixProfitLossViewCategoryMatching.cs) uses **id-based** matching — no more name drift:

```sql
SUM(CASE WHEN t.trans_category_id = 1 THEN t.amount ELSE 0 END) AS total_sales
SUM(CASE WHEN t.trans_category_id = 2 THEN t.amount ELSE 0 END) AS total_purchases
SUM(CASE WHEN t.trans_category_id IN (3, 4) THEN t.amount ELSE 0 END) AS total_expenses
```

`Purchase Delivered` posts `TransCategoryId = 2` → appears correctly in `total_purchases`.

### `v_client_balance` ✅ Convention confirmed

```sql
(COALESCE(c.opening_balance, 0) + COALESCE(SUM(t.amount), 0)) AS balance
```

Raw sum of `transaction.amount` — no TransType filtering. Sign is in the amount:
- Purchase Delivered → `Amount = +total` → supplier balance increases (we owe them more)
- Purchase Cancelled reversal → `Amount = -total` → reduces what we owe

### `v_monthly_credit_debit` ✅ Fixed

Uses `trans_type_id`. **TransType was backwards** in original implementation — corrected:

- **Sales (Order Delivered):** `TransTypeId = Credit (2)` → adds to `total_credit` (money in)
- **Purchases (Purchase Delivered):** `TransTypeId = Debit (1)` → adds to `total_debit` (money out)
- `balance = total_credit - total_debit` = Sales − Purchases (positive for profitable month)

## Verification checklist ✅

- [x] Posted purchase appears in `total_purchases` for the correct month (`trans_category_id = 2`)
- [x] Supplier balance in `v_client_balance` reflects correct sign (positive = we owe them)
- [x] `v_monthly_credit_debit` balance is positive for profitable months (Sales > Purchases)
- [x] Naming/id alignment resolved — view uses `trans_category_id`, no `Purchase` vs `Purchases` drift
