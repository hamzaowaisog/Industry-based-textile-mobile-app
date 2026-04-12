# Purchases epic — implementation kickoff (start coding)

Bridge to [`todo/03-purchases.md`](../../../todo/03-purchases.md) and [`backend/HamzaTex.Api`](../../../backend/HamzaTex.Api).

## Preconditions

- **Orders** patterns: `Response<T>`, **Delivered**-style posting, **`Transaction.OrderId`** usage — mirror for **`Transaction.PurchaseId`**.
- **Two screens** (Orders vs Purchases): [`../orders-sprint/06-cross-cutting-risks-and-business-fit.md`](../orders-sprint/06-cross-cutting-risks-and-business-fit.md).

## What we fix first (causes)

| Priority | Work |
|----------|------|
| 1 | **Schema:** `purchase_statuses` + **`purchases.status_id`** + confirm **`transactions.purchase_id`** FK in migrations ([09](./09-purchase-status-workflow.md)). |
| 2 | **Seed + views:** canonical **`trans_categories`** and **`v_monthly_profit_loss`** (id- or name-based) per [08](./08-seed-correction-and-greenfield-deployment.md) and [03](./03-reporting-and-views-alignment.md). |
| 3 | **Ledger convention:** supplier **`Amount`** / types aligned with orders. |
| 4 | **`PurchaseService`:** status transitions; **Delivered** → stock + `transactions` with **`PurchaseId`**. |
| 5 | **Controller** + Meta (`PurchaseStatuses`) + PDF + DI. |

## Suggested coding sequence

1. EF migration: **`PurchaseStatus`** entity, **`DbSet`**, seed, **`Purchase.StatusId`**, FK **`Transaction.PurchaseId`** if not already migrated.
2. **`LookupService` / `Meta/all`:** expose purchase statuses (mirror order statuses).
3. View fix for P&L **Purchase** bucket if still mismatched ([03](./03-reporting-and-views-alignment.md)).
4. DTOs / ViewModels / Validation (include **`StatusId`**).
5. **`PurchaseService`:** create as **Pending**; **Update** to **Delivered** runs movements + ledger; **Cancelled** reversals.
6. **`PurchaseController`**; `EntityPdfConfigs`; `Program.cs`.

## Greenfield server deploy

Migrations + **`SeedData`** produce a correct DB from empty—no reliance on local-only fixes ([08](./08-seed-correction-and-greenfield-deployment.md)).

## Out of scope unless requested

Full **Payments** to suppliers, full **Transactions** CRUD, **sync**.

## Related

- [`01`](./01-business-context-procurement.md)–[`06`](./06-cross-cutting-risks-and-business-fit.md), [`08`](./08-seed-correction-and-greenfield-deployment.md), [`09`](./09-purchase-status-workflow.md).
- Orders kickoff: [`../orders-sprint/07-implementation-kickoff.md`](../orders-sprint/07-implementation-kickoff.md).
