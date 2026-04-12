# Purchases — reporting and database views

## Views involved

### `v_monthly_profit_loss`

[`UpdateMonthlyProfitLossView`](../../../backend/HamzaTex.Api/Migrations/20260204131656_UpdateMonthlyProfitLossView.cs) buckets **purchase spend** with:

```sql
SUM(CASE WHEN tt.name = 'Purchase' THEN t.amount ELSE 0 END)
```

**Seeded category** in [`SeedData`](../../../backend/HamzaTex.Api/Data/SeedData.cs): id **2**, name **`Purchases`** (plural).

Same class of bug as sales: **view says `Purchase`, seed says `Purchases`**. Fix in the **same spirit** as orders: align view SQL, or rename seed, or filter by **`trans_category_id = 2`**.

### `v_client_balance`

Sums **`transactions.amount`** per **`client_id`**. Supplier rows affect the **supplier’s** balance (payables vs prepayments depending on sign convention). Define **one convention** in [04-ledger-posting-rules.md](./04-ledger-posting-rules.md) and match **Orders** posting docs so finance does not flip meaning between customer and supplier.

## Line-level vs header-level posting

Choose one approach and mirror **orders** if possible: one `Transaction` per purchase (header total) vs one per line (product-level `ProductId` on `Transaction`).

## Verification checklist

- [ ] Posted purchase appears in **`total_purchases`** for the correct month.
- [ ] Supplier balance in **`v_client_balance`** matches expectations for cash vs credit sample rows.
- [ ] Naming/id alignment resolved (`Purchase` vs `Purchases`).

## Related

On **greenfield deploy**, seeds + view definitions in migrations must match — [08-seed-correction-and-greenfield-deployment.md](./08-seed-correction-and-greenfield-deployment.md).
