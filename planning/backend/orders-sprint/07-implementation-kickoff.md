# Orders sprint — implementation kickoff (start coding)

This doc records **what we agreed after reading the pack** and the **order of work** to begin implementation. It is the bridge from planning to [`todo/02-orders.md`](../../../todo/02-orders.md) and code in [`backend/HamzaTex.Api`](../../../backend/HamzaTex.Api).

---

## Validated planning (not superficial)

The team reviewed [`01`](./01-business-context-textile.md)–[`06`](./06-cross-cutting-risks-and-business-fit.md). **Gaps and high-impact areas** in `06` are accepted as the real constraints: we are not treating symptoms in isolation—we implement against **ledger + views + stock service** together so inventory, P&L, and client balances stay coherent.

---

## Product decisions (locked)

| Decision | Choice |
|----------|--------|
| **Sales vs procurement in the UI** | **Two separate screens**: one for **Orders** (sales to customers), one for **Purchases** (buying from suppliers). This matches the backend split (`Order` / `OrderLine` vs `Purchase` / `PurchaseLine`) and avoids mixing client types or stock directions in one form. |
| **Purchases implementation timing** | Purchases remain its own epic ([`todo/03-purchases.md`](../../../todo/03-purchases.md)); the **Orders sprint** delivers the sales API and related behavior first. Mobile can mirror the same split when built. |

---

## What we fix first (causes, not patches)

| Priority | Work | Why |
|----------|------|-----|
| 1 | **Reporting alignment** | Fix `v_monthly_profit_loss` vs seeded **`Sales`** / view filter **`Sale`** (or use `trans_category_id`) per [03](./03-reporting-and-views-alignment.md)—otherwise ledger posting from orders still will not show correctly in P&L. |
| 2 | **Ledger convention** | Define and document **`Transaction.Amount`** sign and `TransTypeId` usage so [`v_client_balance`](../../../backend/HamzaTex.Api/Migrations/20251215131335_AddViews.cs) matches finance expectations—before or in the same PR as first posting code. |
| 3 | **Order domain code** | DTOs, validation, `OrderService` with **`IStockMovementsService`** only for movement math; posting + **Delivered** transition in one DB transaction per [04](./04-ledger-posting-rules.md). |
| 4 | **`OrderController`** + PDF + `Program.cs` registration | Per [05](./05-api-and-service-outline.md) and [`todo/02-orders.md`](../../../todo/02-orders.md). |
| 5 | **Tests / manual checks** | Delivered order → stock out + `transactions` → spot-check views; cancel after Delivered → reversals. |

Optional follow-ups (do not block first vertical slice unless audit requires): nullable **`order_id`** on `transactions` / `stock_movements` ([`02`](./02-data-model-and-db-impact.md)).

---

## Suggested coding sequence (backend)

1. Migration or SQL update for **views** + verify against seed data (can be step 1 in its own small PR).
2. **`OrderDto` / ViewModels / Validation`** — mirror existing feature style (`Client`, `Product`).
3. **`OrderService`** — create/list/filter/update/delete; **status transition to Delivered** runs stock + ledger; idempotent posting.
4. **`OrderController`** — routes and policies from [`todo/02-orders.md`](../../../todo/02-orders.md).
5. **`EntityPdfConfigs`** + Swagger smoke test.

Parallel track (separate PR/epic): **Purchases** service/controller when this sprint’s order slice is stable.

---

## Related

- Full checklist: [`todo/02-orders.md`](../../../todo/02-orders.md).
- Cross-cutting context: [`06`](./06-cross-cutting-risks-and-business-fit.md).
