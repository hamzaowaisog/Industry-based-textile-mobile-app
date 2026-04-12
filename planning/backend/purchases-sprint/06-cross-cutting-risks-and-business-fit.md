# Purchases — cross-cutting risks and business fit

This doc focuses on **procurement-specific** risks. Whole-system impact (ledger, views, stock service, two screens) is shared with [`../orders-sprint/06-cross-cutting-risks-and-business-fit.md`](../orders-sprint/06-cross-cutting-risks-and-business-fit.md).

## 1. Same blast-radius areas, different direction

| Area | Purchases-specific note |
|------|-------------------------|
| **`transactions` + views** | P&L **total_purchases** uses category name **`Purchase`** in SQL vs seed **`Purchases`** — must align ([03](./03-reporting-and-views-alignment.md)). |
| **`StockMovementsService`** | **`MovementSource = Purchase (1)`** → **In**; drives **average cost** — errors hit **margins** and inventory valuation. |
| **`Client` type** | **Supplier (2)** only; wrong type breaks business rules. |
| **Traceability** | No **`purchase_id`** on movements/transactions yet — same audit gap as orders. |

## 2. Purchases-specific gaps

| Gap | Risk |
|-----|------|
| **Status workflow** | Addressed by **`PurchaseStatus`** + **Delivered** posting ([09](./09-purchase-status-workflow.md)); avoids posting on create by mistake. |
| **Weighted average cost** | Incorrect `UnitCost` or double **Delivered** post skews **AverageCost** — validate lines and idempotency. |
| **Supplier balance** | Wrong sign on `Transaction.Amount` breaks **`v_client_balance`**. |
| **Greenfield deploy** | Rely on **seeds + migrations in repo**, not manual DB hacks — [08](./08-seed-correction-and-greenfield-deployment.md). |

## 3. Business fit checklist (procurement)

| # | Question |
|---|----------|
| 1 | Is **receive = record** acceptable, or do you need **draft POs** first? |
| 2 | Must **P&L purchases** match **operational** purchase totals? |
| 3 | Can staff **delete** purchases after posting, or only **reverse** with audit? |

## 4. Suggested backlog highlights

- [ ] Align **`v_monthly_profit_loss`** with **`TransCategory`** id **2** or name **`Purchases`**.
- [ ] Optional: **`purchase_id`** on `stock_movements` / `transactions`.
- [ ] Optional: **`GET /api/Purchase/me`** (or filtered scoping) for staff parity with orders.
- [ ] Document **delete vs reversal** policy in `PurchaseService`.

## Related docs

- [`08-seed-correction-and-greenfield-deployment.md`](./08-seed-correction-and-greenfield-deployment.md), [`09-purchase-status-workflow.md`](./09-purchase-status-workflow.md).
- Tracker: [`todo/03-purchases.md`](../../../todo/03-purchases.md).
