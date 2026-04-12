# Purchases — business context (procurement / buying)

## What a “purchase” is in HamzaTex

A **purchase** is **buying stock** from a **supplier** (`Client` with **Supplier** type). The system records:

- **Who** you buy from (`SupplierId` → `Client` where `ClientTypeId = 2`).
- **What** you bought (`PurchaseLine`: product, quantity, **unit cost**).
- **When** (`PurchaseDate`).
- **How** payment is expected (`PaymentType`: cash vs credit — same lookup as orders).

This is the mirror of **sales orders** but with **stock In** and **cost** focus, not selling price.

## UI alignment (locked)

The product uses a **dedicated Purchases screen**, separate from **Orders** ([`../orders-sprint/06-cross-cutting-risks-and-business-fit.md`](../orders-sprint/06-cross-cutting-risks-and-business-fit.md)).

## Lifecycle (target — same routine as orders)

Purchases will use **`PurchaseStatus`** and **`Purchase.StatusId`**, seeded like **`OrderStatus`** (Pending → InProgressed → **Delivered** → Cancelled). **Stock In** and **ledger posting** occur on transition to **Delivered** (goods received), not on first save—see [09-purchase-status-workflow.md](./09-purchase-status-workflow.md). Until that migration lands, legacy behavior may still be “post on create”; align implementation with **09** as the source of truth.

## Cash vs credit (suppliers)

- **Cash:** payment at purchase or on delivery — affects how you post `TransModeId` and cash/bank movements when the Payments epic exists.
- **Credit:** amount owed to supplier (payable) until payment records clear it — `transactions` + future **Payments** must stay consistent.

## Relationship to inventory

Purchases **increase** stock and update **weighted average cost** via `StockMovementsService` — never duplicate that logic in `PurchaseService`.

## Relationship to reporting

Monthly P&L **purchase totals** come from **`transactions`** (category **Purchases**), not from `purchases` rows alone — see [03-reporting-and-views-alignment.md](./03-reporting-and-views-alignment.md).
