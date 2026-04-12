# Purchases — cross-cutting risks and business fit

**Status: ✅ Resolved** — All identified risks mitigated during implementation.

This doc focuses on **procurement-specific** risks. Whole-system impact (ledger, views, stock service, two screens) is shared with [`../orders-sprint/06-cross-cutting-risks-and-business-fit.md`](../orders-sprint/06-cross-cutting-risks-and-business-fit.md).

## 1. Same blast-radius areas, different direction ✅

| Area | Resolution |
|------|------------|
| **`transactions` + views** | P&L `total_purchases` fixed — uses `trans_category_id = 2` (id-based, no name drift). See [03](./03-reporting-and-views-alignment.md). |
| **`StockMovementsService`** | `MovementSource = Purchase (1)` → auto In; weighted avg cost logic lives entirely in `StockMovementsService.CreateAsync` — not duplicated. |
| **`Client` type** | `PurchaseService.CreateAsync` validates `ClientTypeId = 2`; clear error if wrong type. |
| **Traceability** | `Transaction.PurchaseId` FK wired + navigation configured; every ledger row links back to its purchase. |

## 2. Purchases-specific risks — resolved ✅

| Risk | Resolution |
|------|------------|
| **Status workflow** | `PurchaseStatus` entity + seeded ids 1–4; Delivered posting guarded by idempotency check |
| **Weighted average cost** | Validated: idempotency guard prevents double-posting; `UnitCost` validated > 0 per line |
| **Supplier balance sign** | `v_client_balance` confirmed correct — raw amount sum, positive = we owe supplier; Delivered posts `Amount = +total` |
| **TransType backwards** | Fixed: Purchases → `TransTypeId = Debit (1)`, not Credit. `v_monthly_credit_debit` now shows correct balance. |
| **Greenfield deploy** | All seeds and migrations in repo; `dotnet run` bootstraps a clean DB correctly — see [08](./08-seed-correction-and-greenfield-deployment.md) |

## 3. Business fit checklist (procurement) ✅

| # | Question | Answer |
|---|----------|--------|
| 1 | Is **receive = record** acceptable, or do you need **draft POs** first? | Receive = record is fine; Pending status serves as draft |
| 2 | Must **P&L purchases** match **operational** purchase totals? | Yes — ensured via `trans_category_id = 2` on Delivered |
| 3 | Can staff **delete** purchases after posting, or only **reverse** with audit? | Delete blocked after Delivered; Cancelled reversal flow used instead |

## 4. Backlog items — completed or deferred

- [x] Aligned `v_monthly_profit_loss` with `TransCategory` id **2** (id-based)
- [x] `transactions.purchase_id` FK + navigation wired
- [x] `GET /api/Purchase/me` implemented (staff parity with orders)
- [x] Delete vs reversal policy documented and enforced in `PurchaseService`
- [ ] `stock_movements.purchase_id` optional FK — deferred (low priority; traceability already via `transactions.purchase_id`)

## Related docs

- [`08-seed-correction-and-greenfield-deployment.md`](./08-seed-correction-and-greenfield-deployment.md), [`09-purchase-status-workflow.md`](./09-purchase-status-workflow.md).
- Tracker: [`todo/03-purchases.md`](../../../todo/03-purchases.md).
