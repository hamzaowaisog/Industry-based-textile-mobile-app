# Purchase status + `Transaction.PurchaseId` (order-style workflow)

**Status: ✅ Implemented** — Full status lifecycle live, ledger posting confirmed correct.

Purchases follow the **same lifecycle pattern as orders**: a **status** table seeded with stable ids, **`Purchase.StatusId`** FK, and **stock + ledger** only when goods are finalized (Delivered).

## `Transaction.PurchaseId` ✅

[`Transaction`](../../../backend/HamzaTex.Api/Entities/Transaction.cs) includes:

- **`PurchaseId`** (nullable FK → `purchases`) — set on every purchase-generated ledger row
- Index `IX_transactions_purchase_id` — fast idempotency lookups
- Navigation `Transaction → Purchase` wired in `ApplicationDbContext.OnModelCreating` (`FK_transactions_purchases_PurchaseId`)
- Navigation `Transaction → Order` also wired at the same time (was missing)
- `Purchase.Transactions` collection added to entity (needed for `WithMany`)

## `purchase_statuses` ✅ (mirror `order_statuses`)

Entity [`PurchaseStatus`](../../../backend/HamzaTex.Api/Entities/PurchaseStatus.cs) — same shape as `OrderStatus`: `Id`, `Name`, `CreatedAt`, `ICollection<Purchase>`.

### Seeded ids

| Id | Name | Procurement meaning |
|----|------|---------------------|
| 1 | Pending | PO raised / draft; **no stock, no ledger** |
| 2 | InProgressed | In transit or partial processing |
| 3 | Delivered | **Goods received** — run stock In + post `Transaction` here |
| 4 | Cancelled | No receipt; reverse if previously Delivered |

**UI label note:** Frontend may show "Received" for id 3 while the stored name stays `Delivered` for consistency with `OrderStatus` and shared meta handling.

### Meta / API ✅

- `GET /api/Meta/purchasestatuses` and `purchase-statuses` → returns `IEnumerable<PurchaseStatusDto>`
- `GET /api/Meta/all` → includes `PurchaseStatuses` in `LookupsAllDto`
- `ILookupService.GetPurchaseStatusesAsync()` added + registered

## Workflow ✅

```
Pending (1) → InProgressed (2) → Delivered (3)
                              ↘ Cancelled (4)
Pending (1) ──────────────────→ Cancelled (4)
```

- **Create:** defaults to `StatusId = Pending (1)`. No `StockMovement`, no `Transaction`.
- **Transition to Delivered (3):** atomic DB transaction — idempotency check → `StockMovementsService` per line (`MovementSource=1`) → single `Transaction` with `PurchaseId`, `TransTypeId=1 (Debit)`, `TransCategoryId=2`, `Amount=+total`.
- **Transition to Cancelled (4):** if previously Delivered → per-line Manual Out + compensating `Transaction` (`TransTypeId=2 (Credit)`, `Amount=-total`, same `PurchaseId`). If never Delivered → status update only.

**Date fields:** `PurchaseDate` is the document date; `MovementDate` / `TransDate` align with the Delivered transition timestamp.

## Migrations ✅

| Migration | Change |
|-----------|--------|
| `AddPurchaseStatusAndStatusId` | `purchase_statuses` table, `purchases.status_id` FK, `Transaction → Order/Purchase` FKs wired |

## Related

- Ledger detail: [04-ledger-posting-rules.md](./04-ledger-posting-rules.md)
- Kickoff: [07-implementation-kickoff.md](./07-implementation-kickoff.md)
- Seed + deploy: [08-seed-correction-and-greenfield-deployment.md](./08-seed-correction-and-greenfield-deployment.md)
