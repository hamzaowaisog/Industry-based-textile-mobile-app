# Purchases — business context (procurement / buying)

**Status: ✅ Implemented** — See [`todo/03-purchases.md`](../../../todo/03-purchases.md) for full completion record.

## What a "purchase" is in HamzaTex

A **purchase** is **buying stock** from a **supplier** (`Client` with **Supplier** type). The system records:

- **Who** you buy from (`SupplierId` → `Client` where `ClientTypeId = 2`).
- **What** you bought (`PurchaseLine`: product, quantity, **unit cost**).
- **When** (`PurchaseDate`).
- **How** payment is expected (`PaymentType`: cash vs credit — same lookup as orders).

This is the mirror of **sales orders** but with **stock In** and **cost** focus, not selling price.

## UI alignment (locked)

The product uses a **dedicated Purchases screen**, separate from **Orders** ([`../orders-sprint/06-cross-cutting-risks-and-business-fit.md`](../orders-sprint/06-cross-cutting-risks-and-business-fit.md)).

## Lifecycle (implemented)

Purchases use **`PurchaseStatus`** and **`Purchase.StatusId`**, seeded with stable ids like **`OrderStatus`**:

```
Pending (1) → InProgressed (2) → Delivered (3)
                              ↘ Cancelled (4)
```

**Stock In** and **ledger posting** occur on transition to **Delivered** (goods received), not on first save — implemented in `PurchaseService.TransitionToDelivered`.

## Cash vs credit (suppliers)

- **Cash:** `TransModeId = Cash (1)` posted on Delivered.
- **Credit:** `TransModeId = Credit (3)` posted on Delivered — amount owed to supplier (payable) until the Payments epic clears it.

## Relationship to inventory

Purchases **increase** stock and update **weighted average cost** via `StockMovementsService.CreateAsync(MovementSource=1)` — logic lives entirely in the stock service, not duplicated in `PurchaseService`.

## Relationship to reporting

Monthly P&L **purchase totals** come from **`transactions`** (`trans_category_id = 2`), not from `purchases` rows alone. `v_monthly_profit_loss` uses id-based matching — no name drift risk.
